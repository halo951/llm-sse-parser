export class SSEParser<T> extends AbortController {
    private stream!: ReadableStream<Uint8Array>
    private reader?: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>
    private encoding!: string
    // 定义三个回调函数
    private _writer?: (data: T) => void
    private _capture?: (error: any) => void
    private _finish?: () => void

    constructor(stream: ReadableStream<Uint8Array>, encoding: string = 'UTF-8') {
        super()
        this.encoding = encoding
        this.stream = stream
        this.signal.onabort = (): void => {
            this.reader?.cancel()
        }
    }

    /** 设置输出回调 */
    writer(handler: (raw: T) => void): this {
        this._writer = handler
        return this
    }

    /** 设置错误捕获回调 */
    capture(handler: (error: any) => void): this {
        this._capture = handler
        return this
    }

    /** 设置完成回调 */
    finish(handler: () => void): this {
        this._finish = handler
        return this
    }

    /** 接收流数据 */
    async revice(): Promise<void> {
        const textDecoder = new TextDecoder(this.encoding)
        try {
            this.reader = this.stream.getReader()
            let source: string = ''
            /** 从缓冲区内, 匹配raw */
            const match = (position: number = 0): void => {
                const delimiter = '\n\n'
                const end = source.indexOf(delimiter, position)
                if (end === -1) {
                    return
                }
                const text = source
                    .slice(0, end + delimiter.length)
                    .replace(/^data:/, '')
                    .trim()
                /** 由于prompt存在一定的不稳定的情况, 这里增加一定的兼容处理 */
                if (/['"]{0,1}\[DONE\]['"]{0,1}/.test(text)) return
                let raw: T
                try {
                    raw = JSON.parse(text.trim().replace(/^data:/, ''))
                    source = source.slice(end + delimiter.length)
                } catch (_) {
                    console.warn('parse fail raw.', text)
                    // 如果未匹配到完整JSON对象, 则从当前位置向后匹配, 直到匹配不到为止.
                    return match(end)
                }
                this._writer?.(raw)
                // 匹配下一个记录
                match()
            }
            // 遍历异步数据流
            while (true) {
                const data = await this.reader.read()
                const { value, done } = data
                if (done || this.signal.aborted) {
                    break
                }
                // 将 Uint8Array 转换为文本, 并附加到缓冲区
                const chars = textDecoder.decode(value)
                source += chars
                match()
            }
        } catch (error) {
            if (this._capture) {
                this._capture(error)
            }
        } finally {
            this._finish?.()
        }
    }
}

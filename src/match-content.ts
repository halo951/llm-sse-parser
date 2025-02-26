/** match message content with ignore `<think>...</think>` */
export const matchContent = (content: string): string => {
    if ((content.includes('<think>') && !content.includes('</think>')) || '</think>'.includes(content)) {
        return ''
    }
    const lastIndex = content.lastIndexOf('</think>')
    if (lastIndex === -1) {
        return content
    }
    return content.slice(lastIndex + 8)
}

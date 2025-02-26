/** match think */
export const matchThink = (content: string): string | undefined => {
    if (!content.includes('<think>')) return
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    return doc.querySelector('think')?.innerHTML
}

export function replaceAt(text: string, index: number, replacement: string) {
    return text.substring(0, index) + replacement + text.substring(index + replacement.length);
}
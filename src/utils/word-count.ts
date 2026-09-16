/** Count whitespace-separated words without changing the original message. */
export function countWords(value: string): number {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/u).length : 0;
}

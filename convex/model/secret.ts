/**
 * Compares a presented secret with the expected one in time that does not
 * depend on where they first differ, so timing reveals nothing but length.
 */
export function isSameSecret(presented: string, expected: string): boolean {
  const presentedBytes = new TextEncoder().encode(presented)
  const expectedBytes = new TextEncoder().encode(expected)
  if (presentedBytes.length !== expectedBytes.length) {
    return false
  }
  const difference = expectedBytes.reduce(
    (bits, byte, index) => bits | (byte ^ (presentedBytes[index] ?? 0)),
    0,
  )
  return difference === 0
}

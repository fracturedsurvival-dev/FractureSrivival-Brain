// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function checkSafety(_text: string): { status: 'OK' | 'FLAGGED'; reason: string } {
  const flagged = Math.random() < 0.2; // 20% chance to flag
  return flagged
    ? { status: 'FLAGGED', reason: 'Random simulated flag' }
    : { status: 'OK', reason: 'Clean' };
}

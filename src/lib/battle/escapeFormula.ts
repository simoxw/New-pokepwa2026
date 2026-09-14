/**
 * Official Pokemon Gen 3 / Gen 4 wild flee calculation.
 * 
 * Formula:
 * F = Math.floor((playerSpeed * 128) / B) + 30 * attempts
 * where B = Math.floor(enemySpeed / 4) % 256.
 * If B is 0, B is treated as 1 to avoid division by zero.
 * 
 * If F > 255, escape is 100% guaranteed.
 * Otherwise, roll a random number 0-255. If roll < F, escape succeeds.
 */
export function calculateEscape(
  playerEffectiveSpeed: number,
  enemyEffectiveSpeed: number,
  attempts: number = 1
): { success: boolean; odds: number; msg: string } {
  const safeAttempts = Math.max(1, attempts);
  const B = Math.max(1, Math.floor(enemyEffectiveSpeed / 4) % 256);
  const F = Math.floor((playerEffectiveSpeed * 128) / B) + (30 * safeAttempts);

  if (F > 255) {
    return {
      success: true,
      odds: 1,
      msg: 'Scampato pericolo!'
    };
  }

  const roll = Math.floor(Math.random() * 256);
  const success = roll < F;

  return {
    success,
    odds: Math.min(1, Math.max(0, F / 256)),
    msg: success ? 'Scampato pericolo!' : 'Non sei riuscito a fuggire!'
  };
}

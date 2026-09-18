import { Pokemon, Move, BattleStages, StatusCondition } from '../../types/game';
import { calculateDamage } from './battleMath';
import { STRUGGLE_MOVE } from '../pokeapi';

export function selectEnemyMove(
  enemyMoves: Move[],
  enemy: Pokemon,
  playerActive: Pokemon,
  enemyStatus: { status?: StatusCondition },
  playerStatus: { status?: StatusCondition },
  enemyStages: BattleStages,
  playerStages: BattleStages,
  enemyHp: number,
  playerHp: number
): Move {
  const validMoves = enemyMoves.filter(m => (m.pp ?? m.maxPp ?? 35) > 0);
  if (validMoves.length === 0) return STRUGGLE_MOVE;

  // Score moves
  const scoredMoves = validMoves.map(move => {
    let score = 50; // Base score

    // Type effectiveness
    const eff = calculateDamage(
      { ...enemy, status: enemyStatus.status },
      { ...playerActive, status: playerStatus.status },
      move,
      { attackerStages: enemyStages, targetStages: playerStages }
    ).effectiveness;
    
    score += (eff - 1) * 40;

    // Status moves
    if (move.category === 'status') {
      if (move.statusEffect && playerStatus.status) score -= 40; // Already has status
      if (move.healing && enemyHp / enemy.maxHp > 0.7) score -= 30; // High HP, don't heal
      if (move.stat_changes && move.stat_changes.some(s => s.change > 0)) {
        // Buffing moves
        if (enemyHp / enemy.maxHp < 0.3) score -= 20; // Low HP, better attack
      }
    }

    // Priority moves if player is low HP
    if (move.priority && playerHp / playerActive.maxHp < 0.2) score += 20;

    // Random factor
    score += Math.random() * 10;

    return { move, score };
  });

  scoredMoves.sort((a, b) => b.score - a.score);
  return scoredMoves[0].move;
}

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

  const enemyHpPercent = enemyHp / enemy.maxHp;
  const playerHpPercent = playerHp / playerActive.maxHp;

  // Score moves intelligently
  const scoredMoves = validMoves.map(move => {
    let score = 50; // Base score

    // Calculate actual predicted damage & effectiveness
    const dmgRes = calculateDamage(
      { ...enemy, status: enemyStatus.status },
      { ...playerActive, status: playerStatus.status },
      move,
      { attackerStages: enemyStages, targetStages: playerStages }
    );

    const predictedDamage = dmgRes.damage;
    const eff = dmgRes.effectiveness;

    // 1. KNOCKOUT OPPORTUNITY: If this move can faint the player, prioritize heavily!
    if (move.category !== 'status' && predictedDamage >= playerHp) {
      score += 150;
    }

    // 2. TYPE EFFECTIVENESS & IMMUNITY
    if (move.category !== 'status') {
      if (eff === 0) {
        // Never use a damaging move against an immune target
        score -= 150;
      } else if (eff > 1) {
        score += eff * 35; // Super effective bonus
      } else if (eff < 1) {
        score -= 30; // Not very effective penalty
      }

      // STAB (Same-Type Attack Bonus) bonus weighting
      if (enemy.types.some(t => t.toLowerCase() === move.type.toLowerCase())) {
        score += 15;
      }

      // High power move preference
      score += (move.power ?? 0) * 0.15;
    }

    // 3. STATUS MOVES & DEBUFFS
    if (move.category === 'status') {
      if (move.statusEffect) {
        if (playerStatus.status) {
          // Player already has a primary status condition
          score -= 80;
        } else if (playerHpPercent > 0.4) {
          // Induce status when player is healthy
          score += 35;
        }
      }

      // Healing moves
      if (move.healing && move.healing > 0) {
        if (enemyHpPercent < 0.45) {
          score += 60; // Desperately needs healing
        } else if (enemyHpPercent > 0.8) {
          score -= 60; // Waste of a turn to heal when nearly full
        }
      }

      // Stat Boosting moves (Self)
      if (move.stat_changes && move.stat_changes.some(s => s.change > 0)) {
        if (enemyHpPercent > 0.6) {
          score += 25; // Good time to setup
        } else if (enemyHpPercent < 0.35) {
          score -= 35; // Low HP, better to attack or heal
        }
      }

      // Stat Lowering moves (Target)
      if (move.stat_changes && move.stat_changes.some(s => s.change < 0)) {
        if (playerHpPercent > 0.5) {
          score += 15;
        } else {
          score -= 20; // Finishing them off is better
        }
      }
    }

    // 4. PRIORITY MOVES
    if (move.priority && move.priority > 0) {
      if (playerHpPercent < 0.25) {
        score += 40; // Finish off low HP opponent before they can strike
      } else if (enemyHpPercent < 0.2) {
        score += 20; // Emergency quick hit before fainting
      }
    }

    // 5. SMALL RANDOMNESS (prevents 100% predictable repetitive loops)
    score += Math.random() * 8;

    return { move, score };
  });

  scoredMoves.sort((a, b) => b.score - a.score);
  return scoredMoves[0].move;
}

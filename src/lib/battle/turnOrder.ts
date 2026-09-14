import { Move } from '../../types/game';

export interface CombatantAction {
  combatant: 'player' | 'enemy';
  move: Move;
  effectiveSpeed: number;
  priority: number;
}

/**
 * Determines initiative / turn order based on Move Priority and Effective Speed.
 * 
 * Rules:
 * 1. Move Priority: Moves with higher priority act first (e.g. +1 for Quick Attack / Attacco Rapido, +2 for Extreme Speed).
 * 2. Effective Speed: If priorities are equal, the combatant with higher effective speed acts first.
 *    (Effective speed includes stage multipliers and paralysis 50% penalty).
 * 3. Speed Tie: If priorities and speeds are equal, a 50% random coin flip decides who goes first.
 */
export function determineTurnOrder(
  playerAction: CombatantAction,
  enemyAction: CombatantAction
): 'player' | 'enemy' {
  // 1. Compare Move Priority
  if (playerAction.priority > enemyAction.priority) {
    return 'player';
  }
  if (playerAction.priority < enemyAction.priority) {
    return 'enemy';
  }

  // 2. Compare Effective Speeds
  if (playerAction.effectiveSpeed > enemyAction.effectiveSpeed) {
    return 'player';
  }
  if (playerAction.effectiveSpeed < enemyAction.effectiveSpeed) {
    return 'enemy';
  }

  // 3. Speed Tie
  return Math.random() < 0.5 ? 'player' : 'enemy';
}

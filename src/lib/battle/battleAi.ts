import { Pokemon, Move, BattleStages, StatusCondition } from '../../types/game';
import { calculateDamage } from './battleMath';
import { STRUGGLE_MOVE } from '../pokeapi';
import { VolatileStatus } from './statusEffects';
import { getResolvedCoreAbilityKey, isAbilityImmuneToSleep } from './abilities';

/**
 * Determines whether an Elite Four, Champion, or Legendary Boss trainer
 * will use a Full Restore (Ricarica Totale) on their active Pokémon.
 *
 * Rules:
 * - Must be an Elite trainer (Superquattro, Campione, or Legendary Boss)
 * - Must have heals remaining (max 4 per battle)
 * - Enemy Pokémon HP must be <= 20% of maxHp
 * - 30% chance to activate on that turn
 */
export function shouldEnemyUseFullRestore(
  isEliteOrBoss: boolean,
  enemyHp: number,
  enemyMaxHp: number,
  enemyHealsRemaining: number
): boolean {
  if (!isEliteOrBoss) return false;
  if (enemyHealsRemaining <= 0) return false;
  if (enemyHp <= 0 || enemyMaxHp <= 0) return false;

  const hpPercent = enemyHp / enemyMaxHp;
  if (hpPercent <= 0.20) {
    return Math.random() < 0.30;
  }

  return false;
}

export function selectEnemyMove(
  enemyMoves: Move[],
  enemy: Pokemon,
  playerActive: Pokemon,
  enemyStatus: { status?: StatusCondition },
  playerStatus: { status?: StatusCondition },
  enemyStages: BattleStages,
  playerStages: BattleStages,
  enemyHp: number,
  playerHp: number,
  enemyVolatile: VolatileStatus = {},
  playerVolatile: VolatileStatus = {}
): Move {
  const validMoves = enemyMoves.filter(m => (m.pp ?? m.maxPp ?? 35) > 0);
  if (validMoves.length === 0) return STRUGGLE_MOVE;

  const enemyHpPercent = enemyHp / enemy.maxHp;
  const playerHpPercent = playerHp / playerActive.maxHp;
  const playerTypes = (playerActive.types || []).map(t => t.toLowerCase());

  const playerAbilityKey = getResolvedCoreAbilityKey(playerActive);
  const playerSleepImmune = isAbilityImmuneToSleep(playerActive);

  const isBlockedByPlayerAbility = (m: Move): boolean => {
    const mType = (m.type || '').toLowerCase();
    const isTargetingOpponent =
      m.target !== 'user' &&
      m.target !== 'entire-field' &&
      m.target !== 'users-field' &&
      m.target !== 'opponents-field';

    if (m.category !== 'status') {
      if (playerAbilityKey === 'levitazione' && mType === 'ground') return true;
      if (playerAbilityKey === 'assorbacqua' && mType === 'water') return true;
      if (playerAbilityKey === 'fuocardore' && mType === 'fire') return true;
      if ((playerAbilityKey === 'parafulmine' || playerAbilityKey === 'assorbivolt') && mType === 'electric') return true;
      if (playerAbilityKey === 'mangiaerba' && mType === 'grass') return true;
      return false;
    }

    if (!isTargetingOpponent) return false;
    if (playerAbilityKey === 'assorbacqua' && mType === 'water') return true;
    if (playerAbilityKey === 'fuocardore' && mType === 'fire') return true;
    if ((playerAbilityKey === 'parafulmine' || playerAbilityKey === 'assorbivolt') && mType === 'electric') return true;
    if (playerAbilityKey === 'mangiaerba' && mType === 'grass') return true;
    if (playerSleepImmune && (m.statusEffect === 'sleep' || m.name.toLowerCase() === 'sbadiglio' || m.name.toLowerCase() === 'yawn')) return true;
    return false;
  };

  // Pre-calculate effectiveness and damage for all valid damaging moves to identify best options
  const damagingMovesAnalysis = validMoves
    .filter(m => m.category !== 'status')
    .map(m => {
      const dmgRes = calculateDamage(
        { ...enemy, status: enemyStatus.status },
        { ...playerActive, status: playerStatus.status },
        m,
        { attackerStages: enemyStages, targetStages: playerStages }
      );
      const abilityImmunity = isBlockedByPlayerAbility(m);
      return { move: m, damage: abilityImmunity ? 0 : dmgRes.damage, effectiveness: abilityImmunity ? 0 : dmgRes.effectiveness };
    });

  // Check if enemy has at least one damaging move that is neutral (>= 1x) or super-effective (> 1x)
  const hasNeutralOrSuperEffectiveMove = damagingMovesAnalysis.some(
    d => d.effectiveness >= 1 && d.damage > 0
  );

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

    const abilityBlocked = isBlockedByPlayerAbility(move);
    const predictedDamage = abilityBlocked ? 0 : dmgRes.damage;
    const eff = abilityBlocked ? 0 : dmgRes.effectiveness;

    // 1. KNOCKOUT OPPORTUNITY: If this move can faint the player, prioritize heavily!
    if (move.category !== 'status' && predictedDamage >= playerHp) {
      score += 150;
    }

    // 2. TYPE EFFECTIVENESS & IMMUNITY (Proposal A + Core Ability awareness)
    if (move.category !== 'status') {
      if (eff === 0) {
        // Absolute immunity (0x damage or ability immunity) - NEVER use unless nothing else exists!
        score = -9999;
      } else if (eff > 1) {
        // Super effective (2x or 4x)
        score += eff * 40;
      } else if (eff < 1) {
        // Not very effective (0.5x or 0.25x)
        if (hasNeutralOrSuperEffectiveMove) {
          // If we have a neutral or super-effective attack, heavily discourage the resisted move!
          score -= 160;
        } else {
          // All our damaging moves are resisted: scale by damage instead of crippling
          score -= 20;
        }
      }

      // STAB (Same-Type Attack Bonus) bonus weighting
      if (enemy.types.some(t => t.toLowerCase() === move.type.toLowerCase())) {
        score += 15;
      }

      // High power move preference
      score += (move.power ?? 0) * 0.15;
    }

    // 3. STATUS MOVES, BOOSTS & DEBUFFS (Proposal D: Anti-Spam & Smart Setup)
    if (move.category === 'status') {
      const isRestMove = move.name.toLowerCase().includes('riposo') || move.name.toLowerCase().includes('rest');

      // 3A. Status Inducing moves (Sleep, Paralysis, Burn, Poison)
      if (move.statusEffect && move.target !== 'user' && !isRestMove) {
        // In Pokémon games, a Pokémon can only have ONE non-volatile status (SLP, PAR, BRN, PSN, FRZ)
        if (playerStatus.status) {
          score = -9999; // Never try to inflict status on an already afflicted target!
        } else {
          // Check elemental immunities to specific statuses
          const isElectricImmune = (move.statusEffect === 'paralyzed' || move.type.toLowerCase() === 'electric') &&
            (playerTypes.includes('electric') || playerTypes.includes('ground'));
          const isFireImmune = (move.statusEffect === 'burned' || move.type.toLowerCase() === 'fire') &&
            playerTypes.includes('fire');
          const isPoisonImmune = (move.statusEffect === 'poisoned' || move.statusEffect === 'badly-poisoned' || move.type.toLowerCase() === 'poison') &&
            (playerTypes.includes('poison') || playerTypes.includes('steel'));

          if (isElectricImmune || isFireImmune || isPoisonImmune || isBlockedByPlayerAbility(move)) {
            score = -9999; // Immune to this status condition or blocked by ability
          } else if (playerHpPercent > 0.35) {
            score += 35; // Good time to inflict status
          } else {
            score -= 30; // Target is weak, better to attack and finish them
          }
        }
      }

      // 3B. Healing moves (including Rest/Riposo, Recover, etc.)
      if (move.healing && move.healing > 0) {
        if (isRestMove && enemyStatus.status === 'sleep') {
          score = -9999; // Cannot rest while already asleep
        } else if (enemyHpPercent < 0.45) {
          score += 65; // Desperately needs healing
        } else if (enemyHpPercent > 0.8) {
          score = -9999; // Waste of a turn to heal when nearly full health
        }
      }

      // 3C. Stat Boosting moves (Self: Swords Dance, Agility, Calm Mind, etc.)
      if (move.stat_changes && move.stat_changes.some(s => s.change > 0)) {
        // Check if all affected stats are already at max (+6)
        const isAlreadyMaxed = move.stat_changes
          .filter(s => s.change > 0)
          .every(s => (enemyStages[s.stat.name as keyof BattleStages] ?? 0) >= 6);

        if (isAlreadyMaxed) {
          score = -9999; // Never use a stat boost if the stat is already capped at +6!
        } else if (enemyHpPercent < 0.35) {
          score -= 80; // Critical health: don't waste turn boosting, attack or heal!
        } else if (enemyHpPercent > 0.6) {
          // Good time to setup, but if already boosted to +2 or higher, prioritize attacking
          const positiveChanges = move.stat_changes.filter(s => s.change > 0);
          const currentStage = Math.max(
            ...positiveChanges.map(s => enemyStages[s.stat.name as keyof BattleStages] ?? 0)
          );
          if (currentStage >= 2) {
            score -= 15; // Already significantly boosted, time to strike!
          } else {
            score += 30; // Fresh setup
          }
        }
      }

      // 3D. Stat Lowering moves (Target / Player: Screech, Growl, Tail Whip, Charm, etc.)
      if (move.stat_changes && move.stat_changes.some(s => s.change < 0)) {
        // Check if all targeted stats on player are already at minimum (-6)
        const isPlayerAlreadyMin = move.stat_changes
          .filter(s => s.change < 0)
          .every(s => (playerStages[s.stat.name as keyof BattleStages] ?? 0) <= -6);

        if (isPlayerAlreadyMin) {
          score = -9999; // Cannot lower stat below -6!
        } else if (playerHpPercent <= 0.3) {
          score -= 60; // Player is almost fainted: attack to KO instead of lowering stats!
        } else if (playerHpPercent > 0.6) {
          score += 15;
        }
      }

      // 3E. Haze (Nube): smart usage when player is boosted and enemy is not heavily boosted
      const mNameLower = move.name.toLowerCase();
      if (mNameLower === 'nube' || mNameLower === 'haze') {
        const playerBoostSum = Object.values(playerStages).reduce((acc, v) => acc + Math.max(0, v || 0), 0);
        const enemyBoostSum = Object.values(enemyStages).reduce((acc, v) => acc + Math.max(0, v || 0), 0);
        const anyNonZero = [...Object.values(playerStages), ...Object.values(enemyStages)].some(v => (v || 0) !== 0);
        if (!anyNonZero || enemyBoostSum > playerBoostSum) {
          score = -9999;
        } else if (playerBoostSum >= 2) {
          score += 45;
        }
      }

      // 3E2. Yawn (Sbadiglio): don't spam if target already has status, yawn active, sleep immune, or nearly KO
      if (mNameLower === 'sbadiglio' || mNameLower === 'yawn') {
        if (playerStatus.status || playerSleepImmune || (playerVolatile.yawnTurns && playerVolatile.yawnTurns > 0)) {
          score = -9999;
        } else if (playerHpPercent <= 0.25) {
          score -= 50;
        } else {
          score += 30;
        }
      }

      // 3E3. Heal Bell / Aromatherapy (Rintoccasana / Aromaterapia): prioritize if enemy is afflicted by status
      if (
        mNameLower === 'rintoccasana' ||
        mNameLower === 'heal-bell' ||
        mNameLower === 'aromaterapia' ||
        mNameLower === 'aromatherapy'
      ) {
        if (enemyStatus.status) {
          score += 55;
        } else {
          score = -9999;
        }
      }
    }

    // 3F. Fake Out (Bruciapelo): only works on first turn on field!
    const mLower = move.name.toLowerCase();
    if (mLower === 'bruciapelo' || mLower === 'fake-out') {
      if ((enemyVolatile.turnsOnField ?? 0) > 0) {
        score = -9999;
      } else {
        score += 35;
      }
    }

    // 3G. Pivot moves (Retromarcia, Invertivolt, Virata): slight tactical preference when non-immune
    if (
      (mLower === 'retromarcia' || mLower === 'u-turn' ||
       mLower === 'invertivolt' || mLower === 'volt-switch' ||
       mLower === 'virata' || mLower === 'flip-turn') &&
      eff >= 1 &&
      enemyHpPercent > 0.35
    ) {
      score += 10;
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
    score += Math.random() * 6;

    return { move, score };
  });

  scoredMoves.sort((a, b) => b.score - a.score);
  return scoredMoves[0].move;
}

import { Pokemon, Move, BattleStages } from '../../types/game';
import { getEffectiveness } from './typeChart';
import { applyStatusStatModifiers } from './statusEffects';

export interface DamageResult {
  damage: number;
  effectiveness: number;
  isCrit: boolean;
  isStab: boolean;
}

export interface CalculateDamageOptions {
  isCrit?: boolean;
  attackerStages?: Partial<BattleStages>;
  targetStages?: Partial<BattleStages>;
}

export function getStageMultiplier(stage: number = 0): number {
  const clamped = Math.max(-6, Math.min(6, stage));
  if (clamped >= 0) {
    return (2 + clamped) / 2;
  }
  return 2 / (2 - clamped);
}

export function getAccuracyMultiplier(stage: number = 0): number {
  const clamped = Math.max(-6, Math.min(6, stage));
  if (clamped >= 0) {
    return (3 + clamped) / 3;
  }
  return 3 / (3 - clamped);
}

export function calculateDamage(
  attacker: Pokemon,
  target: Pokemon,
  move: Move,
  options: CalculateDamageOptions = {}
): DamageResult {
  // Status moves deal no direct damage
  if (move.category === 'status' || !move.power || move.power === 0) {
    return {
      damage: 0,
      effectiveness: 1,
      isCrit: false,
      isStab: false
    };
  }

  // Type Effectiveness
  const effectiveness = getEffectiveness(move.type, target.types);
  if (effectiveness === 0) {
    return {
      damage: 0,
      effectiveness: 0,
      isCrit: false,
      isStab: false
    };
  }

  // 1. Stat modifiers (Burn, Paralysis)
  const attackerStats = applyStatusStatModifiers(attacker.stats, attacker.status);
  const targetStats = applyStatusStatModifiers(target.stats, target.status);

  // 2. Base Damage calculation
  // ( ( ( (2 * Level / 5) + 2 ) * Power * A/D ) / 50 ) + 2
  const level = attacker.level;
  const power = move.power;

  const specialTypes = ['fire', 'water', 'grass', 'electric', 'ice', 'psychic', 'dragon', 'dark', 'fairy'];
  const isSpecial = move.category === 'special' || (move.category !== 'physical' && specialTypes.includes(move.type.toLowerCase()));

  const atkStage = isSpecial 
    ? (options.attackerStages?.spAtk ?? 0) 
    : (options.attackerStages?.attack ?? 0);
  const defStage = isSpecial 
    ? (options.targetStages?.spDef ?? 0) 
    : (options.targetStages?.defense ?? 0);

  const isCrit = options.isCrit ?? Math.random() < 0.0625; // 1/16 default

  // In standard Pokemon rules, critical hits ignore negative attacker stages and positive defender stages
  const effectiveAtkStage = isCrit ? Math.max(0, atkStage) : atkStage;
  const effectiveDefStage = isCrit ? Math.min(0, defStage) : defStage;

  const rawA = isSpecial ? attackerStats.spAtk : attackerStats.attack;
  const rawD = isSpecial ? targetStats.spDef : targetStats.defense;

  const A = Math.max(1, Math.floor(rawA * getStageMultiplier(effectiveAtkStage)));
  const D = Math.max(1, Math.floor(rawD * getStageMultiplier(effectiveDefStage)));

  let baseDamage = Math.floor(
    (Math.floor((Math.floor((2 * level) / 5 + 2) * power * A) / D) / 50) + 2
  );

  // 3. Critical Hit
  if (isCrit) {
    baseDamage = Math.floor(baseDamage * 1.5);
  }

  // 4. Random Factor (0.85 to 1.0)
  const random = 0.85 + Math.random() * 0.15;
  baseDamage = Math.floor(baseDamage * random);

  // 5. STAB (Same Type Attack Bonus)
  const isStab = attacker.types.includes(move.type.toLowerCase());
  if (isStab) {
    baseDamage = Math.floor(baseDamage * 1.5);
  }

  // 6. Apply Effectiveness
  baseDamage = Math.floor(baseDamage * effectiveness);

  return {
    damage: Math.max(1, baseDamage),
    effectiveness,
    isCrit,
    isStab
  };
}

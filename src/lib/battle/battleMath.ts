import { Pokemon, Move } from '../../types/game';
import { getEffectiveness } from './typeChart';
import { applyStatusStatModifiers } from './statusEffects';

export interface DamageResult {
  damage: number;
  effectiveness: number;
  isCrit: boolean;
  isStab: boolean;
}

export function calculateDamage(
  attacker: Pokemon,
  target: Pokemon,
  move: Move,
  options: { isCrit?: boolean } = {}
): DamageResult {
  // 1. Stat modifiers (Burn, Paralysis)
  const attackerStats = applyStatusStatModifiers(attacker.stats, attacker.status);
  const targetStats = applyStatusStatModifiers(target.stats, target.status);

  // 2. Base Damage calculation
  // ( ( ( (2 * Level / 5) + 2 ) * Power * A/D ) / 50 ) + 2
  
  const level = attacker.level;
  const power = move.power;
  
  const specialTypes = ['fire', 'water', 'grass', 'electric', 'ice', 'psychic', 'dragon', 'dark', 'fairy'];
  const isSpecial = specialTypes.includes(move.type.toLowerCase());
  
  const A = isSpecial ? attackerStats.spAtk : attackerStats.attack;
  const D = isSpecial ? targetStats.spDef : targetStats.defense;
  
  let baseDamage = Math.floor(
    (Math.floor((Math.floor((2 * level) / 5 + 2) * power * A) / D) / 50) + 2
  );

  // 3. Critical Hit
  const isCrit = options.isCrit ?? Math.random() < 0.0625; // 1/16 default
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

  // 6. Type Effectiveness
  const effectiveness = getEffectiveness(move.type, target.types);
  baseDamage = Math.floor(baseDamage * effectiveness);

  return {
    damage: Math.max(1, baseDamage),
    effectiveness,
    isCrit,
    isStab
  };
}

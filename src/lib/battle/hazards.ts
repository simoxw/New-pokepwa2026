import { Pokemon, StatusCondition } from '../../types/game';
import { getEffectiveness } from './typeChart';
import { isImmuneToStatus } from './statusEffects';

export interface SideHazards {
  stealthRock?: boolean;
  spikesLayers?: number; // 0..3
  toxicSpikesLayers?: number; // 0..2
  stickyWeb?: boolean;
}

export function defaultSideHazards(): SideHazards {
  return {
    stealthRock: false,
    spikesLayers: 0,
    toxicSpikesLayers: 0,
    stickyWeb: false
  };
}

/**
 * Applies move effects that set entry hazards on the target side.
 * Returns message log if a hazard was placed/modified.
 */
export function setHazardFromMove(
  moveName: string,
  targetSide: SideHazards,
  userSide?: SideHazards
): { updatedTargetSide: SideHazards; updatedUserSide?: SideHazards; msg?: string } {
  const mName = moveName.toLowerCase().replace(/[\s_]+/g, '-');
  const updatedTarget = { ...targetSide };

  if (mName.includes('stealth-rock') || mName.includes('levitoroccia')) {
    if (updatedTarget.stealthRock) {
      return { updatedTargetSide: updatedTarget, msg: 'Ma le rocce appuntite sono già presenti sul campo!' };
    }
    updatedTarget.stealthRock = true;
    return { updatedTargetSide: updatedTarget, msg: 'Rocce appuntite fluttuano attorno alla squadra avversaria!' };
  }

  if (mName.includes('toxic-spikes') || mName.includes('fielepunte')) {
    const current = updatedTarget.toxicSpikesLayers || 0;
    if (current >= 2) {
      return { updatedTargetSide: updatedTarget, msg: 'Non si possono posizionare altre Fielepunte!' };
    }
    updatedTarget.toxicSpikesLayers = current + 1;
    return { updatedTargetSide: updatedTarget, msg: `Fielepunte sparse sul terreno della squadra avversaria! (${updatedTarget.toxicSpikesLayers}/2)` };
  }

  if (mName.includes('spikes') || mName.includes('punte')) {
    const current = updatedTarget.spikesLayers || 0;
    if (current >= 3) {
      return { updatedTargetSide: updatedTarget, msg: 'Non si possono posizionare altre Punte!' };
    }
    updatedTarget.spikesLayers = current + 1;
    return { updatedTargetSide: updatedTarget, msg: `Punte sparse sul terreno ai piedi della squadra avversaria! (${updatedTarget.spikesLayers}/3)` };
  }

  if (mName.includes('sticky-web') || mName.includes('ragnatela')) {
    if (updatedTarget.stickyWeb) {
      return { updatedTargetSide: updatedTarget, msg: 'La Ragnatela ricopre già il campo avversario!' };
    }
    updatedTarget.stickyWeb = true;
    return { updatedTargetSide: updatedTarget, msg: 'Una fitta Ragnatela ricopre il campo avversario!' };
  }

  if (mName.includes('rapid-spin') || mName.includes('rapiddensa') || mName.includes('defog') || mName.includes('scaccianebbia')) {
    const cleared = defaultSideHazards();
    return { 
      updatedTargetSide: mName.includes('defog') ? cleared : updatedTarget, 
      updatedUserSide: cleared,
      msg: 'Le trappole sul campo sono state liberate!' 
    };
  }

  return { updatedTargetSide: updatedTarget };
}

export interface EntryHazardResult {
  nextHp: number;
  nextStatus?: StatusCondition;
  nextStatusDuration?: number;
  nextSpeedStageDelta?: number;
  updatedSideHazards: SideHazards;
  logs: string[];
}

/**
 * Evaluates entry hazards on a Pokemon when it switches in or enters battle.
 */
export function processEntryHazards(
  pokemon: Pokemon,
  currentHp: number,
  sideHazards: SideHazards,
  currentStatus?: StatusCondition
): EntryHazardResult {
  let nextHp = currentHp;
  let nextStatus = currentStatus;
  let nextStatusDuration: number | undefined = undefined;
  let nextSpeedStageDelta = 0;
  const updatedSideHazards = { ...sideHazards };
  const logs: string[] = [];

  if (nextHp <= 0) {
    return { nextHp, nextStatus, updatedSideHazards, logs };
  }

  const typesLower = pokemon.types.map(t => t.toLowerCase());
  const isGrounded = !typesLower.includes('flying');

  // 1. Stealth Rock (Levitoroccia) - applies to ALL Pokemon
  if (updatedSideHazards.stealthRock) {
    const rockEffectiveness = getEffectiveness('rock', pokemon.types);
    if (rockEffectiveness > 0) {
      const damage = Math.max(1, Math.floor(pokemon.maxHp * (1 / 8) * rockEffectiveness));
      nextHp = Math.max(0, nextHp - damage);
      logs.push(`I sassi appuntiti feriscono ${pokemon.name}! (-${damage} PS)`);
    }
  }

  if (nextHp <= 0) {
    return { nextHp, nextStatus, updatedSideHazards, logs };
  }

  // Grounded hazards apply only to non-Flying types
  if (isGrounded) {
    // 2. Toxic Spikes (Fielepunte)
    if (updatedSideHazards.toxicSpikesLayers && updatedSideHazards.toxicSpikesLayers > 0) {
      if (typesLower.includes('poison')) {
        // Grounded Poison-type absorbs Toxic Spikes!
        updatedSideHazards.toxicSpikesLayers = 0;
        logs.push(`${pokemon.name} assorbe le Fielepunte dal terreno!`);
      } else if (!nextStatus && !isImmuneToStatus(pokemon.types, 'poisoned')) {
        if (updatedSideHazards.toxicSpikesLayers === 1) {
          nextStatus = 'poisoned';
          logs.push(`${pokemon.name} è stato avvelenato dalle Fielepunte!`);
        } else if (updatedSideHazards.toxicSpikesLayers >= 2) {
          nextStatus = 'badly-poisoned';
          nextStatusDuration = 1;
          logs.push(`${pokemon.name} è stato gravemente avvelenato dalle Fielepunte!`);
        }
      }
    }

    // 3. Spikes (Punte)
    if (updatedSideHazards.spikesLayers && updatedSideHazards.spikesLayers > 0) {
      const fractions = [0, 1 / 8, 1 / 6, 3 / 16];
      const fraction = fractions[Math.min(3, updatedSideHazards.spikesLayers)];
      const damage = Math.max(1, Math.floor(pokemon.maxHp * fraction));
      nextHp = Math.max(0, nextHp - damage);
      logs.push(`${pokemon.name} viene ferito dalle Punte! (-${damage} PS)`);
    }

    if (nextHp <= 0) {
      return { nextHp, nextStatus, nextStatusDuration, updatedSideHazards, logs };
    }

    // 4. Sticky Web (Ragnatela)
    if (updatedSideHazards.stickyWeb) {
      nextSpeedStageDelta = -1;
      logs.push(`${pokemon.name} si impiglia nella Ragnatela e la sua Velocità cala!`);
    }
  }

  return {
    nextHp,
    nextStatus,
    nextStatusDuration,
    nextSpeedStageDelta,
    updatedSideHazards,
    logs
  };
}

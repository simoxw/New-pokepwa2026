import React from 'react';
import { Pokemon, Move, BattleStages, StatusCondition } from '../../types/game';
import { calculateDamage, getAccuracyMultiplier, CalculateDamageOptions } from './battleMath';
import { isImmuneToStatus, VolatileStatus } from './statusEffects';
import { checkAbility } from './abilities';
import { playProtect, playHit } from '../sound';
import { SideHazards, setHazardFromMove } from './hazards';
import { getMoveByName } from '../../data/movesData';

export interface ExecuteMoveResult {
  nextUserHp: number;
  nextTargetHp: number;
  targetFainted: boolean;
  userFainted: boolean;
  nextUserStatus?: { status?: StatusCondition; duration?: number };
  nextTargetStatus?: { status?: StatusCondition; duration?: number };
}

function isSelfStatChange(move: Move, sc: { change: number; target?: string }, defaultSelf: boolean): boolean {
  if (sc.target === 'user') return true;
  if (sc.target === 'target' || sc.target === 'selected-pokemon' || sc.target === 'opponent') return false;
  if (move.stat_changes_target === 'user') return true;
  if (move.stat_changes_target === 'target') return false;
  if (move.target === 'user' || defaultSelf) return true;

  const mName = (move.name || '').toLowerCase().replace(/[\s_]+/g, '-');
  const selfMoves = [
    'zuffa', 'close-combat',
    'troppoforte', 'superpower',
    'vampata', 'overheat',
    'dragometeora', 'draco-meteor',
    'verdebufera', 'leaf-storm',
    'mazzazucca', 'hammer-arm',
    'crescipugno', 'power-up-punch',
    'nitrocarica', 'flame-charge',
    'raggioscossa', 'charge-beam',
    'ferrartigli', 'metal-claw',
    'forzantica', 'ancient-power',
    'ventombra', 'ominous-wind',
    'eterevento', 'silver-wind',
    'danzaspada', 'swords-dance',
    'agilit', 'agility',
    'calmamente', 'calm-mind',
    'congiura', 'nasty-plot',
    'dragodanza', 'dragon-dance',
    'maledizione', 'curse',
    'granfisico', 'bulk-up',
    'ferroscudo', 'iron-defense',
    'acidarmatura', 'acid-armor',
    'amnesia',
    'guscioforza', 'shell-smash',
    'meteorpugno', 'meteor-mash',
    'controfuoco', 'headlong-rush'
  ];
  if (selfMoves.some(sm => mName.includes(sm))) return true;

  return false;
}

export function executeMoveAction(
  rawMove: Move,
  user: Pokemon,
  target: Pokemon,
  userStages: BattleStages,
  setUserStages: React.Dispatch<React.SetStateAction<BattleStages>>,
  targetStages: BattleStages,
  setTargetStages: React.Dispatch<React.SetStateAction<BattleStages>>,
  userStatus: { status?: StatusCondition; duration?: number },
  setUserStatus: React.Dispatch<React.SetStateAction<{ status?: StatusCondition; duration?: number }>>,
  targetStatus: { status?: StatusCondition; duration?: number },
  setTargetStatus: React.Dispatch<React.SetStateAction<{ status?: StatusCondition; duration?: number }>>,
  userVolatile: VolatileStatus,
  setUserVolatile: React.Dispatch<React.SetStateAction<VolatileStatus>>,
  targetVolatile: VolatileStatus,
  setTargetVolatile: React.Dispatch<React.SetStateAction<VolatileStatus>>,
  userHp: number,
  setUserHp: React.Dispatch<React.SetStateAction<number>>,
  targetHp: number,
  setTargetHp: React.Dispatch<React.SetStateAction<number>>,
  isPlayer: boolean,
  isFirstInTurn: boolean,
  addLog: (msg: string) => void,
  options?: CalculateDamageOptions & {
    lifestealPercent?: number;
    dodgeChance?: number;
    accuracyPenalty?: number;
    userSideHazards?: SideHazards;
    setUserSideHazards?: React.Dispatch<React.SetStateAction<SideHazards>>;
    targetSideHazards?: SideHazards;
    setTargetSideHazards?: React.Dispatch<React.SetStateAction<SideHazards>>;
  }
): ExecuteMoveResult {
  // Enrich move with authoritative database definition to ensure secondary effects (stat_changes, recoil, drain) are always guaranteed
  const moveDef = getMoveByName(rawMove.name || (rawMove as any).title || '');
  const effectiveCategory = rawMove.category || moveDef.category || (rawMove.power || moveDef.power ? 'physical' : 'status');
  const effectiveType = (rawMove.type && typeof rawMove.type === 'string' && rawMove.type !== 'normal')
    ? rawMove.type
    : (moveDef.type && moveDef.type !== 'normal' ? moveDef.type : (rawMove.type || moveDef.type || 'normal'));
  const effectivePower = (typeof rawMove.power === 'number' && (rawMove.power > 0 || effectiveCategory === 'status'))
    ? rawMove.power
    : (typeof moveDef.power === 'number' ? moveDef.power : (effectiveCategory === 'status' ? 0 : 40));

  const move: Move = {
    ...moveDef,
    ...rawMove,
    name: moveDef.name || rawMove.name,
    category: effectiveCategory,
    type: effectiveType,
    power: effectivePower,
    accuracy: typeof rawMove.accuracy === 'number' ? rawMove.accuracy : (moveDef.accuracy || 100),
    pp: rawMove.pp ?? moveDef.pp,
    maxPp: moveDef.maxPp || rawMove.maxPp,
    priority: moveDef.priority ?? rawMove.priority,
    stat_changes: (moveDef.stat_changes && moveDef.stat_changes.length > 0) ? moveDef.stat_changes : rawMove.stat_changes,
    stat_changes_target: (moveDef as any).stat_changes_target || rawMove.stat_changes_target,
    drain: moveDef.drain !== undefined ? moveDef.drain : rawMove.drain,
    healing: moveDef.healing !== undefined ? moveDef.healing : rawMove.healing,
    recoil: moveDef.recoil !== undefined ? moveDef.recoil : rawMove.recoil,
    recoilMaxHp: moveDef.recoilMaxHp !== undefined ? moveDef.recoilMaxHp : rawMove.recoilMaxHp,
    statusEffect: moveDef.statusEffect || rawMove.statusEffect,
    effectChance: moveDef.effectChance !== undefined ? moveDef.effectChance : (rawMove.effectChance !== undefined ? rawMove.effectChance : 100),
    flinchChance: moveDef.flinchChance !== undefined ? moveDef.flinchChance : rawMove.flinchChance,
    confusionChance: moveDef.confusionChance !== undefined ? moveDef.confusionChance : rawMove.confusionChance,
    multiTurn: moveDef.multiTurn || rawMove.multiTurn,
  };
  // Quantum Dodge Check
  if (options?.dodgeChance && !isPlayer && Math.random() * 100 < options.dodgeChance) {
    addLog(`${user.name} usa ${move.name}!`);
    addLog(`🎲 Schivata Quantica! ${target.name} schiva completamente l'attacco!`);
    return {
      nextUserHp: userHp,
      nextTargetHp: targetHp,
      targetFainted: false,
      userFainted: false,
      nextUserStatus: userStatus,
      nextTargetStatus: targetStatus
    };
  }

  addLog(`${user.name} usa ${move.name}!`);

  let curUserHp = userHp;
  let curTargetHp = targetHp;
  let nextUserStatusObj = { ...userStatus };
  let nextTargetStatusObj = { ...targetStatus };

  // 0. Protect / Detect handling
  const mLower = move.name.toLowerCase();
  const isProtectMove = mLower.includes('protezione') || mLower.includes('protect') || mLower.includes('individuazione') || mLower.includes('detect');
  
  if (isProtectMove) {
    const streak = userVolatile.protectStreak || 0;
    const successChance = streak === 0 ? 1 : Math.pow(0.5, streak);
    if (Math.random() < successChance) {
      setUserVolatile(prev => ({ ...prev, isProtected: true, protectStreak: streak + 1 }));
      addLog(`${user.name} si è protetto con una barriera impenetrabile!`);
      playProtect();
    } else {
      setUserVolatile(prev => ({ ...prev, isProtected: false, protectStreak: 0 }));
      addLog(`Ma ${user.name} ha fallito la mossa!`);
    }
    return { 
      nextUserHp: curUserHp, 
      nextTargetHp: curTargetHp, 
      targetFainted: false, 
      userFainted: false,
      nextUserStatus: nextUserStatusObj,
      nextTargetStatus: nextTargetStatusObj
    };
  } else {
    setUserVolatile(prev => ({ ...prev, protectStreak: 0 }));
  }

  // Target is protected
  if (targetVolatile.isProtected) {
    addLog(`${target.name} si è protetto completamente dall'attacco!`);
    playProtect();
    return { 
      nextUserHp: curUserHp, 
      nextTargetHp: curTargetHp, 
      targetFainted: false, 
      userFainted: false,
      nextUserStatus: nextUserStatusObj,
      nextTargetStatus: nextTargetStatusObj
    };
  }

  // Target is semi-invulnerable in air/underground/water (Fly, Dig, Dive, Bounce)
  if (targetVolatile.chargingState && targetVolatile.chargingState !== 'charge') {
    const invulnMsgs: Record<string, string> = {
      fly: `${target.name} è in volo ed evita l'attacco!`,
      bounce: `${target.name} è altissimo in volo ed evita l'attacco!`,
      dig: `${target.name} è nascosto sottoterra ed evita l'attacco!`,
      dive: `${target.name} è nascosto sottacqua ed evita l'attacco!`
    };
    if (invulnMsgs[targetVolatile.chargingState]) {
      addLog(invulnMsgs[targetVolatile.chargingState]);
      return { 
        nextUserHp: curUserHp, 
        nextTargetHp: curTargetHp, 
        targetFainted: false, 
        userFainted: false,
        nextUserStatus: nextUserStatusObj,
        nextTargetStatus: nextTargetStatusObj
      };
    }
  }

  // 1. Accuracy Check
  if (move.accuracy && move.accuracy < 100) {
    const accStage = (userStages.accuracy ?? 0) - (targetStages.evasion ?? 0);
    const accMultiplier = getAccuracyMultiplier(accStage);
    let finalAccuracy = Math.min(100, Math.floor(move.accuracy * accMultiplier));
    if (isPlayer && options?.accuracyPenalty) {
      finalAccuracy = Math.max(10, finalAccuracy - options.accuracyPenalty);
    }
    if (Math.random() * 100 >= finalAccuracy) {
      addLog(`Ma il colpo di ${user.name} fallisce!`);
      return { 
        nextUserHp: curUserHp, 
        nextTargetHp: curTargetHp, 
        targetFainted: false, 
        userFainted: false,
        nextUserStatus: nextUserStatusObj,
        nextTargetStatus: nextTargetStatusObj
      };
    }
  }

  // Helper to apply stat stages
  const applyStatChanges = (changes: typeof move.stat_changes, defaultSelf: boolean) => {
    if (!changes || changes.length === 0) return;
    const STAT_MAP: Record<string, keyof BattleStages> = {
      'attack': 'attack',
      'atk': 'attack',
      'attacco': 'attack',
      'defense': 'defense',
      'def': 'defense',
      'difesa': 'defense',
      'special-attack': 'spAtk',
      'special_attack': 'spAtk',
      'spatk': 'spAtk',
      'sp-atk': 'spAtk',
      'spa': 'spAtk',
      'attacco-speciale': 'spAtk',
      'special-defense': 'spDef',
      'special_defense': 'spDef',
      'spdef': 'spDef',
      'sp-def': 'spDef',
      'spd': 'spDef',
      'difesa-speciale': 'spDef',
      'speed': 'speed',
      'spe': 'speed',
      'vel': 'speed',
      'velocita': 'speed',
      'accuracy': 'accuracy',
      'acc': 'accuracy',
      'prec': 'accuracy',
      'precisione': 'accuracy',
      'evasion': 'evasion',
      'eva': 'evasion',
      'elus': 'evasion',
      'elusione': 'evasion'
    };
    const STAT_LABELS: Record<string, string> = {
      attack: 'Attacco',
      defense: 'Difesa',
      spAtk: 'Attacco Sp.',
      spDef: 'Difesa Sp.',
      speed: 'Velocità',
      accuracy: 'Precisione',
      evasion: 'Elusione'
    };

    for (const sc of changes) {
      const rawStatName = (typeof (sc as any).stat === 'string'
        ? (sc as any).stat
        : sc.stat?.name || (sc as any).statName || (sc as any).name || '').toLowerCase().trim();
      const statKey = STAT_MAP[rawStatName];
      if (!statKey) continue;
      const isSelf = isSelfStatChange(move, sc, defaultSelf);
      const recipient = isSelf ? user : target;
      const setRecipientStages = isSelf ? setUserStages : setTargetStages;
      const recipientStages = isSelf ? userStages : targetStages;
      const currVal = recipientStages[statKey] ?? 0;
      const statLabel = STAT_LABELS[statKey] || statKey;

      if (sc.change > 0 && currVal >= 6) {
        addLog(`${statLabel} di ${recipient.name} non può salire oltre!`);
      } else if (sc.change < 0 && currVal <= -6) {
        addLog(`${statLabel} di ${recipient.name} non può scendere oltre!`);
      } else {
        const nextVal = Math.max(-6, Math.min(6, currVal + sc.change));
        recipientStages[statKey] = nextVal;
        setRecipientStages(prev => ({ ...prev, [statKey]: nextVal }));
        if (sc.change > 0) {
          addLog(`${statLabel} di ${recipient.name} aumenta${sc.change >= 2 ? ' molto' : ''}!`);
        } else {
          addLog(`${statLabel} di ${recipient.name} cala${sc.change <= -2 ? ' molto' : ''}!`);
        }
      }
    }
  };

  // Helper to apply primary status conditions
  const applyStatusCondition = (status: StatusCondition, chance?: number) => {
    if (targetStatus.status) {
      if (move.category === 'status') {
        addLog(`${target.name} ha già un problema di stato!`);
      }
      return;
    }
    if (isImmuneToStatus(target.types, status)) {
      addLog(`${target.name} è immune a questo problema di stato!`);
      return;
    }
    const procChance = chance ?? (move.category === 'status' ? 100 : 100);
    if (Math.random() * 100 < procChance) {
      const duration = status === 'sleep' ? Math.floor(Math.random() * 3) + 2 : undefined;
      nextTargetStatusObj = { status, duration };
      setTargetStatus({ status, duration });
      const STATUS_MESSAGES: Record<StatusCondition, string> = {
        paralyzed: `${target.name} è rimasto paralizzato! Potrebbe non riuscire a muoversi!`,
        poisoned: `${target.name} è stato avvelenato!`,
        'badly-poisoned': `${target.name} è stato gravemente avvelenato!`,
        sleep: `${target.name} si è addormentato!`,
        burned: `${target.name} si è scottato!`,
        frozen: `${target.name} è stato congelato!`
      };
      addLog(STATUS_MESSAGES[status]);
    } else if (move.category === 'status') {
      addLog("Ma non ha avuto effetto!");
    }
  };

  // 2. HEALING / RECOVERY MOVES (e.g. Recover, Synthesis, Rest)
  const isRest = move.name.toLowerCase().includes('riposo') || move.name.toLowerCase().includes('rest');

  if (isRest) {
    if (userStatus.status === 'sleep') {
      addLog(`Ma non ha avuto effetto! ${user.name} sta già dormendo!`);
      return {
        nextUserHp: curUserHp,
        nextTargetHp: curTargetHp,
        targetFainted: curTargetHp <= 0,
        userFainted: curUserHp <= 0,
        nextUserStatus: nextUserStatusObj,
        nextTargetStatus: nextTargetStatusObj
      };
    }
    const healAmount = user.maxHp - curUserHp;
    curUserHp = user.maxHp;
    setUserHp(curUserHp);
    nextUserStatusObj = { status: 'sleep', duration: 2 };
    setUserStatus({ status: 'sleep', duration: 2 });
    addLog(`${user.name} ha recuperato tutti i PS (+${healAmount} PS), cade in un sonno profondo per 2 turni e guarisce da ogni problema di stato!`);

    // Riposo has completely resolved its effect; return immediately to ensure target is NEVER affected
    return {
      nextUserHp: curUserHp,
      nextTargetHp: curTargetHp,
      targetFainted: curTargetHp <= 0,
      userFainted: curUserHp <= 0,
      nextUserStatus: nextUserStatusObj,
      nextTargetStatus: nextTargetStatusObj
    };
  } else if (move.healing && move.healing > 0) {
    const healAmount = Math.max(1, Math.floor(user.maxHp * move.healing));
    curUserHp = Math.min(user.maxHp, curUserHp + healAmount);
    setUserHp(curUserHp);
    addLog(`${user.name} ha recuperato le forze! (+${healAmount} PS)`);
  }

  // 3. STATUS MOVES (Deal NO damage directly)
  if (move.category === 'status' || !move.power || move.power === 0) {
    if (move.stat_changes && move.stat_changes.length > 0) {
      applyStatChanges(move.stat_changes, move.target === 'user');
    }
    if (move.statusEffect && move.target !== 'user' && !isRest) {
      applyStatusCondition(move.statusEffect, move.effectChance);
    }
    // Hazard setting status moves (e.g., Stealth Rock, Spikes, Toxic Spikes, Sticky Web)
    if (options?.targetSideHazards && options?.setTargetSideHazards) {
      const hazardCheck = setHazardFromMove(move.name, options.targetSideHazards, options.userSideHazards);
      if (hazardCheck.msg) {
        addLog(hazardCheck.msg);
        options.setTargetSideHazards(hazardCheck.updatedTargetSide);
        if (hazardCheck.updatedUserSide && options.setUserSideHazards) {
          options.setUserSideHazards(hazardCheck.updatedUserSide);
        }
      }
    }
    // Confusion status move (e.g. Supersonic, Confuse Ray)
    if (move.confusionChance) {
      if (!targetVolatile.confusionTurns || targetVolatile.confusionTurns <= 0) {
        const chance = move.confusionChance;
        if (Math.random() * 100 < chance) {
          const cTurns = Math.floor(Math.random() * 4) + 1;
          setTargetVolatile(prev => ({ ...prev, confusionTurns: cTurns }));
          addLog(`${target.name} è confuso!`);
        } else {
          addLog("Ma non ha avuto effetto!");
        }
      } else {
        addLog(`${target.name} è già confuso!`);
      }
    }
    return { nextUserHp: curUserHp, nextTargetHp: curTargetHp, targetFainted: false, userFainted: false };
  }

  // 4. ATTACKING MOVES (Physical / Special)
  const abilityEffect = isPlayer ? checkAbility(user, 'on_move_use', { move, target }) : null;
  if (abilityEffect?.msg) addLog(abilityEffect.msg);
  const damageMult = abilityEffect?.type === 'damage_mult' ? abilityEffect.value || 1 : 1;

  // Multi-hit handling
  if (move.multiTurn?.type === 'multi-hit') {
    const minH = move.multiTurn.minHits || 2;
    const maxH = move.multiTurn.maxHits || (minH === 2 ? 5 : minH);
    let hits = minH;
    if (minH === maxH) {
      hits = minH;
    } else {
      const r = Math.random();
      hits = r < 0.375 ? 2 : r < 0.75 ? 3 : r < 0.875 ? 4 : 5;
    }
    let actualHits = 0;
    let totalDamage = 0;
    let effectiveness = 1;

    for (let i = 0; i < hits; i++) {
      if (curTargetHp <= 0) break;
      const res = calculateDamage(
        { ...user, status: userStatus.status },
        { ...target, status: targetStatus.status },
        move,
        { attackerStages: userStages, targetStages, ...options }
      );
      const hitDmg = Math.max(1, Math.floor(res.damage * damageMult));
      curTargetHp = Math.max(0, curTargetHp - hitDmg);
      totalDamage += hitDmg;
      actualHits++;
      effectiveness = res.effectiveness;
    }

    setTargetHp(curTargetHp);
    if (effectiveness > 1) {
      addLog("È superefficace!");
      playHit('super');
    } else if (effectiveness < 1 && effectiveness > 0) {
      addLog("Non è molto efficace...");
      playHit('not_very');
    } else {
      playHit('normal');
    }
    addLog(`${user.name} infligge un totale di ${totalDamage} danni colpendo ${actualHits} volte!`);
    
    return { nextUserHp: curUserHp, nextTargetHp: curTargetHp, targetFainted: curTargetHp <= 0, userFainted: false };
  }

  const result = calculateDamage(
    { ...user, status: userStatus.status },
    { ...target, status: targetStatus.status },
    move,
    { attackerStages: userStages, targetStages, ...options }
  );
  const finalDamage = Math.floor(result.damage * damageMult);

  if (result.effectiveness > 1) {
    addLog("È superefficace!");
    playHit('super');
  } else if (result.effectiveness < 1 && result.effectiveness > 0) {
    addLog("Non è molto efficace...");
    playHit('not_very');
  } else if (result.effectiveness === 0) {
    addLog("Non ha effetto...");
    return { nextUserHp: curUserHp, nextTargetHp: curTargetHp, targetFainted: false, userFainted: false };
  } else if (result.isCrit) {
    playHit('crit');
  } else {
    playHit('normal');
  }
  if (result.isCrit) addLog("Brutto colpo!");

  addLog(`${user.name} infligge ${finalDamage} danni!`);

  // Subtract damage from defender
  curTargetHp = Math.max(0, curTargetHp - finalDamage);
  setTargetHp(curTargetHp);

  // Card Lifesteal (Drenaggio di Pacchetti)
  if (isPlayer && options?.lifestealPercent && finalDamage > 0 && curUserHp > 0) {
    const lifestealHeal = Math.max(1, Math.floor((finalDamage * options.lifestealPercent) / 100));
    curUserHp = Math.min(user.maxHp, curUserHp + lifestealHeal);
    setUserHp(curUserHp);
    addLog(`🩸 Drenaggio di Pacchetti rigenera ${lifestealHeal} PS a ${user.name}!`);
  }

  // Boss Vampirico mutation heal
  if (!isPlayer && options?.bossMutationType === 'vampirico' && finalDamage > 0 && curUserHp > 0) {
    const vampHeal = Math.max(1, Math.floor(finalDamage * 0.20));
    curUserHp = Math.min(user.maxHp, curUserHp + vampHeal);
    setUserHp(curUserHp);
    addLog(`🩸 Boss Vampirico rigenera ${vampHeal} PS dall'attacco!`);
  }

  // Ability check on target hit
  const onHitEffect = checkAbility(target, 'on_hit', { move, target: user });
  if (onHitEffect?.msg) addLog(onHitEffect.msg);

  // 4a. DRAIN MOVES (e.g. Giga Drain, Absorb, Leech Life)
  if (move.drain && move.drain > 0 && curUserHp > 0) {
    const drainHeal = Math.max(1, Math.floor(finalDamage * move.drain));
    curUserHp = Math.min(user.maxHp, curUserHp + drainHeal);
    setUserHp(curUserHp);
    addLog(`${user.name} ha assorbito l'energia dell'avversario! (+${drainHeal} PS)`);
  }

  // 4b. RECOIL MOVES (e.g. Double-Edge, Brave Bird, Struggle)
  if (move.recoilMaxHp && move.recoilMaxHp > 0) {
    // Struggle: recoil is 1/4 of user's MAX HP
    const recoilDmg = Math.max(1, Math.floor(user.maxHp * move.recoilMaxHp));
    curUserHp = Math.max(0, curUserHp - recoilDmg);
    setUserHp(curUserHp);
    addLog(`${user.name} subisce il contraccolpo di Scontro! (-${recoilDmg} PS)`);
  } else if (move.recoil && move.recoil > 0) {
    const recoilDmg = Math.max(1, Math.floor(finalDamage * move.recoil));
    curUserHp = Math.max(0, curUserHp - recoilDmg);
    setUserHp(curUserHp);
    addLog(`${user.name} risente del contraccolpo! (-${recoilDmg} PS)`);
  }

  // Hazard clearing attacking moves (e.g., Rapid Spin)
  const mNameLower = move.name.toLowerCase();
  if ((mNameLower.includes('rapid-spin') || mNameLower.includes('rapidsguardo')) && options?.userSideHazards && options?.setUserSideHazards) {
    const hazardCheck = setHazardFromMove(move.name, options.targetSideHazards || {}, options.userSideHazards);
    if (hazardCheck.msg) {
      addLog(hazardCheck.msg);
      if (hazardCheck.updatedUserSide) options.setUserSideHazards(hazardCheck.updatedUserSide);
    }
  }

  // 4c. SECONDARY EFFECTS (Status, Stat Changes, Confusion, Flinch)
  // Stat changes proc (Self stat changes like Zuffa, Overheat, Superpower occur 100% guaranteed even if target fainted)
  if (move.stat_changes && move.stat_changes.length > 0) {
    const isSelf = isSelfStatChange(move, move.stat_changes[0], move.target === 'user');
    const chance = isSelf ? (moveDef.effectChance !== undefined ? moveDef.effectChance : 100) : (move.effectChance ?? 100);
    if (Math.random() * 100 < chance) {
      if (isSelf || curTargetHp > 0) {
        applyStatChanges(move.stat_changes, move.target === 'user');
      }
    }
  }

  if (curTargetHp > 0) {
    // Status condition proc
    if (move.statusEffect && !targetStatus.status) {
      const chance = move.effectChance ?? 10;
      applyStatusCondition(move.statusEffect, chance);
    }
    // Confusion proc
    if (move.confusionChance && (!targetVolatile.confusionTurns || targetVolatile.confusionTurns <= 0)) {
      if (Math.random() * 100 < move.confusionChance) {
        const cTurns = Math.floor(Math.random() * 4) + 1;
        setTargetVolatile(prev => ({ ...prev, confusionTurns: cTurns }));
        addLog(`${target.name} è confuso!`);
      }
    }
    // Flinch proc (Only applies if the attacker is acting first in this turn!)
    if (move.flinchChance && isFirstInTurn) {
      if (Math.random() * 100 < move.flinchChance) {
        setTargetVolatile(prev => ({ ...prev, isFlinched: true }));
      }
    }
  }

  return {
    nextUserHp: curUserHp,
    nextTargetHp: curTargetHp,
    targetFainted: curTargetHp <= 0,
    userFainted: curUserHp <= 0,
    nextUserStatus: nextUserStatusObj,
    nextTargetStatus: nextTargetStatusObj
  };
}

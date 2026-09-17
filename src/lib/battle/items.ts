import { Pokemon, Item } from '../../types/game';

export interface ItemBattleEffect {
  success: boolean;
  msg: string;
  consumed: boolean;
  captureSuccess?: boolean;
}

/**
 * Applies an item's effect during battle.
 * Expects target.hp to reflect the real-time HP of the target Pokemon in battle.
 */
export function useItemInBattle(item: Item, target: Pokemon): ItemBattleEffect {
  const currentHp = typeof target.hp === 'number' ? target.hp : target.maxHp;

  switch (item.id) {
    case 'pozione':
    case 'super-pozione':
    case 'iper-pozione':
    case 'pozione-max':
      if (currentHp <= 0) {
        return { success: false, msg: `${target.name} è esausto! Usa un revitalizzante.`, consumed: false };
      }
      if (currentHp >= target.maxHp) {
        return { success: false, msg: `I PS di ${target.name} sono già al massimo!`, consumed: false };
      }
      const healAmount = item.id === 'pozione-max' 
        ? target.maxHp 
        : (item.effectValue || (item.id === 'iper-pozione' ? 200 : item.id === 'super-pozione' ? 50 : 20));
      return { 
        success: true, 
        msg: `${target.name} ha recuperato ${Math.min(target.maxHp - currentHp, healAmount)} PS!`, 
        consumed: true 
      };

    case 'revitalizzante':
    case 'revitalizzante-max':
      if (currentHp > 0) {
        return { success: false, msg: `${target.name} non è esausto e non ha bisogno di un revitalizzante!`, consumed: false };
      }
      return {
        success: true,
        msg: `${target.name} è tornato in forze!`,
        consumed: true
      };

    // Status condition curers
    case 'antidoto':
      if (target.status !== 'poisoned') {
        return { success: false, msg: `${target.name} non è avvelenato!`, consumed: false };
      }
      return { success: true, msg: `${target.name} è guarito dall'avvelenamento!`, consumed: true };

    case 'antiparalisi':
      if (target.status !== 'paralyzed') {
        return { success: false, msg: `${target.name} non è paralizzato!`, consumed: false };
      }
      return { success: true, msg: `${target.name} è guarito dalla paralisi!`, consumed: true };

    case 'antiscotto':
      if (target.status !== 'burned') {
        return { success: false, msg: `${target.name} non è scottato!`, consumed: false };
      }
      return { success: true, msg: `${target.name} è guarito dalla scottatura!`, consumed: true };

    case 'sveglia':
      if (target.status !== 'sleep') {
        return { success: false, msg: `${target.name} non sta dormendo!`, consumed: false };
      }
      return { success: true, msg: `${target.name} si è svegliato!`, consumed: true };

    case 'cura-totale':
    case 'full-heal':
      if (!target.status) {
        return { success: false, msg: `${target.name} non ha problemi di stato!`, consumed: false };
      }
      return { success: true, msg: `Tutti i problemi di stato di ${target.name} sono stati curati!`, consumed: true };

    case 'poke-ball':
    case 'mega-ball':
    case 'ultra-ball':
    case 'master-ball':
      return {
        success: true,
        consumed: true,
        msg: `Lancio della ${item.name}...`
      };

    default:
      return { success: false, msg: "Questo strumento non può essere usato ora in battaglia.", consumed: false };
  }
}


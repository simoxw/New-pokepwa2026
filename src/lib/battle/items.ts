import { Pokemon, Item } from '../../types/game';

export interface ItemBattleEffect {
  success: boolean;
  msg: string;
  consumed: boolean;
  captureSuccess?: boolean;
}

/**
 * Applies an item's effect during battle.
 */
export function useItemInBattle(item: Item, target: Pokemon): ItemBattleEffect {
  switch (item.id) {
    case 'pozione':
    case 'super-pozione':
    case 'iper-pozione':
      if (target.hp <= 0) {
        return { success: false, msg: `${target.name} è esausto! Usa un revitalizzante.`, consumed: false };
      }
      if (target.hp >= target.maxHp) {
        return { success: false, msg: `I PS di ${target.name} sono già al massimo!`, consumed: false };
      }
      const healAmount = item.effectValue || 20;
      return { 
        success: true, 
        msg: `${target.name} ha recuperato ${healAmount} PS!`, 
        consumed: true 
      };

    case 'revitalizzante':
    case 'revitalizzante-max':
      if (target.hp > 0) {
        return { success: false, msg: `${target.name} non ha bisogno di un revitalizzante!`, consumed: false };
      }
      return {
        success: true,
        msg: `${target.name} è tornato in forze!`,
        consumed: true
      };

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
      return { success: false, msg: "Questo strumento non può essere usato ora.", consumed: false };
  }
}

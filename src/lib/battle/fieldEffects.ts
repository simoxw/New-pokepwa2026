import { Pokemon } from '../../types/game';

export type WeatherType = 'none' | 'sun' | 'rain' | 'sandstorm' | 'hail';

export interface FieldWeather {
  type: WeatherType;
  turns: number;
}

export interface SideScreens {
  reflect: number;     // Physical damage reduction (50%)
  lightScreen: number; // Special damage reduction (50%)
}

export function defaultFieldWeather(): FieldWeather {
  return { type: 'none', turns: 0 };
}

export function defaultSideScreens(): SideScreens {
  return { reflect: 0, lightScreen: 0 };
}

/**
 * Returns damage multiplier based on active field weather.
 * Sun: Fire x1.5, Water x0.5
 * Rain: Water x1.5, Fire x0.5
 */
export function getWeatherDamageMultiplier(moveType: string, weather?: WeatherType): number {
  if (!weather || weather === 'none') return 1.0;
  const mType = (moveType || '').toLowerCase();

  if (weather === 'sun') {
    if (mType === 'fire') return 1.5;
    if (mType === 'water') return 0.5;
  } else if (weather === 'rain') {
    if (mType === 'water') return 1.5;
    if (mType === 'fire') return 0.5;
  }

  return 1.0;
}

/**
 * Returns damage multiplier based on active screens.
 * Reflect: Physical damage x0.5
 * Light Screen: Special damage x0.5
 */
export function getScreenDamageMultiplier(category: 'physical' | 'special', screens?: SideScreens): number {
  if (!screens) return 1.0;
  if (category === 'physical' && screens.reflect > 0) {
    return 0.5;
  }
  if (category === 'special' && screens.lightScreen > 0) {
    return 0.5;
  }
  return 1.0;
}

/**
 * Processes end-of-turn weather damage:
 * - Sandstorm: 1/16 max HP to all non-Rock, non-Ground, non-Steel Pokémon.
 * - Hail: 1/16 max HP to all non-Ice Pokémon.
 */
export function processWeatherTurnEnd(
  pokemon: Pokemon,
  currentHp: number,
  weather: WeatherType
): { nextHp: number; damage: number; msg?: string } {
  if (currentHp <= 0 || !weather || weather === 'none') {
    return { nextHp: currentHp, damage: 0 };
  }

  const types = (pokemon.types || []).map(t => t.toLowerCase());

  if (weather === 'sandstorm') {
    const isImmune = types.includes('rock') || types.includes('ground') || types.includes('steel');
    if (!isImmune) {
      const damage = Math.max(1, Math.floor(pokemon.maxHp / 16));
      const nextHp = Math.max(0, currentHp - damage);
      return {
        nextHp,
        damage,
        msg: `🌪️ ${pokemon.name} è colpito dalla tempesta di sabbia! (-${damage} PS)`
      };
    }
  } else if (weather === 'hail') {
    const isImmune = types.includes('ice');
    if (!isImmune) {
      const damage = Math.max(1, Math.floor(pokemon.maxHp / 16));
      const nextHp = Math.max(0, currentHp - damage);
      return {
        nextHp,
        damage,
        msg: `❄️ ${pokemon.name} è colpito dalla grandine! (-${damage} PS)`
      };
    }
  }

  return { nextHp: currentHp, damage: 0 };
}

/**
 * Decrements weather counter at end of round.
 */
export function tickWeather(weather: FieldWeather): { nextWeather: FieldWeather; expiredMsg?: string } {
  if (weather.type === 'none' || weather.turns <= 0) {
    return { nextWeather: { type: 'none', turns: 0 } };
  }

  const remaining = weather.turns - 1;
  if (remaining <= 0) {
    const names: Record<WeatherType, string> = {
      none: '',
      sun: 'Il sole accecante si è attenuato.',
      rain: 'La pioggia ha smesso di cadere.',
      sandstorm: 'La tempesta di sabbia si è placata.',
      hail: 'La grandine ha smesso di cadere.'
    };
    return {
      nextWeather: { type: 'none', turns: 0 },
      expiredMsg: `🌤️ ${names[weather.type] || 'Il meteo è tornato alla normalità!'}`
    };
  }

  return {
    nextWeather: { type: weather.type, turns: remaining }
  };
}

/**
 * Decrements screens counters at end of round.
 */
export function tickScreens(
  screens: SideScreens,
  sideLabel: string
): { nextScreens: SideScreens; expiredMsgs: string[] } {
  const nextScreens: SideScreens = { ...screens };
  const expiredMsgs: string[] = [];

  if (nextScreens.reflect > 0) {
    nextScreens.reflect -= 1;
    if (nextScreens.reflect === 0) {
      expiredMsgs.push(`🛡️ Il Riflesso di ${sideLabel} è svanito!`);
    }
  }

  if (nextScreens.lightScreen > 0) {
    nextScreens.lightScreen -= 1;
    if (nextScreens.lightScreen === 0) {
      expiredMsgs.push(`🔮 Lo Schermoluce di ${sideLabel} è svanito!`);
    }
  }

  return { nextScreens, expiredMsgs };
}

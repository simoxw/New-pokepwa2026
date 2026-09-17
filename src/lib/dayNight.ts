export type TimePeriod = 'day' | 'sunset' | 'night';

export interface DayNightState {
  period: TimePeriod;
  isNight: boolean;
  isSunset: boolean;
  isDay: boolean;
  currentHour: number;
  formattedTime: string;
}

export interface NightPokemonDef {
  id: number;
  name: string;
  minLevel: number;
  maxLevel: number;
  rarity: number; // 0.0 to 1.0
  description: string;
}

export const NIGHT_EXCLUSIVE_POKEMON: NightPokemonDef[] = [
  { id: 198, name: 'Murkrow', minLevel: 15, maxLevel: 28, rarity: 0.35, description: 'Vola nei cieli notturni attratto da oggetti luccicanti.' },
  { id: 200, name: 'Misdreavus', minLevel: 18, maxLevel: 32, rarity: 0.30, description: 'Spaventa gli ignari programmatori al buio assorbendo il loro timore.' },
  { id: 94, name: 'Gengar', minLevel: 36, maxLevel: 48, rarity: 0.15, description: 'Emerge dalle ombre dei server nelle ore più buie della notte.' },
  { id: 197, name: 'Umbreon', minLevel: 30, maxLevel: 45, rarity: 0.18, description: 'I suoi cerchi brillano nella notte quando scende l\'oscurità.' },
  { id: 229, name: 'Houndoom', minLevel: 28, maxLevel: 42, rarity: 0.20, description: 'I suoi ululati echeggiano nei corridoi del codice notturno.' },
  { id: 302, name: 'Sableye', minLevel: 20, maxLevel: 35, rarity: 0.25, description: 'Si nutre di gemme luccicanti nell\'oscurità più profonda.' },
  { id: 609, name: 'Chandelure', minLevel: 41, maxLevel: 55, rarity: 0.10, description: 'Fiamme spettrali che illuminano a giorno i terminali.' },
  { id: 571, name: 'Zoroark', minLevel: 38, maxLevel: 52, rarity: 0.12, description: 'Crea illusioni cibernetiche perfette sotto la luna piena.' },
  { id: 792, name: 'Lunala', minLevel: 65, maxLevel: 65, rarity: 0.02, description: 'L\'emissario leggendario della luna che divora la luce!' },
];

export function getDeviceTimeInfo(manualOverride?: TimePeriod | 'auto'): DayNightState {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  let period: TimePeriod;
  if (manualOverride && manualOverride !== 'auto') {
    period = manualOverride;
  } else {
    if (hours >= 21 || hours < 6) {
      period = 'night';
    } else if (hours >= 18 && hours < 21) {
      period = 'sunset';
    } else {
      period = 'day';
    }
  }

  return {
    period,
    isNight: period === 'night',
    isSunset: period === 'sunset',
    isDay: period === 'day',
    currentHour: hours,
    formattedTime
  };
}

import { useState, useEffect } from 'react';
import { getDeviceTimeInfo, DayNightState, TimePeriod } from '../lib/dayNight';

export function useDayNight() {
  const [override, setOverride] = useState<TimePeriod | 'auto'>(() => {
    return (localStorage.getItem('pokepwa_time_override') as TimePeriod | 'auto') || 'auto';
  });

  const [timeInfo, setTimeInfo] = useState<DayNightState>(() => getDeviceTimeInfo(override));

  useEffect(() => {
    const update = () => {
      setTimeInfo(getDeviceTimeInfo(override));
    };

    update();
    const interval = setInterval(update, 30000); // Check every 30s
    window.addEventListener('focus', update);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', update);
    };
  }, [override]);

  const toggleOverride = () => {
    setOverride(prev => {
      let next: TimePeriod | 'auto';
      if (prev === 'auto') next = 'night';
      else if (prev === 'night') next = 'sunset';
      else if (prev === 'sunset') next = 'day';
      else next = 'auto';
      localStorage.setItem('pokepwa_time_override', next);
      return next;
    });
  };

  return {
    ...timeInfo,
    override,
    toggleOverride
  };
}

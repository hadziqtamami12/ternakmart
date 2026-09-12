// TimezoneContext.jsx - Dynamic Regional Timezone Conversion Hook
import React, { createContext, useContext, useMemo } from 'react';
import { useAppConfig } from './AppConfigContext';

const TimezoneContext = createContext(null);

const TIMEZONE_CONFIGS = {
  'Asia/Jakarta': { label: 'WIB (UTC+7)', offsetHours: 7 },
  'Asia/Makassar': { label: 'WITA (UTC+8)', offsetHours: 8 },
  'Asia/Jayapura': { label: 'WIT (UTC+9)', offsetHours: 9 }
};

export function TimezoneProvider({ children }) {
  const { config } = useAppConfig();

  const activeTimezoneConfig = useMemo(() => {
    const tzKey = config?.timezone_offset || 'Asia/Jakarta';
    return TIMEZONE_CONFIGS[tzKey] || { label: 'WIB (UTC+7)', offsetHours: 7 };
  }, [config?.timezone_offset]);

  // Unified date formatter converting UTC to active regional timezone
  const formatTime = (utcIsoString, includeTime = true) => {
    if (!utcIsoString) return '-';
    const date = new Date(utcIsoString);
    if (isNaN(date.getTime())) return utcIsoString;

    // Apply offset
    const localMs = date.getTime() + activeTimezoneConfig.offsetHours * 60 * 60 * 1000;
    const localDate = new Date(localMs);

    const day = String(localDate.getUTCDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = monthNames[localDate.getUTCMonth()];
    const year = localDate.getUTCFullYear();

    if (!includeTime) {
      return `${day} ${month} ${year}`;
    }

    const hours = String(localDate.getUTCHours()).padStart(2, '0');
    const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
    const tzCode = activeTimezoneConfig.label.split(' ')[0]; // WIB, WITA, WIT

    return `${day} ${month} ${year}, ${hours}:${minutes} ${tzCode}`;
  };

  return (
    <TimezoneContext.Provider value={{ timezone: config?.timezone_offset, config: activeTimezoneConfig, formatTime }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export const useTimezone = () => useContext(TimezoneContext);

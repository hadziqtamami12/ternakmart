// timezone.js - Dynamic Regional Timezone Utility
const db = require('../database/adapter');

const TIMEZONE_CONFIGS = {
  'Asia/Jakarta': { label: 'WIB (UTC+7)', offsetHours: 7 },
  'Asia/Makassar': { label: 'WITA (UTC+8)', offsetHours: 8 },
  'Asia/Jayapura': { label: 'WIT (UTC+9)', offsetHours: 9 }
};

async function getActiveTimezone() {
  try {
    const settings = await db.findMany('system_settings', { key_name: 'platform_identity' });
    if (settings && settings.length > 0 && settings[0].value_json && settings[0].value_json.timezone_offset) {
      const tzKey = settings[0].value_json.timezone_offset;
      const config = TIMEZONE_CONFIGS[tzKey] || { label: 'WIB (UTC+7)', offsetHours: 7 };
      return {
        timezone: tzKey,
        ...config
      };
    }
  } catch (err) {
    console.warn('⚠️ [Timezone] Could not load system setting, fallback to Asia/Jakarta');
  }

  return {
    timezone: 'Asia/Jakarta',
    label: 'WIB (UTC+7)',
    offsetHours: 7
  };
}

function formatWithTimezone(utcDateString, tzConfig) {
  if (!utcDateString) return '-';
  const date = new Date(utcDateString);
  if (isNaN(date.getTime())) return utcDateString;

  // Add offset hours
  const localTime = new Date(date.getTime() + tzConfig.offsetHours * 60 * 60 * 1000);

  const day = String(localTime.getUTCDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = monthNames[localTime.getUTCMonth()];
  const year = localTime.getUTCFullYear();
  const hours = String(localTime.getUTCHours()).padStart(2, '0');
  const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes} ${tzConfig.label.split(' ')[0]}`;
}

module.exports = {
  TIMEZONE_CONFIGS,
  getActiveTimezone,
  formatWithTimezone
};

// settingController.js - Platform Identity, Dynamic Branding & Regional Timezone Configuration
const db = require('../database/adapter');
const { TIMEZONE_CONFIGS } = require('../utils/timezone');

const DEFAULT_PLATFORM_IDENTITY = {
  app_name: 'Ternakmart',
  tagline: 'Platform E-Commerce Peternakan & Logistik Armada Mandiri Terpercaya',
  app_logo_url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=128&auto=format&fit=crop&q=80',
  app_favicon_url: 'https://cdn-icons-png.flaticon.com/512/2395/2395796.png',
  active_theme: 'emerald-agro',
  timezone_offset: 'Asia/Jakarta',
  timezone_label: 'WIB (UTC+7)',
  service_fee_nominal: 35000,
  min_free_shipping_nominal: 10000000,
  support_whatsapp: '+6281234567890',
  bank_accounts: [
    { bank: 'BCA', account_number: '8830192841', account_holder: 'PT TERNAKMART INDONESIA' },
    { bank: 'MANDIRI', account_number: '1310029384910', account_holder: 'PT TERNAKMART INDONESIA' },
    { bank: 'BRI', account_number: '034101000982301', account_holder: 'PT TERNAKMART INDONESIA' },
    { bank: 'BNI', account_number: '9928172635', account_holder: 'PT TERNAKMART INDONESIA' }
  ]
};

exports.getSettings = async (req, res) => {
  try {
    let settings = null;
    try {
      const list = await db.findMany('system_settings', { key_name: 'platform_identity' });
      settings = list.length > 0 ? list[0] : null;
    } catch (e) {
      settings = null;
    }

    if (!settings) {
      try {
        settings = await db.create('system_settings', {
          key_name: 'platform_identity',
          value_json: DEFAULT_PLATFORM_IDENTITY
        });
      } catch (e) {
        settings = { value_json: DEFAULT_PLATFORM_IDENTITY };
      }
    }

    let val = settings && settings.value_json ? settings.value_json : DEFAULT_PLATFORM_IDENTITY;
    if (typeof val === 'string') {
      try { val = JSON.parse(val); } catch(e) { val = DEFAULT_PLATFORM_IDENTITY; }
    }

    return res.json({
      success: true,
      data: val || DEFAULT_PLATFORM_IDENTITY,
      supported_timezones: TIMEZONE_CONFIGS
    });
  } catch (err) {
    console.error('getSettings error:', err);
    return res.json({
      success: true,
      data: DEFAULT_PLATFORM_IDENTITY,
      supported_timezones: TIMEZONE_CONFIGS
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const {
      app_name,
      tagline,
      app_logo_url,
      app_favicon_url,
      active_theme,
      timezone_offset,
      service_fee_nominal,
      support_whatsapp,
      bank_accounts
    } = req.body;

    const list = await db.findMany('system_settings', { key_name: 'platform_identity' });
    let current = list.length > 0 ? list[0] : null;

    const currentValue = current ? current.value_json : {};
    const updatedValue = {
      ...currentValue,
      ...req.body,
      service_fee_nominal: req.body.service_fee_nominal !== undefined ? parseFloat(req.body.service_fee_nominal) : (currentValue.service_fee_nominal || 35000),
      timezone_label: (req.body.timezone_offset && TIMEZONE_CONFIGS[req.body.timezone_offset]?.label) || currentValue.timezone_label || 'WIB (UTC+7)'
    };

    if (current) {
      await db.update('system_settings', current.id, { value_json: updatedValue });
    } else {
      await db.create('system_settings', {
        key_name: 'platform_identity',
        value_json: updatedValue
      });
    }

    return res.json({
      success: true,
      message: 'Pengaturan identitas branding platform berhasil diperbarui!',
      data: updatedValue
    });
  } catch (err) {
    console.error('updateSettings error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui pengaturan sistem.' });
  }
};

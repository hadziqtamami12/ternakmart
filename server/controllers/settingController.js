// settingController.js - Platform Identity, Dynamic Branding & Regional Timezone Configuration
const db = require('../database/adapter');
const { TIMEZONE_CONFIGS } = require('../utils/timezone');

exports.getSettings = async (req, res) => {
  try {
    const list = await db.findMany('system_settings', { key_name: 'platform_identity' });
    let settings = list.length > 0 ? list[0] : null;

    if (!settings) {
      settings = await db.create('system_settings', {
        key_name: 'platform_identity',
        value_json: {
          app_name: 'Ternakmart',
          tagline: 'Platform E-Commerce Peternakan & Logistik Armada Mandiri Terpercaya',
          app_logo_url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=128&auto=format&fit=crop&q=80',
          app_favicon_url: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
          active_theme: 'emerald-agro',
          timezone_offset: 'Asia/Jakarta',
          timezone_label: 'WIB (UTC+7)',
          service_fee_nominal: 35000,
          support_whatsapp: '+6281234567890'
        }
      });
    }

    return res.json({
      success: true,
      data: settings.value_json,
      supported_timezones: TIMEZONE_CONFIGS
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memuat pengaturan sistem.' });
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

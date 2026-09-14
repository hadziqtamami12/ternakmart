// shippingSettingController.js - GoTernak & 3rd-Party Expedition Settings
const db = require('../database/adapter');

exports.getShippingSettings = async (req, res) => {
  try {
    let settings = await db.findMany('shipping_settings', {});
    if (!settings || settings.length === 0) {
      // Create default
      const defaultSetting = await db.create('shipping_settings', {
        id: 'ship_setting_global',
        goternak_enabled: true,
        goternak_base_fee: 20000,
        goternak_per_km_fee: 4000,
        goternak_min_distance_km: 1.0,
        third_party_enabled: true,
        third_party_api_key: 'sandbox_ternak_api_key_88921',
        third_party_base_url: 'https://api.ekspedisi-kargo.id/v1',
        active_couriers: ['JNE Trucking (JTR)', 'SiCepat Gokil', 'Kalog Ternak'],
        is_production: false
      });
      settings = [defaultSetting];
    }
    return res.json({ success: true, data: settings[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil pengaturan pengiriman: ' + err.message });
  }
};

exports.updateShippingSettings = async (req, res) => {
  try {
    const {
      goternak_enabled,
      goternak_base_fee,
      goternak_per_km_fee,
      goternak_min_distance_km,
      third_party_enabled,
      third_party_api_key,
      third_party_base_url,
      active_couriers,
      is_production
    } = req.body;

    const list = await db.findMany('shipping_settings', {});
    const targetId = list.length > 0 ? list[0].id : 'ship_setting_global';

    const payload = {};
    if (goternak_enabled !== undefined) payload.goternak_enabled = Boolean(goternak_enabled);
    if (goternak_base_fee !== undefined) payload.goternak_base_fee = parseFloat(goternak_base_fee);
    if (goternak_per_km_fee !== undefined) payload.goternak_per_km_fee = parseFloat(goternak_per_km_fee);
    if (goternak_min_distance_km !== undefined) payload.goternak_min_distance_km = parseFloat(goternak_min_distance_km);
    if (third_party_enabled !== undefined) payload.third_party_enabled = Boolean(third_party_enabled);
    if (third_party_api_key !== undefined) payload.third_party_api_key = third_party_api_key;
    if (third_party_base_url !== undefined) payload.third_party_base_url = third_party_base_url;
    if (active_couriers !== undefined) payload.active_couriers = active_couriers;
    if (is_production !== undefined) payload.is_production = Boolean(is_production);

    let updated;
    if (list.length > 0) {
      updated = await db.update('shipping_settings', targetId, payload);
    } else {
      payload.id = targetId;
      updated = await db.create('shipping_settings', payload);
    }

    return res.json({
      success: true,
      message: 'Pengaturan logistik & ekspedisi berhasil disimpan.',
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui pengaturan pengiriman: ' + err.message });
  }
};

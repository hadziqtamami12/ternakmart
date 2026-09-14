-- 002_badges_addresses_shipping.sql
-- Skema DDL & Seeders Fitur Badges, Multi-Alamat (Tikor), Buka Toko, dan Shipping Settings

-- 1. Tabel Badges
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon_name VARCHAR(50) NOT NULL DEFAULT 'Award',
  badge_color VARCHAR(50) NOT NULL DEFAULT '#64748b',
  min_successful_orders INT NOT NULL DEFAULT 0,
  min_turnover_idr DECIMAL(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Alter / Relasi Users
ALTER TABLE users ADD COLUMN IF NOT EXISTS badge_id VARCHAR(64) REFERENCES badges(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_store BOOLEAN DEFAULT FALSE;

-- 3. Tabel User Addresses (Multi-Alamat + Titik Koordinat Tikor)
CREATE TABLE IF NOT EXISTS user_addresses (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(60) NOT NULL DEFAULT 'Rumah',
  recipient_name VARCHAR(150) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  full_address TEXT NOT NULL,
  province VARCHAR(100) NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '',
  district VARCHAR(100) NOT NULL DEFAULT '',
  postal_code VARCHAR(20) NOT NULL DEFAULT '',
  latitude DECIMAL(10, 7) NOT NULL DEFAULT -6.2088,
  longitude DECIMAL(10, 7) NOT NULL DEFAULT 106.8456,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Alter / Update Stores
ALTER TABLE stores ADD COLUMN IF NOT EXISTS slug VARCHAR(160);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(30);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS pickup_address_id VARCHAR(64) REFERENCES user_addresses(id) ON DELETE SET NULL;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 5. Tabel Shipping Settings
CREATE TABLE IF NOT EXISTS shipping_settings (
  id VARCHAR(64) PRIMARY KEY,
  goternak_enabled BOOLEAN DEFAULT TRUE,
  goternak_base_fee DECIMAL(14, 2) NOT NULL DEFAULT 20000,
  goternak_per_km_fee DECIMAL(14, 2) NOT NULL DEFAULT 4000,
  goternak_min_distance_km DECIMAL(6, 2) NOT NULL DEFAULT 1.0,
  third_party_enabled BOOLEAN DEFAULT TRUE,
  third_party_api_key VARCHAR(255) DEFAULT 'sandbox_ternak_api_key_88921',
  third_party_base_url VARCHAR(255) DEFAULT 'https://api.ekspedisi-kargo.id/v1',
  active_couriers JSONB DEFAULT '["JNE Trucking (JTR)", "SiCepat Gokil", "Kalog Ternak"]'::jsonb,
  is_production BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Initial Seed Data
INSERT INTO badges (id, name, slug, icon_name, badge_color, min_successful_orders, min_turnover_idr, created_at, updated_at)
VALUES 
  ('bdg_silver', 'Silver Member', 'silver-member', 'Shield', '#94a3b8', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('bdg_gold', 'Gold Merchant / Breeder', 'gold-breeder', 'Award', '#eab308', 5, 10000000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('bdg_platinum', 'Platinum Farm Partner', 'platinum-partner', 'Sparkles', '#06b6d4', 20, 50000000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  badge_color = EXCLUDED.badge_color,
  min_successful_orders = EXCLUDED.min_successful_orders,
  min_turnover_idr = EXCLUDED.min_turnover_idr;

-- Seed Shipping Settings (Single Record)
INSERT INTO shipping_settings (id, goternak_enabled, goternak_base_fee, goternak_per_km_fee, third_party_enabled, created_at, updated_at)
VALUES 
  ('ship_setting_global', TRUE, 20000, 4000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET 
  goternak_enabled = EXCLUDED.goternak_enabled,
  goternak_base_fee = EXCLUDED.goternak_base_fee,
  goternak_per_km_fee = EXCLUDED.goternak_per_km_fee;

-- Update existing users with default badges & has_store flag
UPDATE users SET badge_id = 'bdg_platinum', has_store = TRUE WHERE id IN ('usr_seller_001', 'usr_seller_002');
UPDATE users SET badge_id = 'bdg_silver', has_store = FALSE WHERE id IN ('usr_buyer_001', 'usr_courier_001');
UPDATE users SET badge_id = 'bdg_platinum', has_store = FALSE WHERE id = 'usr_admin_001';

-- Update stores slug & is_verified from store_slug
UPDATE stores SET slug = store_slug WHERE slug IS NULL;
UPDATE stores SET is_verified = TRUE WHERE status = 'ACTIVE';
UPDATE stores SET whatsapp_number = '+6281398765432' WHERE id = 'store_001' AND whatsapp_number IS NULL;
UPDATE stores SET whatsapp_number = '+6281223344556' WHERE id = 'store_002' AND whatsapp_number IS NULL;

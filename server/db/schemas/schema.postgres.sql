-- ==============================================================================
-- TERNAKMART NATIVE POSTGRESQL / SUPABASE SCHEMA (NO PRISMA)
-- File: server/db/schemas/schema.postgres.sql
-- ==============================================================================

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(60) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  avatar_url TEXT,
  address TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  role VARCHAR(20) NOT NULL DEFAULT 'BUYER' CHECK (role IN ('BUYER', 'SELLER', 'COURIER', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. STORES / KANDANG PETERNAKAN (MULTI-VENDOR)
CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(150) NOT NULL,
  store_slug VARCHAR(160) UNIQUE NOT NULL,
  description TEXT,
  farm_address TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  farm_photo_url TEXT,
  nib_sku_number VARCHAR(100),
  bank_name VARCHAR(50),
  bank_account_number VARCHAR(60),
  bank_account_holder VARCHAR(150),
  status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED')),
  rating_average DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. LIVESTOCKS / HEWAN TERNAK
CREATE TABLE IF NOT EXISTS livestocks (
  id VARCHAR(64) PRIMARY KEY,
  store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('SAPI', 'KAMBING', 'DOMBA', 'KERBAU', 'UNGGAS', 'KUDA', 'KELINCI')),
  breed VARCHAR(100) NOT NULL,
  weight_kg DECIMAL(8, 2) NOT NULL,
  age_months INT NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('JANTAN', 'BETINA')),
  teeth_poel VARCHAR(30) NOT NULL DEFAULT 'BELUM_POEL',
  vaccination_status TEXT,
  skkh_certificate_url TEXT,
  skkh_verification_status BOOLEAN DEFAULT FALSE,
  price DECIMAL(14, 2) NOT NULL,
  is_qurban_eligible BOOLEAN DEFAULT TRUE,
  status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED', 'IN_TRANSIT', 'DELIVERED')),
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  buyer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  store_id VARCHAR(64) NOT NULL REFERENCES stores(id),
  animal_id VARCHAR(64) NOT NULL REFERENCES livestocks(id),
  base_price DECIMAL(14, 2) NOT NULL,
  store_discount DECIMAL(14, 2) DEFAULT 0.0,
  admin_discount DECIMAL(14, 2) DEFAULT 0.0,
  shipping_fee DECIMAL(14, 2) NOT NULL,
  shipping_subsidy DECIMAL(14, 2) DEFAULT 0.0,
  service_fee DECIMAL(14, 2) DEFAULT 0.0,
  grand_total DECIMAL(14, 2) NOT NULL,
  payment_method VARCHAR(40) NOT NULL CHECK (payment_method IN ('MANUAL_TRANSFER', 'GATEWAY')),
  payment_status VARCHAR(40) DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'AWAITING_APPROVAL', 'PAID', 'REJECTED')),
  payment_proof_url TEXT,
  status VARCHAR(40) DEFAULT 'AWAITING_PAYMENT' CHECK (status IN ('AWAITING_PAYMENT', 'HEALTH_INSPECTION', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED')),
  delivery_address TEXT NOT NULL,
  dest_lat DECIMAL(10, 7) NOT NULL,
  dest_lng DECIMAL(10, 7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ORDER TRACKINGS (LIVE MAP CHECKPOINTS)
CREATE TABLE IF NOT EXISTS order_trackings (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  courier_id VARCHAR(64) REFERENCES users(id),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  status_label VARCHAR(255) NOT NULL,
  notes TEXT,
  is_rest_stop BOOLEAN DEFAULT FALSE,
  proof_photo_url TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CHAT MESSAGES (NEGO & DISKUSI TERNAK)
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(64) PRIMARY KEY,
  sender_id VARCHAR(64) NOT NULL REFERENCES users(id),
  receiver_id VARCHAR(64) NOT NULL REFERENCES users(id),
  animal_context_id VARCHAR(64) REFERENCES livestocks(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  negotiated_price DECIMAL(14, 2),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. PUSH SUBSCRIPTIONS (PWA BACKGROUND NOTIF)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. SEO CONFIGURATIONS
CREATE TABLE IF NOT EXISTS seo_configs (
  id VARCHAR(64) PRIMARY KEY,
  page_route VARCHAR(150) UNIQUE NOT NULL,
  meta_title VARCHAR(200) NOT NULL,
  meta_description TEXT NOT NULL,
  focus_keywords TEXT,
  canonical_url TEXT,
  og_title VARCHAR(200),
  og_description TEXT,
  og_image_url TEXT,
  twitter_card_type VARCHAR(50) DEFAULT 'summary_large_image',
  jsonld_schema_type VARCHAR(50) DEFAULT 'Product',
  custom_schema JSONB,
  is_indexable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. APP SETTINGS (THEME & PLATFORM CONFIG)
CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(64) PRIMARY KEY,
  key_name VARCHAR(100) UNIQUE NOT NULL,
  value_json JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_livestocks_category ON livestocks(category);
CREATE INDEX IF NOT EXISTS idx_livestocks_status ON livestocks(status);
CREATE INDEX IF NOT EXISTS idx_livestocks_price ON livestocks(price);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_users ON chat_messages(sender_id, receiver_id);

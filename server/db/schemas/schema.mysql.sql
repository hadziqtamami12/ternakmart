-- ==============================================================================
-- TERNAKMART NATIVE MYSQL SCHEMA (NO PRISMA, INNODB, INDEXED)
-- File: server/db/schemas/schema.mysql.sql
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  avatar_url TEXT NULL,
  address TEXT NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  role ENUM('BUYER', 'SELLER', 'COURIER', 'ADMIN') NOT NULL DEFAULT 'BUYER',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. STORES / KANDANG (MULTI-VENDOR)
CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  store_name VARCHAR(150) NOT NULL,
  store_slug VARCHAR(160) NOT NULL UNIQUE,
  description TEXT NULL,
  farm_address TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  farm_photo_url TEXT NULL,
  nib_sku_number VARCHAR(100) NULL,
  bank_name VARCHAR(50) NULL,
  bank_account_number VARCHAR(60) NULL,
  bank_account_holder VARCHAR(150) NULL,
  status ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED') DEFAULT 'PENDING',
  rating_average DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stores_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  icon VARCHAR(50) NULL,
  description TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. LIVESTOCKS
CREATE TABLE IF NOT EXISTS livestocks (
  id VARCHAR(64) PRIMARY KEY,
  store_id VARCHAR(64) NOT NULL,
  category_id VARCHAR(64) NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category ENUM('SAPI', 'KAMBING', 'DOMBA', 'KERBAU', 'UNGGAS', 'KUDA', 'KELINCI') NOT NULL,
  breed VARCHAR(100) NOT NULL,
  weight_kg DECIMAL(8, 2) NOT NULL,
  age_months INT NOT NULL,
  gender ENUM('JANTAN', 'BETINA') NOT NULL,
  teeth_poel VARCHAR(30) DEFAULT 'BELUM_POEL',
  vaccination_status TEXT NULL,
  skkh_certificate_url TEXT NULL,
  skkh_verification_status BOOLEAN DEFAULT FALSE,
  price DECIMAL(14, 2) NOT NULL,
  is_qurban_eligible BOOLEAN DEFAULT TRUE,
  status ENUM('AVAILABLE', 'BOOKED', 'IN_TRANSIT', 'DELIVERED') DEFAULT 'AVAILABLE',
  images JSON NULL,
  video_url TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_livestock_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT fk_livestock_cat FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  buyer_id VARCHAR(64) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  animal_id VARCHAR(64) NOT NULL,
  base_price DECIMAL(14, 2) NOT NULL,
  store_discount DECIMAL(14, 2) DEFAULT 0.0,
  admin_discount DECIMAL(14, 2) DEFAULT 0.0,
  shipping_fee DECIMAL(14, 2) NOT NULL,
  shipping_subsidy DECIMAL(14, 2) DEFAULT 0.0,
  service_fee DECIMAL(14, 2) DEFAULT 0.0,
  grand_total DECIMAL(14, 2) NOT NULL,
  payment_method ENUM('MANUAL_TRANSFER', 'GATEWAY') NOT NULL,
  payment_status ENUM('UNPAID', 'AWAITING_APPROVAL', 'PAID', 'REJECTED') DEFAULT 'UNPAID',
  payment_proof_url TEXT NULL,
  status ENUM('AWAITING_PAYMENT', 'HEALTH_INSPECTION', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED') DEFAULT 'AWAITING_PAYMENT',
  delivery_address TEXT NOT NULL,
  dest_lat DECIMAL(10, 7) NOT NULL,
  dest_lng DECIMAL(10, 7) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
  CONSTRAINT fk_orders_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_orders_animal FOREIGN KEY (animal_id) REFERENCES livestocks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ORDER TRACKINGS
CREATE TABLE IF NOT EXISTS order_trackings (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  courier_id VARCHAR(64) NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  status_label VARCHAR(255) NOT NULL,
  notes TEXT NULL,
  is_rest_stop BOOLEAN DEFAULT FALSE,
  proof_photo_url TEXT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tracking_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(64) PRIMARY KEY,
  sender_id VARCHAR(64) NOT NULL,
  receiver_id VARCHAR(64) NOT NULL,
  animal_context_id VARCHAR(64) NULL,
  message TEXT NOT NULL,
  attachment_url TEXT NULL,
  negotiated_price DECIMAL(14, 2) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_sender FOREIGN KEY (sender_id) REFERENCES users(id),
  CONSTRAINT fk_chat_receiver FOREIGN KEY (receiver_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. PUSH SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  endpoint VARCHAR(512) NOT NULL UNIQUE,
  keys JSON NOT NULL,
  user_agent TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. SEO CONFIGS
CREATE TABLE IF NOT EXISTS seo_configs (
  id VARCHAR(64) PRIMARY KEY,
  page_route VARCHAR(150) NOT NULL UNIQUE,
  meta_title VARCHAR(200) NOT NULL,
  meta_description TEXT NOT NULL,
  focus_keywords TEXT NULL,
  canonical_url TEXT NULL,
  og_title VARCHAR(200) NULL,
  og_description TEXT NULL,
  og_image_url TEXT NULL,
  twitter_card_type VARCHAR(50) DEFAULT 'summary_large_image',
  jsonld_schema_type VARCHAR(50) DEFAULT 'Product',
  custom_schema JSON NULL,
  is_indexable BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. APP SETTINGS
CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(64) PRIMARY KEY,
  key_name VARCHAR(100) NOT NULL UNIQUE,
  value_json JSON NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

// adapter.js - Multi-Database Agnostic Abstraction Layer
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
let uuidv4 = () => crypto.randomUUID();
try {
  const uuid = require('uuid');
  if (uuid && uuid.v4) uuidv4 = uuid.v4;
} catch (e) {}
const initialSeeds = require('./seedData');

const MOCK_STORE_FILE = path.join(__dirname, 'mockStore.json');

class MockDatabaseDriver {
  constructor() {
    this.store = {};
    this.isInitialized = false;
  }

  async connect() {
    try {
      if (fs.existsSync(MOCK_STORE_FILE)) {
        const fileData = fs.readFileSync(MOCK_STORE_FILE, 'utf8');
        this.store = JSON.parse(fileData);
        // Resiliently ensure all collections exist with default seeds if missing
        for (const [colKey, seedList] of Object.entries(initialSeeds)) {
          if (!this.store[colKey] || !Array.isArray(this.store[colKey]) || this.store[colKey].length === 0) {
            this.store[colKey] = JSON.parse(JSON.stringify(seedList));
          }
        }
      } else {
        await this.resetToDefaults();
      }
      this.isInitialized = true;
      console.log('✅ [Database] Connected to In-Memory/JSON Mock Database Adapter');
      return true;
    } catch (err) {
      console.warn('⚠️ [Database] Mock store read error, reinitializing default seeds:', err.message);
      await this.resetToDefaults();
      return true;
    }
  }

  async resetToDefaults() {
    this.store = {
      users: JSON.parse(JSON.stringify(initialSeeds.users || [])),
      stores: JSON.parse(JSON.stringify(initialSeeds.stores || [])),
      animals: JSON.parse(JSON.stringify(initialSeeds.animals || [])),
      carts: JSON.parse(JSON.stringify(initialSeeds.carts || [])),
      orders: JSON.parse(JSON.stringify(initialSeeds.orders || [])),
      order_tracking_logs: JSON.parse(JSON.stringify(initialSeeds.order_tracking_logs || [])),
      order_audit_logs: JSON.parse(JSON.stringify(initialSeeds.order_audit_logs || [])),
      courier_fleets: JSON.parse(JSON.stringify(initialSeeds.courier_fleets || [])),
      chats: JSON.parse(JSON.stringify(initialSeeds.chats || [])),
      reviews: JSON.parse(JSON.stringify(initialSeeds.reviews || [])),
      vouchers: JSON.parse(JSON.stringify(initialSeeds.vouchers || [])),
      system_settings: JSON.parse(JSON.stringify(initialSeeds.system_settings || [])),
      badges: JSON.parse(JSON.stringify(initialSeeds.badges || [])),
      user_addresses: JSON.parse(JSON.stringify(initialSeeds.user_addresses || [])),
      shipping_settings: JSON.parse(JSON.stringify(initialSeeds.shipping_settings || [])),
      hero_banners: JSON.parse(JSON.stringify(initialSeeds.hero_banners || []))
    };
    await this.persist();
  }

  async persist() {
    try {
      for (const [colKey, seedList] of Object.entries(initialSeeds)) {
        if (!this.store[colKey] || !Array.isArray(this.store[colKey])) {
          this.store[colKey] = JSON.parse(JSON.stringify(seedList));
        }
      }
      fs.writeFileSync(MOCK_STORE_FILE, JSON.stringify(this.store, null, 2), 'utf8');
    } catch (err) {
      console.error('❌ [Database] Failed to write mockStore.json:', err.message);
    }
  }

  _getCollection(collection) {
    if (!this.store[collection] || !Array.isArray(this.store[collection])) {
      if (initialSeeds && initialSeeds[collection]) {
        this.store[collection] = JSON.parse(JSON.stringify(initialSeeds[collection]));
      } else {
        this.store[collection] = [];
      }
    }
    return this.store[collection];
  }

  async findMany(collection, query = {}) {
    const list = this._getCollection(collection);
    const filterKeys = Object.keys(query).filter(k => !k.startsWith('_'));

    let results = list.filter(item => {
      for (const key of filterKeys) {
        const expected = query[key];
        if (expected === undefined || expected === null) continue;

        // Special handling for array includes or nested match
        if (Array.isArray(expected)) {
          if (!expected.includes(item[key])) return false;
        } else if (typeof expected === 'object' && expected !== null) {
          if (expected.$gt !== undefined && item[key] <= expected.$gt) return false;
          if (expected.$gte !== undefined && item[key] < expected.$gte) return false;
          if (expected.$lt !== undefined && item[key] >= expected.$lt) return false;
          if (expected.$lte !== undefined && item[key] > expected.$lte) return false;
          if (expected.$ne !== undefined && item[key] === expected.$ne) return false;
          if (expected.$regex !== undefined) {
            const re = new RegExp(expected.$regex, expected.$options || 'i');
            if (!re.test(String(item[key] || ''))) return false;
          }
        } else {
          if (String(item[key]).toLowerCase() !== String(expected).toLowerCase()) {
            return false;
          }
        }
      }
      return true;
    });

    // Sorting
    if (query._sort) {
      const sortField = query._sort;
      const order = query._order === 'asc' ? 1 : -1;
      results.sort((a, b) => {
        if (a[sortField] > b[sortField]) return order;
        if (a[sortField] < b[sortField]) return -order;
        return 0;
      });
    }

    // Pagination
    if (query._limit) {
      const page = parseInt(query._page || 1, 10);
      const limit = parseInt(query._limit, 10);
      const start = (page - 1) * limit;
      results = results.slice(start, start + limit);
    }

    return JSON.parse(JSON.stringify(results));
  }

  async findById(collection, id) {
    const list = this._getCollection(collection);
    const item = list.find(i => String(i.id) === String(id));
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async create(collection, data) {
    const list = this._getCollection(collection);
    const now = new Date().toISOString();
    const newItem = {
      id: data.id || `${collection.slice(0, 3)}_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
      ...data,
      created_at: data.created_at || now,
      updated_at: data.updated_at || now
    };
    list.push(newItem);
    await this.persist();
    return JSON.parse(JSON.stringify(newItem));
  }

  async update(collection, id, data) {
    const list = this._getCollection(collection);
    const index = list.findIndex(i => String(i.id) === String(id));
    if (index === -1) return null;

    const now = new Date().toISOString();
    const updated = {
      ...list[index],
      ...data,
      updated_at: now
    };
    list[index] = updated;
    await this.persist();
    return JSON.parse(JSON.stringify(updated));
  }

  async delete(collection, id) {
    const list = this._getCollection(collection);
    const index = list.findIndex(i => String(i.id) === String(id));
    if (index === -1) return false;

    list.splice(index, 1);
    await this.persist();
    return true;
  }

  async transaction(callback) {
    // Snapshot state for rollback safety
    const snapshot = JSON.stringify(this.store);
    try {
      const result = await callback(this);
      await this.persist();
      return result;
    } catch (err) {
      this.store = JSON.parse(snapshot);
      await this.persist();
      throw err;
    }
  }
}

const TABLES_WITH_UPDATED_AT = [
  'users', 'stores', 'animals', 'carts', 'orders', 'courier_fleets', 'vouchers', 'push_subscriptions', 'seo_configs', 'system_settings',
  'badges', 'user_addresses', 'shipping_settings', 'hero_banners'
];

// Relational / PostgreSQL / Supabase Driver Implementation
class PostgresDatabaseDriver {
  constructor(driverName = 'Supabase/PostgreSQL') {
    this.driverName = driverName;
    this.pool = null;
    this.fallback = new MockDatabaseDriver();
    this.isUsingFallback = false;
  }

  async connect() {
    console.log(`📡 [Database] Connecting to ${this.driverName}...`);
    // Ensure in-memory/JSON fallback is always pre-warmed with full seed catalog
    try {
      await this.fallback.connect();
    } catch (e) {
      console.warn('⚠️ [Database] Fallback pre-warm notice:', e.message);
    }

    const connStr = process.env.DATABASE_URL || process.env.DIRECT_URL;
    if (!connStr) {
      console.warn(`⚠️ [Database] DATABASE_URL not set for ${this.driverName}. Falling back seamlessly to Mock driver.`);
      this.isUsingFallback = true;
      return true;
    }

    try {
      let pg;
      try {
        pg = require('pg');
      } catch (e) {
        pg = require(path.join(__dirname, '../node_modules/pg'));
      }
      const { Pool } = pg;
      this.pool = new Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      });

      const res = await this.pool.query('SELECT 1 as connected');
      if (res && res.rows) {
        console.log(`✅ [Database] ${this.driverName} connected successfully (Live Cloud Engine Active).`);
        this.isUsingFallback = false;

        // Auto-ensure essential relational tables/columns exist in live Postgres
        try {
          await this.pool.query(`
            CREATE TABLE IF NOT EXISTS hero_banners (
              id VARCHAR(64) PRIMARY KEY,
              badge VARCHAR(100),
              "categoryBadge" VARCHAR(100),
              tag VARCHAR(100),
              title VARCHAR(255) NOT NULL,
              subtitle TEXT,
              cta VARCHAR(100),
              category VARCHAR(50),
              image TEXT NOT NULL,
              is_active BOOLEAN DEFAULT TRUE,
              sort_order INT DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
          `);
        } catch (schemaErr) {
          console.warn('⚠️ [Database] Postgres schema check notice:', schemaErr.message);
        }

        return true;
      }
      throw new Error('Connection verification failed');
    } catch (err) {
      console.warn(`⚠️ [Database] ${this.driverName} error: ${err.message}. Seamlessly falling back to Mock driver.`);
      this.isUsingFallback = true;
      return true;
    }
  }

  async executeSql(sql) {
    if (this.isUsingFallback || !this.pool) {
      return;
    }
    return await this.pool.query(sql);
  }

  async query(text, params = []) {
    if (this.isUsingFallback || !this.pool) {
      return { rows: [], rowCount: 0 };
    }
    return await this.pool.query(text, params);
  }

  async findMany(collection, query = {}) {
    if (this.isUsingFallback || !this.pool) {
      return this.fallback.findMany(collection, query);
    }
    try {
      const filterKeys = Object.keys(query).filter(k => !k.startsWith('_'));
      let sql = `SELECT * FROM "${collection}"`;
      const values = [];
      const whereClauses = [];

      filterKeys.forEach(key => {
        const val = query[key];
        if (val !== undefined && val !== null) {
          values.push(val);
          whereClauses.push(`"${key}" = $${values.length}`);
        }
      });

      if (whereClauses.length > 0) {
        sql += ` WHERE ` + whereClauses.join(' AND ');
      }

      if (query._sort) {
        const order = query._order === 'asc' ? 'ASC' : 'DESC';
        sql += ` ORDER BY "${query._sort}" ${order}`;
      } else if (collection === 'system_settings') {
        sql += ` ORDER BY updated_at DESC`;
      } else {
        sql += ` ORDER BY created_at DESC`;
      }

      if (query._limit) {
        const limit = parseInt(query._limit, 10);
        const page = parseInt(query._page || 1, 10);
        const offset = (page - 1) * limit;
        sql += ` LIMIT ${limit} OFFSET ${offset}`;
      }

      const res = await this.pool.query(sql, values);
      return res.rows;
    } catch (err) {
      console.warn(`⚠️ [Postgres findMany error on '${collection}']: ${err.message}. Using fallback.`);
      return this.fallback.findMany(collection, query);
    }
  }

  async findById(collection, id) {
    if (this.isUsingFallback || !this.pool) {
      return this.fallback.findById(collection, id);
    }
    try {
      const res = await this.pool.query(`SELECT * FROM "${collection}" WHERE id = $1 LIMIT 1`, [id]);
      return res.rows[0] || null;
    } catch (err) {
      console.warn(`⚠️ [Postgres findById error on '${collection}']: ${err.message}`);
      return this.fallback.findById(collection, id);
    }
  }

  async create(collection, data) {
    if (this.isUsingFallback || !this.pool) {
      return this.fallback.create(collection, data);
    }
    try {
      const payload = { ...data };
      if (!payload.id) {
        payload.id = `${collection.slice(0, 3)}_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
      }
      const TABLES_WITH_UPDATED_AT = ['users', 'stores', 'animals', 'carts', 'orders', 'courier_fleets', 'vouchers', 'push_subscriptions', 'seo_configs', 'system_settings'];
      const now = new Date().toISOString();
      if (!payload.created_at && !['order_tracking_logs', 'order_audit_logs'].includes(collection)) {
        payload.created_at = now;
      }
      if (TABLES_WITH_UPDATED_AT.includes(collection) && !payload.updated_at) {
        payload.updated_at = now;
      }

      const keys = Object.keys(payload);
      const cols = keys.map(k => `"${k}"`).join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const values = keys.map(k => {
        const v = payload[k];
        if (typeof v === 'object' && v !== null && !(v instanceof Date)) {
          return JSON.stringify(v);
        }
        return v;
      });

      const sql = `INSERT INTO "${collection}" (${cols}) VALUES (${placeholders}) RETURNING *`;
      const res = await this.pool.query(sql, values);
      return res.rows[0];
    } catch (err) {
      console.warn(`⚠️ [Postgres create error on '${collection}']: ${err.message}`);
      return this.fallback.create(collection, data);
    }
  }

  async update(collection, id, data) {
    if (this.isUsingFallback || !this.pool) {
      return this.fallback.update(collection, id, data);
    }
    try {
      const TABLES_WITH_UPDATED_AT = ['users', 'stores', 'animals', 'carts', 'orders', 'courier_fleets', 'vouchers', 'push_subscriptions', 'seo_configs', 'system_settings'];
      const payload = { ...data };
      if (TABLES_WITH_UPDATED_AT.includes(collection)) {
        payload.updated_at = new Date().toISOString();
      }
      delete payload.id;

      const keys = Object.keys(payload);
      if (keys.length === 0) return await this.findById(collection, id);

      const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
      const values = keys.map(k => {
        const v = payload[k];
        if (typeof v === 'object' && v !== null && !(v instanceof Date)) {
          return JSON.stringify(v);
        }
        return v;
      });
      values.push(id);

      const sql = `UPDATE "${collection}" SET ${setClauses} WHERE id = $${values.length} RETURNING *`;
      const res = await this.pool.query(sql, values);
      return res.rows[0] || null;
    } catch (err) {
      console.warn(`⚠️ [Postgres update error on '${collection}']: ${err.message}`);
      return this.fallback.update(collection, id, data);
    }
  }

  async delete(collection, id) {
    if (this.isUsingFallback || !this.pool) {
      return this.fallback.delete(collection, id);
    }
    try {
      const res = await this.pool.query(`DELETE FROM "${collection}" WHERE id = $1`, [id]);
      return res.rowCount > 0;
    } catch (err) {
      console.warn(`⚠️ [Postgres delete error on '${collection}']: ${err.message}`);
      return this.fallback.delete(collection, id);
    }
  }

  async transaction(callback) {
    if (this.isUsingFallback || !this.pool) {
      return this.fallback.transaction(callback);
    }
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(this);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async resetToDefaults() {
    await this.fallback.resetToDefaults();
  }
}

// Factory Selector
function createDatabaseAdapter() {
  const driver = (process.env.DB_DRIVER || 'supabase').toLowerCase();

  switch (driver) {
    case 'postgres':
    case 'postgresql':
      return new PostgresDatabaseDriver('PostgreSQL');
    case 'supabase':
      return new PostgresDatabaseDriver('Supabase');
    case 'mock':
    default:
      return new MockDatabaseDriver();
  }
}

const db = createDatabaseAdapter();

module.exports = db;

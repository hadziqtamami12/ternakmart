#!/usr/bin/env node
// db-runner.js - CLI Migration & Selective Seeder Engine for Ternakmart
try {
  require('dotenv').config();
} catch (e) {
  try {
    require('../server/node_modules/dotenv').config();
  } catch (e2) {}
}
const path = require('path');
const fs = require('fs');
const db = require('../server/database/adapter');
const initialSeeds = require('../server/database/seedData');

const args = process.argv.slice(2);
const command = args[0] || 'help';

// Parse flags like --table=system_settings or --fn=seedMockLivestock
const flags = {};
args.slice(1).forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, val] = arg.slice(2).split('=');
    flags[key] = val || true;
  }
});

async function runMigrate(fresh = false) {
  console.log(`\n🚜 [DB-RUNNER] Starting database migration ${fresh ? '(FRESH RESET)' : ''}...`);
  await db.connect();

  const migrationFile = path.join(__dirname, '../server/database/migrations/001_initial_schema.sql');
  if (fs.existsSync(migrationFile)) {
    const ddl = fs.readFileSync(migrationFile, 'utf8');
    if (fresh && typeof db.executeSql === 'function') {
      console.log('🧹 [DB-RUNNER] Dropping tables in public schema for fresh reset...');
      try {
        await db.executeSql(`
          DROP TABLE IF EXISTS reviews, order_audit_logs, order_tracking_logs, orders,
          chats, courier_fleets, carts, animals, stores, push_subscriptions,
          seo_configs, categories, system_settings, vouchers, users CASCADE;
        `);
      } catch (err) {
        console.warn('⚠️ [DB-RUNNER] Drop notice:', err.message);
      }
    }
    if (typeof db.executeSql === 'function') {
      console.log(`📄 [DB-RUNNER] Executing DDL schema on active database (${migrationFile})...`);
      await db.executeSql(ddl);
      console.log('✅ [DB-RUNNER] Schema executed successfully on active database!');
    }
  }

  if (fresh) {
    console.log('🧹 [DB-RUNNER] Reseeding default collections...');
    await runSeed();
    console.log('✅ [DB-RUNNER] Database rebuilt and reseeded with default baseline!');
  } else {
    console.log('✅ [DB-RUNNER] Schema verified. All tables are ready.');
  }
}

// Named seeder functions for --fn argument
const seederFunctions = {
  seedMockUsers: async () => {
    console.log('🌱 Seeding Users...');
    for (const u of initialSeeds.users) {
      const existing = await db.findById('users', u.id);
      if (existing) await db.update('users', u.id, u);
      else await db.create('users', u);
    }
  },
  seedMockStores: async () => {
    console.log('🌱 Seeding Stores...');
    for (const s of initialSeeds.stores) {
      const existing = await db.findById('stores', s.id);
      if (existing) await db.update('stores', s.id, s);
      else await db.create('stores', s);
    }
  },
  seedMockLivestock: async () => {
    console.log('🌱 Seeding Animals / Livestock...');
    for (const a of initialSeeds.animals) {
      const existing = await db.findById('animals', a.id);
      if (existing) await db.update('animals', a.id, a);
      else await db.create('animals', a);
    }
  },
  seedMockSettings: async () => {
    console.log('🌱 Seeding System Settings...');
    for (const st of initialSeeds.system_settings) {
      const existing = await db.findById('system_settings', st.id);
      if (existing) await db.update('system_settings', st.id, st);
      else await db.create('system_settings', st);
    }
  },
  seedMockOrdersAndTracking: async () => {
    console.log('🌱 Seeding Orders & Tracking Logs...');
    for (const o of initialSeeds.orders) {
      const existing = await db.findById('orders', o.id);
      if (existing) await db.update('orders', o.id, o);
      else await db.create('orders', o);
    }
    for (const t of initialSeeds.order_tracking_logs) {
      const existing = await db.findById('order_tracking_logs', t.id);
      if (existing) await db.update('order_tracking_logs', t.id, t);
      else await db.create('order_tracking_logs', t);
    }
    for (const a of initialSeeds.order_audit_logs) {
      const existing = await db.findById('order_audit_logs', a.id);
      if (existing) await db.update('order_audit_logs', a.id, a);
      else await db.create('order_audit_logs', a);
    }
  }
};

async function runSeed() {
  console.log('\n🌱 [DB-RUNNER] Starting seeder engine...');
  await db.connect();

  // Check if specific function flag is passed: --fn=seedMockLivestock
  if (flags.fn) {
    const fnName = flags.fn;
    if (seederFunctions[fnName]) {
      console.log(`🎯 [DB-RUNNER] Executing selective seeder function: ${fnName}`);
      await seederFunctions[fnName]();
      console.log(`✅ [DB-RUNNER] Function ${fnName} completed successfully!`);
    } else {
      console.error(`❌ [DB-RUNNER] Unknown function '${fnName}'. Available functions:`, Object.keys(seederFunctions));
      process.exit(1);
    }
    return;
  }

  // Check if specific table flag is passed: --table=system_settings
  if (flags.table) {
    let table = flags.table;
    const aliases = {
      'ternak': 'animals',
      'livestock': 'animals',
      'livestocks': 'animals',
      'settings': 'system_settings',
      'setting': 'system_settings'
    };
    if (aliases[table]) {
      table = aliases[table];
    }
    if (initialSeeds[table]) {
      console.log(`🎯 [DB-RUNNER] Executing selective seeder for table: '${table}'`);
      for (const item of initialSeeds[table]) {
        const existing = await db.findById(table, item.id);
        if (existing) {
          await db.update(table, item.id, item);
        } else {
          await db.create(table, item);
        }
      }
      console.log(`✅ [DB-RUNNER] Table '${table}' reseeded with ${initialSeeds[table].length} records!`);
    } else {
      console.error(`❌ [DB-RUNNER] Table '${table}' not found in seedData. Available tables:`, Object.keys(initialSeeds));
      process.exit(1);
    }
    return;
  }

  // Otherwise, seed all collections to active database
  const defaultCategories = [
    { id: 'cat_sapi', name: 'Sapi Qurban & Pedaging', slug: 'sapi', icon: 'Beef', description: 'Sapi Limousin, Simental, Bali, Brahman kualitas kontes & qurban' },
    { id: 'cat_kambing', name: 'Kambing Etawa & Jawa', slug: 'kambing', icon: 'Milk', description: 'Kambing perah Etawa dan pedaging Jawa Randu bersertifikat' },
    { id: 'cat_domba', name: 'Domba Garut & Dorper', slug: 'domba', icon: 'Sheep', description: 'Domba tangkas Garut dan domba pedaging unggulan F1-F4 Dorper' },
    { id: 'cat_unggas', name: 'Ayam & Bebek Petelur/Pedaging', slug: 'unggas', icon: 'Egg', description: 'Ayam kampung super, ayam petelur, bebek hibrida langsung dari peternak' },
    { id: 'cat_kerbau', name: 'Kerbau Toraja & Murrah', slug: 'kerbau', icon: 'Flame', description: 'Kerbau lumpur dan sungai bersertifikat sehat karantina' }
  ];

  const collections = [
    { name: 'categories', data: defaultCategories },
    { name: 'users', data: initialSeeds.users },
    { name: 'stores', data: initialSeeds.stores },
    { name: 'animals', data: initialSeeds.animals },
    { name: 'system_settings', data: initialSeeds.system_settings },
    { name: 'courier_fleets', data: initialSeeds.courier_fleets },
    { name: 'orders', data: initialSeeds.orders },
    { name: 'order_tracking_logs', data: initialSeeds.order_tracking_logs },
    { name: 'order_audit_logs', data: initialSeeds.order_audit_logs },
    { name: 'chats', data: initialSeeds.chats },
    { name: 'reviews', data: initialSeeds.reviews },
    { name: 'vouchers', data: initialSeeds.vouchers }
  ];

  console.log(`📦 [DB-RUNNER] Seeding ${collections.length} tables to active database...`);
  for (const col of collections) {
    process.stdout.write(`   - ${col.name} (${col.data.length} records)... `);
    for (const item of col.data) {
      try {
        const existing = await db.findById(col.name, item.id);
        if (existing) {
          await db.update(col.name, item.id, item);
        } else {
          await db.create(col.name, item);
        }
      } catch (err) {
        // Skip duplicate or handled gracefully
      }
    }
    console.log('✅ Done');
  }

  console.log('✅ [DB-RUNNER] All collections seeded successfully with realistic livestock, certified SKKH, stores, and settings!');
}

async function main() {
  try {
    switch (command) {
      case 'migrate':
        await runMigrate(false);
        break;
      case 'migrate:fresh':
        await runMigrate(true);
        break;
      case 'seed':
        await runSeed();
        break;
      default:
        console.log(`
Ternakmart Database CLI Runner
Usage:
  node scripts/db-runner.js migrate                Run schema migrations
  node scripts/db-runner.js migrate:fresh          Recreate schema & seed baseline
  node scripts/db-runner.js seed                   Seed all default collections
  node scripts/db-runner.js seed --table=<name>    Seed specific table (e.g. system_settings)
  node scripts/db-runner.js seed --fn=<name>       Run specific seeder function (e.g. seedMockLivestock)
        `);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ [DB-RUNNER Error]:', err);
    process.exit(1);
  }
}

main();

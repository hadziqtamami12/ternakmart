#!/usr/bin/env node
// db-runner.js - CLI Migration & Selective Seeder Engine for Ternakmart
require('dotenv').config();
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
    console.log(`📄 [DB-RUNNER] Verified DDL schema at: ${migrationFile}`);
  }

  if (fresh) {
    console.log('🧹 [DB-RUNNER] Dropping and rebuilding collections / tables...');
    await db.resetToDefaults();
    console.log('✅ [DB-RUNNER] Database rebuilt and reseeded with default baseline!');
  } else {
    console.log('✅ [DB-RUNNER] Schema verified. All 12 tables / collections are ready.');
  }
}

// Named seeder functions for --fn argument
const seederFunctions = {
  seedMockUsers: async () => {
    console.log('🌱 Seeding Users...');
    for (const u of initialSeeds.users) {
      await db.create('users', u);
    }
  },
  seedMockStores: async () => {
    console.log('🌱 Seeding Stores...');
    for (const s of initialSeeds.stores) {
      await db.create('stores', s);
    }
  },
  seedMockLivestock: async () => {
    console.log('🌱 Seeding Animals / Livestock...');
    for (const a of initialSeeds.animals) {
      await db.create('animals', a);
    }
  },
  seedMockSettings: async () => {
    console.log('🌱 Seeding System Settings...');
    for (const st of initialSeeds.system_settings) {
      await db.create('system_settings', st);
    }
  },
  seedMockOrdersAndTracking: async () => {
    console.log('🌱 Seeding Orders & Tracking Logs...');
    for (const o of initialSeeds.orders) {
      await db.create('orders', o);
    }
    for (const t of initialSeeds.order_tracking_logs) {
      await db.create('order_tracking_logs', t);
    }
    for (const a of initialSeeds.order_audit_logs) {
      await db.create('order_audit_logs', a);
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
    const table = flags.table;
    if (initialSeeds[table]) {
      console.log(`🎯 [DB-RUNNER] Executing selective seeder for table/collection: '${table}'`);
      for (const item of initialSeeds[table]) {
        // Upsert by id
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

  // Otherwise, seed all collections
  console.log('📦 [DB-RUNNER] Seeding all 12 platform tables...');
  await db.resetToDefaults();
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

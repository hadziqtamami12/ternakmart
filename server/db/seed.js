#!/usr/bin/env node
/**
 * server/db/seed.js
 * Native Selective Database Seeder Runner (Zero Prisma)
 */

try { require('dotenv').config(); } catch (e) {}
const path = require('path');

const args = process.argv.slice(2);
let targetTable = null;
args.forEach(arg => {
  if (arg.startsWith('--table=')) {
    targetTable = arg.split('=')[1];
  }
});

async function runSeed() {
  console.log(`\n🌱 [SEEDER] Memulai proses Seeder Database Native...`);
  const initialSeeds = require('../database/seedData');
  const db = require('../database/adapter');
  await db.connect();

  if (targetTable) {
    const aliasMap = {
      ternak: 'animals',
      livestocks: 'animals',
      settings: 'system_settings'
    };
    const table = aliasMap[targetTable] || targetTable;

    if (!initialSeeds[table]) {
      console.error(`❌ [SEEDER] Tabel '${targetTable}' tidak ditemukan.`);
      process.exit(1);
    }

    console.log(`🎯 [SEEDER] Seeding tabel spesifik: '${table}'...`);
    for (const item of initialSeeds[table]) {
      const existing = await db.findById(table, item.id);
      if (existing) {
        await db.update(table, item.id, item);
      } else {
        await db.create(table, item);
      }
    }
    console.log(`✅ [SEEDER] Tabel '${table}' berhasil direseed dengan ${initialSeeds[table].length} records!\n`);
    return;
  }

  // Seed all baseline data
  console.log('📦 [SEEDER] Seeding seluruh tabel dengan hewan ternak realistis, SKKH terverifikasi, dan peternakan...');
  await db.resetToDefaults();
  console.log('✅ [SEEDER] Seluruh data baseline berhasil direseed!\n');
}

runSeed().catch(err => {
  console.error('❌ [SEEDER ERROR]:', err);
  process.exit(1);
});

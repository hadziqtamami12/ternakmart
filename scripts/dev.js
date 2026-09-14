#!/usr/bin/env node
/**
 * scripts/dev.js
 * Zero-Dependency Concurrent Dev Server Runner for TernakMart
 * Runs both Express/Serverless Backend & Vite Frontend with clean colored outputs.
 * Eliminates "concurrently is not recognized" errors on fresh clones.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');
const SERVER_DIR = path.join(ROOT_DIR, 'server');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');

// ANSI Color helper for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(tag, color, message) {
  const lines = message.toString().split('\n');
  for (const line of lines) {
    if (line.trim().length > 0) {
      console.log(`${color}${colors.bright}[${tag}]${colors.reset} ${line}`);
    }
  }
}

console.log(`
${colors.green}${colors.bright}======================================================
🚜 TERNAKMART FULL-STACK DEVELOPMENT RUNNER
======================================================${colors.reset}
`);

// Verify if client/server node_modules exist, or inform user
const clientModules = path.join(CLIENT_DIR, 'node_modules');
const serverModules = path.join(SERVER_DIR, 'node_modules');

if (!fs.existsSync(clientModules) || !fs.existsSync(serverModules)) {
  console.log(`${colors.yellow}⚠️  Dependencies missing in client or server. Bootstrapping...${colors.reset}`);
}

// 1. Spawn Backend API Server
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const nodeCmd = process.execPath;

const serverProcess = spawn(nodeCmd, ['--watch', '--watch-path=server', 'server/server.js'], {
  cwd: ROOT_DIR,
  env: { ...process.env, PORT: process.env.PORT || '5000' },
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

serverProcess.stdout.on('data', (chunk) => log('API', colors.cyan, chunk));
serverProcess.stderr.on('data', (chunk) => log('API', colors.yellow, chunk));

// 2. Spawn Vite Frontend Client
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: CLIENT_DIR,
  env: { ...process.env },
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

clientProcess.stdout.on('data', (chunk) => log('WEB', colors.green, chunk));
clientProcess.stderr.on('data', (chunk) => log('WEB', colors.red, chunk));

// Graceful Exit Handler
function handleExit(code) {
  console.log(`\n${colors.yellow}Shutting down TernakMart dev servers...${colors.reset}`);
  try {
    if (!serverProcess.killed) serverProcess.kill('SIGTERM');
  } catch (e) {}
  try {
    if (!clientProcess.killed) clientProcess.kill('SIGTERM');
  } catch (e) {}
  process.exit(code || 0);
}

process.on('SIGINT', () => handleExit(0));
process.on('SIGTERM', () => handleExit(0));
process.on('exit', () => handleExit(0));

serverProcess.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`${colors.red}[API Server exited with code ${code}]${colors.reset}`);
  }
});

clientProcess.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`${colors.red}[Client Server exited with code ${code}]${colors.reset}`);
  }
});

#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function startProcess(command, args, name, color) {
  const process = spawn(command, args, {
    cwd: projectRoot,
    stdio: 'pipe',
    shell: true,
  });

  process.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      log(`[${name}] ${line}`, color);
    });
  });

  process.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      log(`[${name}] ${line}`, 'red');
    });
  });

  process.on('close', (code) => {
    log(`[${name}] Process exited with code ${code}`, code === 0 ? 'green' : 'red');
  });

  return process;
}

async function main() {
  log('🚀 Starting development servers...', 'bright');
  log('📡 Express API server will start on http://localhost:5000', 'blue');
  log('⚡ Vite dev server will start on http://localhost:3000', 'green');
  log('🔗 API calls from frontend will be proxied to Express server', 'yellow');
  log('', 'reset');

  // Start Express server first
  const apiServer = startProcess('npm', ['run', 'dev:api'], 'API', 'blue');
  
  // Wait a bit for API server to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Start Vite dev server
  const viteServer = startProcess('npm', ['run', 'dev'], 'VITE', 'green');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down development servers...', 'yellow');
    apiServer.kill('SIGINT');
    viteServer.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    apiServer.kill('SIGTERM');
    viteServer.kill('SIGTERM');
    process.exit(0);
  });
}

main().catch(console.error);

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=====================================================');
console.log(' Starting CarePortal Botanical Sanctuary Application');
console.log('=====================================================');

// 1. Launch Backend Server (Port 4000)
const backend = spawn(process.execPath, ['backend/src/server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// 2. Launch Frontend Dev Server (Port 5173)
const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

const frontend = spawn(npxCmd, ['vite', '--host', '127.0.0.1'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: isWin
});

const cleanup = () => {
  console.log('\nShutting down CarePortal services...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

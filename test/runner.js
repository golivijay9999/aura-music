const { spawn } = require('child_process');
const path = require('path');

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // wait a bit
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

async function main() {
  console.log('🚀 Spawning Aura Music Server for Testing...');
  const server = spawn('node', ['server/index.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  try {
    const isReady = await waitForServer('http://localhost:5000/api/health');
    if (!isReady) {
      throw new Error('Server failed to start within timeout');
    }

    console.log('📡 Server is live. Running tests...\n');
    const testProcess = spawn('node', ['test/suite.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    testProcess.on('exit', (code) => {
      server.kill();
      process.exit(code || 0);
    });
  } catch (err) {
    console.error('Runner error:', err);
    server.kill();
    process.exit(1);
  }
}

main();

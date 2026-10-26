const localtunnel = require('localtunnel');

async function startTunnel() {
  console.log('🌐 Opening secure worldwide public link for Aura Music on port 5000...');
  try {
    const tunnel = await localtunnel({ port: 5000 });

    console.log('\n======================================================');
    console.log('🚀 AURA MUSIC IS NOW ACCESSIBLE ANYWHERE IN THE WORLD!');
    console.log(`🔗 Public URL: ${tunnel.url}`);
    console.log('📱 Open this link on your phone (Chrome/Safari) anywhere!');
    console.log('======================================================\n');

    tunnel.on('close', () => {
      console.log('Tunnel closed.');
    });
  } catch (err) {
    console.error('Failed to create tunnel:', err.message);
  }
}

startTunnel();

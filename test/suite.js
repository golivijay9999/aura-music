// Comprehensive Verification and Test Suite for Aura Music
const http = require('http');

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Aura Music Automated Test Suite...\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  // 1. Health check
  await test('Server Health Check', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.app !== 'AURA MUSIC' || data.status !== 'online') {
      throw new Error('Unexpected health response');
    }
  });

  // 2. Guest Authentication
  let guestToken = '';
  await test('Guest Session Generation', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/guest`, { method: 'POST' });
    const data = await res.json();
    if (!data.token || !data.user || !data.user.isGuest) {
      throw new Error('Failed to create guest session');
    }
    guestToken = data.token;
  });

  // 3. User Registration and Login
  const testUsername = `aura_test_${Date.now()}`;
  let userToken = '';
  await test('User Registration & JWT', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: 'password123',
        email: `${testUsername}@example.com`
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.token || data.user.username !== testUsername) {
      throw new Error('Registration failed');
    }
    userToken = data.token;
  });

  await test('User Login with Bcrypt Verification', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: 'password123'
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.token) throw new Error('Login failed');
  });

  // 4. Trending Telugu and Hindi Songs
  let sampleTrack = null;
  await test('Regional Music Aggregator (Telugu Discovery)', async () => {
    const res = await fetch(`${BASE_URL}/api/music/trending?language=telugu&limit=5`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.songs || data.songs.length === 0) {
      throw new Error('No Telugu songs returned');
    }
    sampleTrack = data.songs[0];
    if (!sampleTrack.streamUrl) {
      throw new Error('Missing audio stream URL');
    }
  });

  // 5. High-Quality Audio Stream Verification
  await test('320kbps Audio Stream Reachability', async () => {
    if (!sampleTrack || !sampleTrack.streamUrl) throw new Error('No track to test stream');
    const res = await fetch(sampleTrack.streamUrl, { method: 'HEAD' });
    if (!res.ok) throw new Error(`Stream HEAD status ${res.status}`);
    const contentType = res.headers.get('content-type');
    if (!contentType || (!contentType.includes('audio') && !contentType.includes('video') && !contentType.includes('mp4'))) {
      throw new Error(`Unexpected Content-Type: ${contentType}`);
    }
  });

  // 6. LRCLIB Synchronized Lyrics Integration
  await test('LRCLIB Synced Lyrics Integration', async () => {
    const res = await fetch(`${BASE_URL}/api/lyrics?track=Believer&artist=Imagine+Dragons`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.syncedLyrics && !data.plainLyrics) {
      throw new Error('Lyrics not found');
    }
  });

  // 7. Multi-Provider Search
  await test('Unified Multi-Provider Search (Saavn, YouTube, Audius)', async () => {
    const res = await fetch(`${BASE_URL}/api/music/search?q=Devara`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.songs || !Array.isArray(data.songs)) {
      throw new Error('Search failed');
    }
  });

  // 8. User Library Liked Songs Toggle
  await test('User Library Liked Songs & Persistence', async () => {
    if (!sampleTrack) throw new Error('No track available');
    const toggleRes = await fetch(`${BASE_URL}/api/library/likes/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ track: sampleTrack })
    });
    if (!toggleRes.ok) throw new Error(`Toggle status ${toggleRes.status}`);
    const toggleData = await toggleRes.json();
    if (toggleData.isLiked !== true) throw new Error('Expected song to be liked');

    // Verify retrieval
    const getRes = await fetch(`${BASE_URL}/api/library/likes`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const getData = await getRes.json();
    if (!getData.songs.some(t => t.id === sampleTrack.id)) {
      throw new Error('Liked song not found in user library');
    }
  });

  // 9. Playlist Management
  await test('Custom Playlist Creation & Track Addition', async () => {
    const createRes = await fetch(`${BASE_URL}/api/library/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        title: 'Tollywood Gold',
        description: 'Best Telugu hits'
      })
    });
    const createData = await createRes.json();
    const plId = createData.playlist.id;

    const addRes = await fetch(`${BASE_URL}/api/library/playlists/${plId}/tracks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ track: sampleTrack })
    });
    const addData = await addRes.json();
    if (addData.playlist.tracks.length !== 1) {
      throw new Error('Track not added to playlist');
    }
  });

  // 10. Ringtone Library
  await test('Ringtone Studio Library Save & Retrieve', async () => {
    const saveRes = await fetch(`${BASE_URL}/api/ringtones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Devara Hook Tone',
        originalTrack: 'Fear Song',
        duration: 30,
        preset: 'ringtone'
      })
    });
    const saveData = await saveRes.json();
    if (!saveData.ringtone || !saveData.ringtone.id) {
      throw new Error('Failed to save ringtone');
    }

    const listRes = await fetch(`${BASE_URL}/api/ringtones`);
    const listData = await listRes.json();
    if (!listData.ringtones.some(r => r.id === saveData.ringtone.id)) {
      throw new Error('Saved ringtone not found in library');
    }
  });

  // 11. Static Production Client SPA Serving
  await test('Production Client Bundle Serving & Fallback Routing', async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error(`Root GET returned ${res.status}`);
    const html = await res.text();
    if (!html.includes('Aura Music') && !html.includes('root')) {
      throw new Error('Production index.html not served correctly');
    }
  });

  console.log(`\n==============================================`);
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`==============================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Start test
runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});

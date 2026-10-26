const AUDIUS_APP_NAME = 'AURAMUSIC';
const AUDIUS_HOST = 'https://api.audius.co';

class AudiusService {
  async getTrending(limit = 20) {
    try {
      const res = await fetch(`${AUDIUS_HOST}/v1/tracks/trending?app_name=${AUDIUS_APP_NAME}&limit=${limit}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).map(t => this.formatTrack(t)).filter(Boolean);
    } catch (err) {
      console.error('Audius trending error:', err.message);
      return [];
    }
  }

  async search(query, limit = 20) {
    try {
      const res = await fetch(`${AUDIUS_HOST}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${AUDIUS_APP_NAME}&limit=${limit}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).map(t => this.formatTrack(t)).filter(Boolean);
    } catch (err) {
      console.error('Audius search error:', err.message);
      return [];
    }
  }

  formatTrack(t) {
    if (!t || !t.id) return null;
    const streamUrl = `${AUDIUS_HOST}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`;
    const artwork = t.artwork?.['480x480'] || t.artwork?.['150x150'] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';

    return {
      id: `audius_${t.id}`,
      title: t.title || 'Untitled Track',
      artist: t.user?.name || 'Indie Artist',
      album: t.genre ? `${t.genre} Collection` : 'Independent Release',
      year: new Date(t.release_date || Date.now()).getFullYear().toString(),
      duration: t.duration || 180,
      artwork,
      streamUrl,
      stream160: streamUrl,
      stream320: streamUrl,
      downloadUrl: streamUrl,
      language: 'english',
      hasLyrics: false,
      provider: 'audius',
      isDownloadable: true,
      isYouTube: false,
      genre: t.genre || 'Electronic / Indie'
    };
  }
}

module.exports = new AudiusService();

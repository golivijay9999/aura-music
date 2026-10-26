const CryptoJS = require('crypto-js');

const SAAVN_BASE = 'https://www.jiosaavn.com/api.php';
const DES_KEY = CryptoJS.enc.Utf8.parse('38346591');

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&copy;/g, '©');
}

function decryptMediaUrl(encUrl) {
  if (!encUrl) return null;
  try {
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encUrl) },
      DES_KEY,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error('DES decryption error:', err.message);
    return null;
  }
}

function getHighQualityArtwork(url) {
  if (!url) return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80';
  return url.replace('150x150', '500x500').replace('50x50', '500x500');
}

function formatTrack(raw) {
  if (!raw) return null;
  const more = raw.more_info || {};
  const encMedia = more.encrypted_media_url;
  let baseMedia = decryptMediaUrl(encMedia);

  let streamUrl = '';
  let stream320 = '';
  let stream160 = '';

  if (baseMedia) {
    stream320 = baseMedia.replace(/_96\.mp4$/, '_320.mp4');
    stream160 = baseMedia.replace(/_96\.mp4$/, '_160.mp4');
    // Default to 320 for premium fidelity, fallback to base
    streamUrl = stream320 || baseMedia;
  } else if (more.media_preview_url) {
    streamUrl = more.media_preview_url;
  }

  const durationSec = parseInt(raw.duration || more.duration || 0, 10);
  const title = decodeEntities(raw.title || raw.song || 'Unknown Track');
  const artist = decodeEntities(more.artistMap?.primary_artists?.map(a => a.name).join(', ') || more.singers || raw.subtitle || 'Various Artists');
  const album = decodeEntities(more.album || raw.album || 'Single');
  const artwork = getHighQualityArtwork(raw.image);

  return {
    id: String(raw.id),
    title,
    artist,
    album,
    year: more.year || raw.year || '',
    duration: durationSec,
    artwork,
    streamUrl,
    stream160: stream160 || streamUrl,
    stream320: stream320 || streamUrl,
    downloadUrl: stream320 || streamUrl, // Direct high-speed CDN audio URL
    language: raw.language || more.language || 'telugu',
    hasLyrics: more.has_lyrics === 'true' || more.has_lyrics === true,
    provider: 'saavn',
    isDownloadable: true,
    isYouTube: false,
    genre: more.genre || 'Film / Regional'
  };
}

async function fetchSaavn(params) {
  const query = new URLSearchParams({
    _format: 'json',
    _marker: '0',
    api_version: '4',
    ctx: 'web6dot0',
    ...params
  });
  const url = `${SAAVN_BASE}?${query.toString()}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*'
    }
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    // Some responses have leading junk
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    }
    throw new Error('Invalid JSON from Saavn');
  }
}

class SaavnService {
  async searchSongs(query, page = 1, limit = 20) {
    try {
      const data = await fetchSaavn({
        __call: 'search.getResults',
        q: query,
        p: page,
        n: limit
      });
      const results = (data.results || []).map(formatTrack).filter(t => t && t.streamUrl);
      return {
        total: data.total || results.length,
        results
      };
    } catch (err) {
      console.error('Saavn search error:', err.message);
      return { total: 0, results: [] };
    }
  }

  async getTrending(language = 'all', limit = 25) {
    let q = 'top hits';
    if (language && language !== 'all') {
      q = `${language} trending hits`;
    }
    const res = await this.searchSongs(q, 1, limit);
    return res.results;
  }

  async getByLanguage(language, limit = 30) {
    const q = `${language} latest songs`;
    const res = await this.searchSongs(q, 1, limit);
    return res.results;
  }

  async getByGenre(genre, limit = 25) {
    const q = `${genre} songs`;
    const res = await this.searchSongs(q, 1, limit);
    return res.results;
  }

  async getSongDetails(id) {
    try {
      const data = await fetchSaavn({
        __call: 'song.getDetails',
        pids: id
      });
      const raw = data[id] || (data.songs && data.songs[0]);
      if (raw) {
        return formatTrack(raw);
      }
      return null;
    } catch (err) {
      console.error('Saavn getSongDetails error:', err.message);
      return null;
    }
  }

  async getAlbumDetails(albumId) {
    try {
      const data = await fetchSaavn({
        __call: 'content.getAlbumDetails',
        albumid: albumId
      });
      const tracks = (data.list || data.songs || []).map(formatTrack).filter(t => t && t.streamUrl);
      return {
        id: data.id || albumId,
        title: decodeEntities(data.title || data.name),
        artist: decodeEntities(data.primary_artists || data.artist),
        artwork: getHighQualityArtwork(data.image),
        year: data.year,
        tracks
      };
    } catch (err) {
      console.error('Saavn getAlbumDetails error:', err.message);
      return null;
    }
  }

  async getArtistTopSongs(artistName, limit = 20) {
    const res = await this.searchSongs(`${artistName} best songs`, 1, limit);
    return res.results;
  }
}

module.exports = new SaavnService();

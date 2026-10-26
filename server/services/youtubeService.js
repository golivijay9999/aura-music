const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

// High quality curated collection of trending music videos across Telugu, Hindi, Tamil & Global
const CURATED_YOUTUBE_TRACKS = [
  {
    id: 'yt_devara_fear',
    youtubeId: 'pS4fJbXJgqo',
    title: 'Fear Song (From "Devara Part 1")',
    artist: 'Anirudh Ravichander',
    album: 'Devara Part 1',
    duration: 195,
    language: 'telugu',
    artwork: 'https://i.ytimg.com/vi/pS4fJbXJgqo/hqdefault.jpg'
  },
  {
    id: 'yt_devara_chuttamalle',
    youtubeId: 'qf48Wp8j2p4',
    title: 'Chuttamalle (From "Devara Part 1")',
    artist: 'Shilpa Rao, Anirudh Ravichander',
    album: 'Devara Part 1',
    duration: 220,
    language: 'telugu',
    artwork: 'https://i.ytimg.com/vi/qf48Wp8j2p4/hqdefault.jpg'
  },
  {
    id: 'yt_kurchi_madathapetti',
    youtubeId: 'V9PBi_8iLqU',
    title: 'Kurchi Madathapetti (From "Guntur Kaaram")',
    artist: 'Thaman S, Sri Krishna, Sahithi Chaganti',
    album: 'Guntur Kaaram',
    duration: 215,
    language: 'telugu',
    artwork: 'https://i.ytimg.com/vi/V9PBi_8iLqU/hqdefault.jpg'
  },
  {
    id: 'yt_pushpa2_angaaron',
    youtubeId: 'tOMv2v9vQd4',
    title: 'Angaaron (The Couple Song) (From "Pushpa 2 The Rule")',
    artist: 'Shreya Ghoshal, Devi Sri Prasad',
    album: 'Pushpa 2 The Rule',
    duration: 260,
    language: 'telugu',
    artwork: 'https://i.ytimg.com/vi/tOMv2v9vQd4/hqdefault.jpg'
  },
  {
    id: 'yt_tauba_tauba',
    youtubeId: 'LK7-_dgAVQE',
    title: 'Tauba Tauba (From "Bad Newz")',
    artist: 'Karan Aujla',
    album: 'Bad Newz',
    duration: 208,
    language: 'hindi',
    artwork: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg'
  },
  {
    id: 'yt_apna_bana_le',
    youtubeId: 'ElZfdU54Cp8',
    title: 'Apna Bana Le (From "Bhediya")',
    artist: 'Arijit Singh, Sachin-Jigar',
    album: 'Bhediya',
    duration: 261,
    language: 'hindi',
    artwork: 'https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg'
  },
  {
    id: 'yt_hukum_jailer',
    youtubeId: '1F3hm6MfR1k',
    title: 'Hukum - Thalaivar Alappara (From "Jailer")',
    artist: 'Anirudh Ravichander',
    album: 'Jailer',
    duration: 202,
    language: 'tamil',
    artwork: 'https://i.ytimg.com/vi/1F3hm6MfR1k/hqdefault.jpg'
  },
  {
    id: 'yt_illuminati_aavesham',
    youtubeId: 'tOM-nWPcR4U',
    title: 'Illuminati (From "Aavesham")',
    artist: 'Sushin Shyam, Dabzee',
    album: 'Aavesham',
    duration: 194,
    language: 'malayalam',
    artwork: 'https://i.ytimg.com/vi/tOM-nWPcR4U/hqdefault.jpg'
  },
  {
    id: 'yt_espresso',
    youtubeId: 'eVli-tstM5E',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: 'Short n\' Sweet',
    duration: 175,
    language: 'english',
    artwork: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg'
  },
  {
    id: 'yt_believer',
    youtubeId: '7wtfhZwyrcc',
    title: 'Believer (Official Music Video)',
    artist: 'Imagine Dragons',
    album: 'Evolve',
    duration: 216,
    language: 'english',
    artwork: 'https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg'
  },
  {
    id: 'yt_blinding_lights',
    youtubeId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    language: 'english',
    artwork: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg'
  },
  {
    id: 'yt_naatu_naatu',
    youtubeId: 'OsU0CGZoV8E',
    title: 'Naatu Naatu (From "RRR")',
    artist: 'Rahul Sipligunj, Kaala Bhairava, M.M. Keeravaani',
    album: 'RRR',
    duration: 215,
    language: 'telugu',
    artwork: 'https://i.ytimg.com/vi/OsU0CGZoV8E/hqdefault.jpg'
  }
];

class YouTubeService {
  formatCurated(item) {
    return {
      id: item.id,
      youtubeId: item.youtubeId,
      title: item.title,
      artist: item.artist,
      album: item.album || 'YouTube Music',
      year: new Date().getFullYear().toString(),
      duration: item.duration || 200,
      artwork: item.artwork || `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`,
      streamUrl: '', // Played via official YouTube IFrame Player
      downloadUrl: '',
      language: item.language || 'english',
      hasLyrics: false,
      provider: 'youtube',
      isDownloadable: false, // Per policy: do not bypass YouTube download restrictions
      isYouTube: true,
      genre: 'Music Video / Live'
    };
  }

  async getTrending(limit = 12) {
    return CURATED_YOUTUBE_TRACKS.slice(0, limit).map(t => this.formatCurated(t));
  }

  async search(query, limit = 10) {
    // If YouTube Data API key is provided, query YouTube Data API v3 officially
    if (YOUTUBE_API_KEY) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' song')}&type=video&videoCategoryId=10&maxResults=${limit}&key=${YOUTUBE_API_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          return (data.items || []).map(item => ({
            id: `yt_${item.id.videoId}`,
            youtubeId: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            album: 'YouTube Music',
            year: new Date(item.snippet.publishedAt).getFullYear().toString(),
            duration: 210,
            artwork: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            streamUrl: '',
            downloadUrl: '',
            language: 'various',
            hasLyrics: false,
            provider: 'youtube',
            isDownloadable: false,
            isYouTube: true,
            genre: 'Music Video'
          }));
        }
      } catch (err) {
        console.error('YouTube API error:', err.message);
      }
    }

    // Match in curated or check if user pasted a YouTube URL / video ID
    const trimmed = query.trim();
    const urlMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/i);
    if (urlMatch && urlMatch[1]) {
      const vId = urlMatch[1];
      return [{
        id: `yt_${vId}`,
        youtubeId: vId,
        title: `YouTube Video (${vId})`,
        artist: 'YouTube Creator',
        album: 'YouTube Playback',
        year: new Date().getFullYear().toString(),
        duration: 200,
        artwork: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
        streamUrl: '',
        downloadUrl: '',
        language: 'various',
        hasLyrics: false,
        provider: 'youtube',
        isDownloadable: false,
        isYouTube: true,
        genre: 'Music Video'
      }];
    }

    // Filter curated catalog by query terms
    const qLower = query.toLowerCase();
    const matched = CURATED_YOUTUBE_TRACKS.filter(t =>
      t.title.toLowerCase().includes(qLower) ||
      t.artist.toLowerCase().includes(qLower) ||
      t.language.toLowerCase().includes(qLower)
    );

    if (matched.length > 0) {
      return matched.map(t => this.formatCurated(t));
    }

    // Fallback: return curated trending items
    return CURATED_YOUTUBE_TRACKS.slice(0, limit).map(t => this.formatCurated(t));
  }
}

module.exports = new YouTubeService();

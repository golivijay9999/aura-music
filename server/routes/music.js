const express = require('express');
const router = express.Router();
const saavnService = require('../services/saavnService');
const youtubeService = require('../services/youtubeService');
const audiusService = require('../services/audiusService');
const recommendationEngine = require('../services/recommendationEngine');

// Genre catalog with cover gradients and query terms
const GENRES = [
  { id: 'romantic', name: 'Romantic', color: 'from-pink-600 to-rose-900', query: 'romantic melodies' },
  { id: 'party', name: 'Party & Dance', color: 'from-amber-500 to-red-600', query: 'party dance mass hits' },
  { id: 'chill', name: 'Chill & Relax', color: 'from-teal-500 to-emerald-900', query: 'chill acoustic lo-fi' },
  { id: 'devotional', name: 'Devotional', color: 'from-orange-500 to-amber-700', query: 'bhakti devotional songs' },
  { id: 'workout', name: 'Workout & Energy', color: 'from-purple-600 to-indigo-900', query: 'gym workout high energy' },
  { id: 'retro', name: 'Golden Retro', color: 'from-yellow-600 to-orange-900', query: 'retro 90s classic hits' },
  { id: 'sad', name: 'Melancholy / Sad', color: 'from-blue-700 to-slate-900', query: 'heartbreak sad melody' },
  { id: 'lofi', name: 'Lo-Fi Chillhop', color: 'from-violet-600 to-purple-950', query: 'lo-fi beats chillhop' },
  { id: 'edm', name: 'EDM & Electronic', color: 'from-cyan-500 to-blue-800', query: 'electronic edm club' },
  { id: 'hiphop', name: 'Hip Hop & Rap', color: 'from-red-600 to-stone-900', query: 'hip hop rap' },
  { id: 'classical', name: 'Classical & Fusion', color: 'from-emerald-600 to-teal-950', query: 'carnatic hindustani classical fusion' },
  { id: 'acoustic', name: 'Acoustic Unplugged', color: 'from-rose-500 to-purple-800', query: 'unplugged acoustic guitar' }
];

// Language catalog
const LANGUAGES = [
  { id: 'telugu', name: 'Telugu', subtitle: 'Tollywood Hits, Melodies & Mass Beats', icon: '🎵', flag: '🇮🇳' },
  { id: 'hindi', name: 'Hindi', subtitle: 'Bollywood Top Charts, Indie & Romance', icon: '🎧', flag: '🇮🇳' },
  { id: 'tamil', name: 'Tamil', subtitle: 'Kollywood Anthems & Anirudh Vibes', icon: '🔥', flag: '🇮🇳' },
  { id: 'kannada', name: 'Kannada', subtitle: 'Sandalwood Melodies & Trending Tracks', icon: '✨', flag: '🇮🇳' },
  { id: 'malayalam', name: 'Malayalam', subtitle: 'Mollywood Feels & Sushin Shyam Hits', icon: '🌴', flag: '🇮🇳' },
  { id: 'english', name: 'English', subtitle: 'Global Billboard Top 100 & Pop Hits', icon: '🌍', flag: '🌐' },
  { id: 'punjabi', name: 'Punjabi', subtitle: 'High Voltage Bhangra & Punjabi Wave', icon: '⚡', flag: '🇮🇳' }
];

// Get Trending songs across languages
router.get('/trending', async (req, res) => {
  try {
    const { language = 'all', limit = 25 } = req.query;
    const songs = await saavnService.getTrending(language, parseInt(limit, 10));
    res.json({ songs });
  } catch (err) {
    console.error('Error fetching trending:', err);
    res.status(500).json({ error: 'Failed to fetch trending songs' });
  }
});

// Search across all providers (Saavn, YouTube, Audius)
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query "q" is required' });
    }

    const tasks = [];

    // Saavn search
    if (type === 'all' || type === 'songs' || type === 'saavn') {
      tasks.push(saavnService.searchSongs(q, parseInt(page, 10), parseInt(limit, 10)));
    } else {
      tasks.push(Promise.resolve({ results: [], total: 0 }));
    }

    // YouTube search
    if (type === 'all' || type === 'youtube') {
      tasks.push(youtubeService.search(q, 8));
    } else {
      tasks.push(Promise.resolve([]));
    }

    // Audius search for open license tracks
    if (type === 'all' || type === 'audius' || type === 'open') {
      tasks.push(audiusService.search(q, 6));
    } else {
      tasks.push(Promise.resolve([]));
    }

    const [saavnRes, ytRes, audiusRes] = await Promise.all(tasks);

    res.json({
      query: q,
      songs: saavnRes.results || [],
      youtube: ytRes || [],
      openLicensed: audiusRes || [],
      total: (saavnRes.total || 0) + (ytRes?.length || 0) + (audiusRes?.length || 0)
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to execute search' });
  }
});

// Get Song Details
router.get('/song/:id', async (req, res) => {
  try {
    const song = await saavnService.getSongDetails(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json({ song });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch song details' });
  }
});

// Get Album Details
router.get('/album/:id', async (req, res) => {
  try {
    const album = await saavnService.getAlbumDetails(req.params.id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.json({ album });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch album details' });
  }
});

// Get Artist Top Songs
router.get('/artist/:name', async (req, res) => {
  try {
    const songs = await saavnService.getArtistTopSongs(req.params.name, 25);
    res.json({ artist: req.params.name, songs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch artist songs' });
  }
});

// Get Available Genres
router.get('/genres', (req, res) => {
  res.json({ genres: GENRES });
});

// Get Songs for a specific Genre
router.get('/genre/:id', async (req, res) => {
  try {
    const genre = GENRES.find(g => g.id === req.params.id);
    const query = genre ? genre.query : req.params.id;
    const songs = await saavnService.getByGenre(query, 25);
    res.json({ genre: genre || { id: req.params.id, name: req.params.id }, songs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch genre songs' });
  }
});

// Get Available Languages
router.get('/languages', (req, res) => {
  res.json({ languages: LANGUAGES });
});

// Get Songs for a specific Language
router.get('/language/:id', async (req, res) => {
  try {
    const songs = await saavnService.getByLanguage(req.params.id, 30);
    res.json({ language: req.params.id, songs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch language songs' });
  }
});

// AI Recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { currentTrack, likedSongs = [], history = [], preferences = {} } = req.body;
    const recommendations = await recommendationEngine.getRecommendations({
      currentTrack,
      likedSongs,
      history,
      preferences
    });
    res.json({ recommendations });
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Smart Queue Generation
router.post('/smart-queue', async (req, res) => {
  try {
    const { currentTrack, existingQueue = [] } = req.body;
    const smartQueue = await recommendationEngine.getSmartQueue(currentTrack, existingQueue);
    res.json({ queue: smartQueue });
  } catch (err) {
    console.error('Smart queue error:', err);
    res.status(500).json({ error: 'Failed to generate smart queue' });
  }
});

// Similar Songs
router.post('/similar', async (req, res) => {
  try {
    const { track } = req.body;
    const similar = await recommendationEngine.getSimilarSongs(track);
    res.json({ similar });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch similar songs' });
  }
});

// Daily Mix
router.get('/daily-mix', async (req, res) => {
  try {
    const { language = 'telugu' } = req.query;
    const songs = await recommendationEngine.getDailyMix(language);
    res.json({ songs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch daily mix' });
  }
});

// YouTube Trending Videos
router.get('/youtube/trending', async (req, res) => {
  try {
    const videos = await youtubeService.getTrending(12);
    res.json({ videos });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch YouTube trending' });
  }
});

// Audius / Open License Trending (100% downloadable & ringtone-ready)
router.get('/open/trending', async (req, res) => {
  try {
    const tracks = await audiusService.getTrending(20);
    res.json({ tracks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch open licensed tracks' });
  }
});

module.exports = router;

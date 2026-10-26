const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const defaultData = {
  users: [],
  likedSongs: {}, // userId -> [trackIds]
  playlists: {},  // userId -> [playlistObjects]
  history: {},    // userId -> [historyItems]
  savedAlbums: {},// userId -> [albumIds]
  ringtones: []   // saved ringtones metadata
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
      return { ...defaultData };
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load DB, returning defaults:', err);
    return { ...defaultData };
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to save DB:', err);
  }
}

class Storage {
  constructor() {
    this.data = loadDB();
  }

  reload() {
    this.data = loadDB();
  }

  save() {
    saveDB(this.data);
  }

  // Users
  getUserByUsername(username) {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user) {
    this.data.users.push(user);
    this.data.likedSongs[user.id] = [];
    this.data.playlists[user.id] = [
      {
        id: `pl_favorites_${user.id}`,
        title: 'Favorites',
        description: 'Your favorite tracks in one place',
        artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
        tracks: [],
        createdAt: new Date().toISOString()
      }
    ];
    this.data.history[user.id] = [];
    this.data.savedAlbums[user.id] = [];
    this.save();
    return user;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // Liked Songs
  getLikedSongs(userId) {
    return this.data.likedSongs[userId] || [];
  }

  toggleLikeSong(userId, track) {
    if (!this.data.likedSongs[userId]) {
      this.data.likedSongs[userId] = [];
    }
    const list = this.data.likedSongs[userId];
    const existsIdx = list.findIndex(t => t.id === track.id);
    let isLiked = false;
    if (existsIdx >= 0) {
      list.splice(existsIdx, 1);
      isLiked = false;
    } else {
      list.unshift({ ...track, likedAt: new Date().toISOString() });
      isLiked = true;
    }
    this.save();
    return { isLiked, likedSongs: list };
  }

  // Playlists
  getPlaylists(userId) {
    return this.data.playlists[userId] || [];
  }

  createPlaylist(userId, playlist) {
    if (!this.data.playlists[userId]) {
      this.data.playlists[userId] = [];
    }
    const newPlaylist = {
      id: 'pl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: playlist.title || 'My Playlist',
      description: playlist.description || 'Curated playlist on Aura Music',
      artwork: playlist.artwork || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
      tracks: playlist.tracks || [],
      createdAt: new Date().toISOString()
    };
    this.data.playlists[userId].push(newPlaylist);
    this.save();
    return newPlaylist;
  }

  addTrackToPlaylist(userId, playlistId, track) {
    const list = this.data.playlists[userId] || [];
    const pl = list.find(p => p.id === playlistId);
    if (pl) {
      if (!pl.tracks.find(t => t.id === track.id)) {
        pl.tracks.push(track);
        this.save();
      }
      return pl;
    }
    return null;
  }

  removeTrackFromPlaylist(userId, playlistId, trackId) {
    const list = this.data.playlists[userId] || [];
    const pl = list.find(p => p.id === playlistId);
    if (pl) {
      pl.tracks = pl.tracks.filter(t => t.id !== trackId);
      this.save();
      return pl;
    }
    return null;
  }

  deletePlaylist(userId, playlistId) {
    if (this.data.playlists[userId]) {
      this.data.playlists[userId] = this.data.playlists[userId].filter(p => p.id !== playlistId);
      this.save();
      return true;
    }
    return false;
  }

  // History
  getHistory(userId) {
    return this.data.history[userId] || [];
  }

  addToHistory(userId, track) {
    if (!this.data.history[userId]) {
      this.data.history[userId] = [];
    }
    const list = this.data.history[userId];
    // Remove if already exists to put it at top
    const filtered = list.filter(t => t.id !== track.id);
    filtered.unshift({ ...track, playedAt: new Date().toISOString() });
    // Keep max 100 history items
    this.data.history[userId] = filtered.slice(0, 100);
    this.save();
    return this.data.history[userId];
  }

  clearHistory(userId) {
    this.data.history[userId] = [];
    this.save();
    return true;
  }

  // Ringtones
  getRingtones() {
    return this.data.ringtones || [];
  }

  saveRingtone(ringtone) {
    const item = {
      id: 'rt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      ...ringtone
    };
    this.data.ringtones.unshift(item);
    this.save();
    return item;
  }

  deleteRingtone(id) {
    this.data.ringtones = (this.data.ringtones || []).filter(r => r.id !== id);
    this.save();
    return true;
  }
}

module.exports = new Storage();

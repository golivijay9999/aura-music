const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { authenticate } = require('./auth');

// Get Liked Songs
router.get('/likes', authenticate, (req, res) => {
  const songs = storage.getLikedSongs(req.user.id);
  res.json({ songs });
});

// Toggle Like Song
router.post('/likes/toggle', authenticate, (req, res) => {
  const { track } = req.body;
  if (!track || !track.id) {
    return res.status(400).json({ error: 'Valid track object required' });
  }
  const result = storage.toggleLikeSong(req.user.id, track);
  res.json(result);
});

// Get User Playlists
router.get('/playlists', authenticate, (req, res) => {
  const playlists = storage.getPlaylists(req.user.id);
  res.json({ playlists });
});

// Create Playlist
router.post('/playlists', authenticate, (req, res) => {
  const { title, description, artwork } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Playlist title is required' });
  }
  const playlist = storage.createPlaylist(req.user.id, { title, description, artwork });
  res.json({ playlist });
});

// Add Track to Playlist
router.post('/playlists/:id/tracks', authenticate, (req, res) => {
  const { track } = req.body;
  if (!track || !track.id) {
    return res.status(400).json({ error: 'Valid track required' });
  }
  const updated = storage.addTrackToPlaylist(req.user.id, req.params.id, track);
  if (!updated) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  res.json({ playlist: updated });
});

// Remove Track from Playlist
router.delete('/playlists/:id/tracks/:trackId', authenticate, (req, res) => {
  const updated = storage.removeTrackFromPlaylist(req.user.id, req.params.id, req.params.trackId);
  if (!updated) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  res.json({ playlist: updated });
});

// Delete Playlist
router.delete('/playlists/:id', authenticate, (req, res) => {
  const success = storage.deletePlaylist(req.user.id, req.params.id);
  res.json({ success });
});

// Get Listening History
router.get('/history', authenticate, (req, res) => {
  const history = storage.getHistory(req.user.id);
  res.json({ history });
});

// Add to Listening History
router.post('/history', authenticate, (req, res) => {
  const { track } = req.body;
  if (!track || !track.id) {
    return res.status(400).json({ error: 'Valid track required' });
  }
  const updated = storage.addToHistory(req.user.id, track);
  res.json({ history: updated });
});

// Clear History
router.delete('/history', authenticate, (req, res) => {
  storage.clearHistory(req.user.id);
  res.json({ success: true });
});

module.exports = router;

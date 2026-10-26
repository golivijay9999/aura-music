const express = require('express');
const router = express.Router();
const storage = require('../services/storage');

// Get saved ringtones
router.get('/', (req, res) => {
  const ringtones = storage.getRingtones();
  res.json({ ringtones });
});

// Save a created ringtone
router.post('/', (req, res) => {
  const { title, originalTrack, startTime, endTime, duration, preset, audioData, size } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Ringtone title is required' });
  }

  const ringtone = storage.saveRingtone({
    title,
    originalTrack: originalTrack || 'Custom Audio',
    startTime: startTime || 0,
    endTime: endTime || duration || 30,
    duration: duration || 30,
    preset: preset || 'ringtone',
    audioData: audioData || '', // Base64 data URL for download / playback
    size: size || 'Unknown'
  });

  res.json({ ringtone });
});

// Delete ringtone
router.delete('/:id', (req, res) => {
  const success = storage.deleteRingtone(req.params.id);
  res.json({ success });
});

module.exports = router;

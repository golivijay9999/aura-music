const express = require('express');
const router = express.Router();

/**
 * Clean track title for better lyrics matching (e.g. remove "(From ...)" or "[Telugu]")
 */
function cleanTrackTitle(title) {
  if (!title) return '';
  return title
    .replace(/\s*\(From[^)]*\)/gi, '')
    .replace(/\s*\[[^\]]*\]/gi, '')
    .replace(/\s*\(Telugu\)/gi, '')
    .replace(/\s*\(Hindi\)/gi, '')
    .replace(/\s*\(Tamil\)/gi, '')
    .replace(/\s*\(Original[^)]*\)/gi, '')
    .replace(/\s*\(Official[^)]*\)/gi, '')
    .trim();
}

function cleanArtistName(artist) {
  if (!artist) return '';
  return artist.split(',')[0].trim();
}

// Get synchronized or plain lyrics via LRCLIB
router.get('/', async (req, res) => {
  try {
    const { track, artist, duration } = req.query;
    if (!track) {
      return res.status(400).json({ error: 'Track name is required' });
    }

    const cleanTitle = cleanTrackTitle(track);
    const cleanArt = cleanArtistName(artist);

    // 1. Try exact match on LRCLIB
    const params = new URLSearchParams({
      track_name: cleanTitle,
      artist_name: cleanArt
    });
    if (duration && !isNaN(duration)) {
      params.append('duration', Math.round(Number(duration)));
    }

    let lrcRes = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
      headers: {
        'User-Agent': 'AuraMusic/1.0 (https://auramusic.app)',
        'Accept': 'application/json'
      }
    });

    if (lrcRes.ok) {
      const data = await lrcRes.json();
      return res.json({
        syncedLyrics: data.syncedLyrics || null,
        plainLyrics: data.plainLyrics || null,
        instrumental: data.instrumental || false
      });
    }

    // 2. If exact match fails, try search
    const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle + ' ' + cleanArt)}`, {
      headers: {
        'User-Agent': 'AuraMusic/1.0 (https://auramusic.app)',
        'Accept': 'application/json'
      }
    });

    if (searchRes.ok) {
      const results = await searchRes.json();
      if (Array.isArray(results) && results.length > 0) {
        const best = results[0];
        return res.json({
          syncedLyrics: best.syncedLyrics || null,
          plainLyrics: best.plainLyrics || null,
          instrumental: best.instrumental || false
        });
      }
    }

    // No lyrics found
    res.json({
      syncedLyrics: null,
      plainLyrics: null,
      instrumental: false,
      message: 'No synchronized lyrics found for this track'
    });
  } catch (err) {
    console.error('Lyrics error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve lyrics' });
  }
});

module.exports = router;

const saavnService = require('./saavnService');
const audiusService = require('./audiusService');

class RecommendationEngine {
  /**
   * Generates intelligent recommendations based on user profile, likes, history and current track
   */
  async getRecommendations({ currentTrack, likedSongs = [], history = [], preferences = {} }) {
    const avoidIds = new Set([
      ...(currentTrack ? [currentTrack.id] : []),
      ...history.slice(0, 10).map(t => t.id)
    ]);

    let targetLanguage = preferences.language || (currentTrack ? currentTrack.language : 'telugu');
    let targetArtist = currentTrack ? currentTrack.artist.split(',')[0].trim() : '';

    // If user has liked songs, prioritize top liked artists and languages
    if (!targetArtist && likedSongs.length > 0) {
      const artistCounts = {};
      likedSongs.forEach(t => {
        const primary = (t.artist || '').split(',')[0].trim();
        if (primary) artistCounts[primary] = (artistCounts[primary] || 0) + 1;
      });
      const sortedArtists = Object.keys(artistCounts).sort((a, b) => artistCounts[b] - artistCounts[a]);
      if (sortedArtists[0]) targetArtist = sortedArtists[0];
    }

    let recommendations = [];

    // 1. Fetch similar songs based on target artist or track
    if (targetArtist) {
      const artistTracks = await saavnService.getArtistTopSongs(targetArtist, 10);
      recommendations.push(...artistTracks);
    }

    // 2. Fetch language trending mix
    const languageTracks = await saavnService.getByLanguage(targetLanguage, 15);
    recommendations.push(...languageTracks);

    // 3. Add indie/open licensed gems for diversity
    const indieTracks = await audiusService.getTrending(5);
    recommendations.push(...indieTracks);

    // Filter out duplicates and tracks recently played
    const seenIds = new Set();
    const finalResults = [];

    for (const track of recommendations) {
      if (!track || !track.id || seenIds.has(track.id) || avoidIds.has(track.id)) {
        continue;
      }
      seenIds.add(track.id);
      finalResults.push(track);
      if (finalResults.length >= 20) break;
    }

    return finalResults;
  }

  /**
   * Generates Smart Queue items for continuous, non-stop music playback
   */
  async getSmartQueue(currentTrack, existingQueue = []) {
    const existingIds = new Set(existingQueue.map(t => t.id));
    if (currentTrack) existingIds.add(currentTrack.id);

    let query = 'trending hits';
    if (currentTrack) {
      const primaryArtist = currentTrack.artist.split(',')[0].trim();
      query = `${currentTrack.language || 'telugu'} ${primaryArtist} hits`;
    }

    const searchRes = await saavnService.searchSongs(query, 1, 15);
    const candidateTracks = searchRes.results.filter(t => !existingIds.has(t.id));

    // If few results, fetch language hits
    if (candidateTracks.length < 5 && currentTrack) {
      const fallback = await saavnService.getByLanguage(currentTrack.language || 'telugu', 10);
      candidateTracks.push(...fallback.filter(t => !existingIds.has(t.id)));
    }

    return candidateTracks.slice(0, 8);
  }

  /**
   * Generates Similar Songs for a specific track
   */
  async getSimilarSongs(track) {
    if (!track) return [];
    const primaryArtist = (track.artist || '').split(',')[0].trim();
    const query = `${track.language || 'telugu'} ${primaryArtist}`;
    const res = await saavnService.searchSongs(query, 1, 15);
    return res.results.filter(t => t.id !== track.id).slice(0, 10);
  }

  /**
   * Generates a Personalized Daily Mix
   */
  async getDailyMix(language = 'telugu') {
    const res = await saavnService.searchSongs(`${language} superhit melody and beat songs`, 1, 20);
    return res.results;
  }
}

module.exports = new RecommendationEngine();

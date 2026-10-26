import { Track, Playlist, Album, Genre, Language, User, RingtoneItem } from '../types/music';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aura_auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(username: string, password: string, email?: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async guestLogin(): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to get current user');
    return res.json();
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Music Discovery
  async getTrending(language: string = 'all', limit: number = 25): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/music/trending?language=${encodeURIComponent(language)}&limit=${limit}`);
    const data = await res.json();
    return data.songs || [];
  },

  async search(query: string, type: string = 'all'): Promise<{ songs: Track[]; youtube: Track[]; openLicensed: Track[] }> {
    const res = await fetch(`${API_BASE}/music/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`);
    return res.json();
  },

  async getSongDetails(id: string): Promise<Track> {
    const res = await fetch(`${API_BASE}/music/song/${id}`);
    const data = await res.json();
    return data.song;
  },

  async getAlbumDetails(id: string): Promise<Album> {
    const res = await fetch(`${API_BASE}/music/album/${id}`);
    const data = await res.json();
    return data.album;
  },

  async getArtistTopSongs(name: string): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/music/artist/${encodeURIComponent(name)}`);
    const data = await res.json();
    return data.songs || [];
  },

  async getGenres(): Promise<Genre[]> {
    const res = await fetch(`${API_BASE}/music/genres`);
    const data = await res.json();
    return data.genres || [];
  },

  async getGenreSongs(genreId: string): Promise<{ genre: Genre; songs: Track[] }> {
    const res = await fetch(`${API_BASE}/music/genre/${genreId}`);
    return res.json();
  },

  async getLanguages(): Promise<Language[]> {
    const res = await fetch(`${API_BASE}/music/languages`);
    const data = await res.json();
    return data.languages || [];
  },

  async getLanguageSongs(langId: string): Promise<{ language: string; songs: Track[] }> {
    const res = await fetch(`${API_BASE}/music/language/${langId}`);
    return res.json();
  },

  async getYouTubeTrending(): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/music/youtube/trending`);
    const data = await res.json();
    return data.videos || [];
  },

  async getOpenLicensedTrending(): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/music/open/trending`);
    const data = await res.json();
    return data.tracks || [];
  },

  // Recommendations & Smart Queue
  async getRecommendations(params: { currentTrack?: Track | null; likedSongs?: Track[]; history?: Track[]; preferences?: Record<string, unknown> }): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/music/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return data.recommendations || [];
  },

  async getSmartQueue(currentTrack: Track, existingQueue: Track[]): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/music/smart-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentTrack, existingQueue })
    });
    const data = await res.json();
    return data.queue || [];
  },

  async getSimilarSongs(track: Track): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/music/similar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track })
    });
    const data = await res.json();
    return data.similar || [];
  },

  async getDailyMix(language: string = 'telugu'): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/music/daily-mix?language=${encodeURIComponent(language)}`);
    const data = await res.json();
    return data.songs || [];
  },

  // Lyrics
  async getLyrics(track: string, artist: string, duration?: number): Promise<{ syncedLyrics: string | null; plainLyrics: string | null; instrumental: boolean }> {
    const url = new URL(`${API_BASE}/lyrics`, window.location.origin);
    url.searchParams.append('track', track);
    url.searchParams.append('artist', artist);
    if (duration) url.searchParams.append('duration', String(duration));
    const res = await fetch(url.toString());
    return res.json();
  },

  // User Library
  async getLikedSongs(): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/library/likes`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.songs || [];
  },

  async toggleLikeSong(track: Track): Promise<{ isLiked: boolean; likedSongs: Track[] }> {
    const res = await fetch(`${API_BASE}/library/likes/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ track })
    });
    return res.json();
  },

  async getPlaylists(): Promise<Playlist[]> {
    const res = await fetch(`${API_BASE}/library/playlists`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.playlists || [];
  },

  async createPlaylist(title: string, description?: string, artwork?: string): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/library/playlists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description, artwork })
    });
    const data = await res.json();
    return data.playlist;
  },

  async addTrackToPlaylist(playlistId: string, track: Track): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/library/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ track })
    });
    const data = await res.json();
    return data.playlist;
  },

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/library/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data.playlist;
  },

  async deletePlaylist(playlistId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/library/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data.success;
  },

  async getHistory(): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/library/history`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.history || [];
  },

  async addToHistory(track: Track): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/library/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ track })
    });
    const data = await res.json();
    return data.history || [];
  },

  async clearHistory(): Promise<boolean> {
    const res = await fetch(`${API_BASE}/library/history`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data.success;
  },

  // Ringtones
  async getRingtones(): Promise<RingtoneItem[]> {
    const res = await fetch(`${API_BASE}/ringtones`);
    const data = await res.json();
    return data.ringtones || [];
  },

  async saveRingtone(item: Partial<RingtoneItem>): Promise<RingtoneItem> {
    const res = await fetch(`${API_BASE}/ringtones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const data = await res.json();
    return data.ringtone;
  },

  async deleteRingtone(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/ringtones/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  }
};

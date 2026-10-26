import React, { createContext, useContext, useState, useEffect } from 'react';
import { Track, Playlist, DownloadedTrack } from '../types/music';
import { api } from '../utils/api';
import { saveTrackForOffline, getDownloadedTracks, removeDownloadedTrack } from '../utils/downloadManager';
import { useAuth } from './AuthContext';

interface LibraryContextType {
  likedSongs: Track[];
  playlists: Playlist[];
  history: Track[];
  downloadedTracks: DownloadedTrack[];
  downloadProgress: Record<string, number>; // trackId -> progress %
  isLiked: (trackId: string) => boolean;
  toggleLike: (track: Track) => Promise<boolean>;
  createPlaylist: (title: string, description?: string, artwork?: string) => Promise<Playlist>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addToHistory: (track: Track) => void;
  downloadTrack: (track: Track) => Promise<void>;
  removeDownload: (trackId: string) => Promise<void>;
  isDownloaded: (trackId: string) => boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrack[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  // Load library when user changes
  useEffect(() => {
    async function loadLibrary() {
      try {
        const [likes, pls, hist, downloads] = await Promise.all([
          api.getLikedSongs(),
          api.getPlaylists(),
          api.getHistory(),
          getDownloadedTracks()
        ]);
        setLikedSongs(likes);
        setPlaylists(pls);
        setHistory(hist);
        setDownloadedTracks(downloads);
      } catch (err) {
        console.error('Error loading library:', err);
      }
    }
    loadLibrary();
  }, [user?.id]);

  const isLiked = (trackId: string) => {
    return likedSongs.some(t => t.id === trackId);
  };

  const toggleLike = async (track: Track): Promise<boolean> => {
    // Optimistic UI update
    const alreadyLiked = isLiked(track.id);
    if (alreadyLiked) {
      setLikedSongs(prev => prev.filter(t => t.id !== track.id));
    } else {
      setLikedSongs(prev => [{ ...track, likedAt: new Date().toISOString() }, ...prev]);
    }

    try {
      const res = await api.toggleLikeSong(track);
      setLikedSongs(res.likedSongs);
      return res.isLiked;
    } catch {
      // Revert if error
      return alreadyLiked;
    }
  };

  const createPlaylist = async (title: string, description?: string, artwork?: string) => {
    const pl = await api.createPlaylist(title, description, artwork);
    setPlaylists(prev => [...prev, pl]);
    return pl;
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    const updated = await api.addTrackToPlaylist(playlistId, track);
    setPlaylists(prev => prev.map(p => (p.id === playlistId ? updated : p)));
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const updated = await api.removeTrackFromPlaylist(playlistId, trackId);
    setPlaylists(prev => prev.map(p => (p.id === playlistId ? updated : p)));
  };

  const deletePlaylist = async (playlistId: string) => {
    await api.deletePlaylist(playlistId);
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  const addToHistory = (track: Track) => {
    setHistory(prev => [track, ...prev.filter(t => t.id !== track.id)].slice(0, 50));
    api.addToHistory(track).catch(() => {});
  };

  const isDownloaded = (trackId: string) => {
    return downloadedTracks.some(t => t.id === trackId);
  };

  const downloadTrack = async (track: Track) => {
    if (isDownloaded(track.id) || !track.isDownloadable) return;

    setDownloadProgress(prev => ({ ...prev, [track.id]: 0 }));
    try {
      const saved = await saveTrackForOffline(track, (percent) => {
        setDownloadProgress(prev => ({ ...prev, [track.id]: percent }));
      });
      setDownloadedTracks(prev => [saved, ...prev]);
    } catch (err) {
      console.error('Download failed for track:', track.title, err);
    } finally {
      setDownloadProgress(prev => {
        const next = { ...prev };
        delete next[track.id];
        return next;
      });
    }
  };

  const removeDownload = async (trackId: string) => {
    await removeDownloadedTrack(trackId);
    setDownloadedTracks(prev => prev.filter(t => t.id !== trackId));
  };

  return (
    <LibraryContext.Provider
      value={{
        likedSongs,
        playlists,
        history,
        downloadedTracks,
        downloadProgress,
        isLiked,
        toggleLike,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        deletePlaylist,
        addToHistory,
        downloadTrack,
        removeDownload,
        isDownloaded
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

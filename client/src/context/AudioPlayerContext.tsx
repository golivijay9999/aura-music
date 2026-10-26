import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Track, RepeatMode, LyricsLine } from '../types/music';
import { audioEngine, EQUALIZER_PRESETS } from '../utils/audioEngine';
import { updateMediaSession, updateMediaPlaybackState } from '../utils/mediaSession';
import { getOfflineBlobUrl } from '../utils/downloadManager';
import { api } from '../utils/api';
import { parseLRC } from '../utils/lrcParser';
import { useLibrary } from './LibraryContext';

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  isFullScreen: boolean;
  isEqualizerOpen: boolean;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;
  lyrics: LyricsLine[];
  plainLyrics: string | null;
  isLoadingLyrics: boolean;
  currentPreset: string;
  customGains: number[];

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  addNextInQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setFullScreen: (open: boolean) => void;
  setEqualizerOpen: (open: boolean) => void;
  setLyricsOpen: (open: boolean) => void;
  setQueueOpen: (open: boolean) => void;
  setPreset: (preset: string) => void;
  setBandGain: (bandIndex: number, gain: number) => void;

  // YouTube integration hooks
  onYouTubeStateChange: (state: number) => void;
  onYouTubeProgress: (time: number, total: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToHistory } = useLibrary();

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('aura_volume');
    return saved !== null ? parseFloat(saved) : 0.85;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Track[]>([]);

  // UI Modals
  const [isFullScreen, setFullScreen] = useState<boolean>(false);
  const [isEqualizerOpen, setEqualizerOpen] = useState<boolean>(false);
  const [isLyricsOpen, setLyricsOpen] = useState<boolean>(false);
  const [isQueueOpen, setQueueOpen] = useState<boolean>(false);

  // Equalizer state
  const [currentPreset, setCurrentPreset] = useState<string>('Flat');
  const [customGains, setCustomGains] = useState<number[]>(EQUALIZER_PRESETS['Flat']);

  // Lyrics state
  const [lyrics, setLyrics] = useState<LyricsLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAutoLoadingRef = useRef<boolean>(false);

  // Initialize HTML5 Audio element and Web Audio API
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      updateMediaPlaybackState('playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      updateMediaPlaybackState('paused');
    };

    const handleEnded = () => {
      handleTrackEnded();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Update MediaSession controls
  useEffect(() => {
    updateMediaSession(currentTrack, {
      onPlay: () => togglePlay(),
      onPause: () => togglePlay(),
      onPrevious: () => playPrevious(),
      onNext: () => playNext(),
      onSeek: (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      }
    });
  }, [currentTrack]);

  // Load lyrics when track changes
  useEffect(() => {
    if (!currentTrack) {
      setLyrics([]);
      setPlainLyrics(null);
      return;
    }

    let isMounted = true;
    setIsLoadingLyrics(true);

    api.getLyrics(currentTrack.title, currentTrack.artist, currentTrack.duration)
      .then((res) => {
        if (!isMounted) return;
        if (res.syncedLyrics) {
          setLyrics(parseLRC(res.syncedLyrics));
          setPlainLyrics(res.plainLyrics);
        } else if (res.plainLyrics) {
          setLyrics([]);
          setPlainLyrics(res.plainLyrics);
        } else {
          setLyrics([]);
          setPlainLyrics(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLyrics([]);
          setPlainLyrics(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingLyrics(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id]);

  // Handle track playback
  const playTrack = async (track: Track, newQueue?: Track[]) => {
    if (!audioRef.current) return;

    setCurrentTrack(track);
    addToHistory(track);

    if (newQueue) {
      setQueue(newQueue);
    } else if (queue.length === 0) {
      setQueue([track]);
    }

    if (track.isYouTube) {
      // YouTube playback managed via YouTube Embed Player component
      audioRef.current.pause();
      setIsPlaying(true);
      setDuration(track.duration || 210);
      return;
    }

    try {
      // Check for offline cached version first
      const offlineBlobUrl = await getOfflineBlobUrl(track.id);
      const audioSource = offlineBlobUrl || track.stream320 || track.streamUrl;

      audioRef.current.src = audioSource;
      audioRef.current.volume = isMuted ? 0 : volume;

      // Connect Web Audio API equalizer
      audioEngine.init(audioRef.current);
      audioEngine.resume();

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('Playback error (retrying with fallback):', err);
      // Fallback to standard streamUrl
      if (track.streamUrl && audioRef.current.src !== track.streamUrl) {
        audioRef.current.src = track.streamUrl;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const togglePlay = () => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0]);
      }
      return;
    }

    if (currentTrack.isYouTube) {
      setIsPlaying(prev => !prev);
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioEngine.resume();
      audioRef.current.play().catch(() => {});
    }
  };

  const playNext = useCallback(() => {
    if (queue.length === 0 || !currentTrack) return;

    if (repeatMode === 'one' && audioRef.current && !currentTrack.isYouTube) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);

    if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * queue.length);
      playTrack(queue[nextIndex]);
      return;
    }

    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    } else if (repeatMode === 'all') {
      playTrack(queue[0]);
    } else {
      // Smart Queue: Auto-fetch next songs so music never stops
      if (!isAutoLoadingRef.current && currentTrack) {
        isAutoLoadingRef.current = true;
        api.getSmartQueue(currentTrack, queue)
          .then((smartQueue) => {
            if (smartQueue.length > 0) {
              setQueue(prev => [...prev, ...smartQueue]);
              playTrack(smartQueue[0]);
            } else {
              setIsPlaying(false);
            }
          })
          .catch(() => {
            setIsPlaying(false);
          })
          .finally(() => {
            isAutoLoadingRef.current = false;
          });
      } else {
        setIsPlaying(false);
      }
    }
  }, [queue, currentTrack, isShuffle, repeatMode]);

  const playPrevious = () => {
    if (!currentTrack || queue.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    } else {
      playTrack(queue[queue.length - 1]);
    }
  };

  const handleTrackEnded = () => {
    playNext();
  };

  const seek = (seconds: number) => {
    if (currentTrack?.isYouTube) {
      setCurrentTime(seconds);
      return;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    localStorage.setItem('aura_volume', String(clamped));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
    if (!currentTrack) {
      playTrack(track);
    }
  };

  const addNextInQueue = (track: Track) => {
    if (!currentTrack) {
      playTrack(track);
      return;
    }
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    if (idx !== -1) {
      const nextQueue = [...queue];
      nextQueue.splice(idx + 1, 0, track);
      setQueue(nextQueue);
    } else {
      setQueue(prev => [currentTrack, track, ...prev]);
    }
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue(currentTrack ? [currentTrack] : []);
  };

  const setPreset = (preset: string) => {
    setCurrentPreset(preset);
    const gains = EQUALIZER_PRESETS[preset] || EQUALIZER_PRESETS['Flat'];
    setCustomGains([...gains]);
    audioEngine.applyPreset(preset);
  };

  const setBandGain = (bandIndex: number, gain: number) => {
    const updated = [...customGains];
    updated[bandIndex] = gain;
    setCustomGains(updated);
    setCurrentPreset('Custom');
    audioEngine.setBandGain(bandIndex, gain);
  };

  // YouTube integration callbacks
  const onYouTubeStateChange = (state: number) => {
    // 1 = playing, 2 = paused, 0 = ended
    if (state === 1) setIsPlaying(true);
    if (state === 2) setIsPlaying(false);
    if (state === 0) playNext();
  };

  const onYouTubeProgress = (time: number, total: number) => {
    setCurrentTime(time);
    if (total > 0) setDuration(total);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        isFullScreen,
        isEqualizerOpen,
        isLyricsOpen,
        isQueueOpen,
        lyrics,
        plainLyrics,
        isLoadingLyrics,
        currentPreset,
        customGains,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        addNextInQueue,
        removeFromQueue,
        clearQueue,
        setFullScreen,
        setEqualizerOpen,
        setLyricsOpen,
        setQueueOpen,
        setPreset,
        setBandGain,
        onYouTubeStateChange,
        onYouTubeProgress
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

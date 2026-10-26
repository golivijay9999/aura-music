import { Track } from '../types/music';

interface MediaSessionCallbacks {
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (details: { seekTime?: number; fastSeek?: boolean }) => void;
}

export function updateMediaSession(track: Track | null, callbacks: MediaSessionCallbacks) {
  if (!('mediaSession' in navigator) || !track) return;

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || 'Aura Music',
      artwork: [
        { src: track.artwork, sizes: '96x96', type: 'image/jpeg' },
        { src: track.artwork, sizes: '192x192', type: 'image/jpeg' },
        { src: track.artwork, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', callbacks.onPlay);
    navigator.mediaSession.setActionHandler('pause', callbacks.onPause);
    navigator.mediaSession.setActionHandler('previoustrack', callbacks.onPrevious);
    navigator.mediaSession.setActionHandler('nexttrack', callbacks.onNext);
    navigator.mediaSession.setActionHandler('seekto', (details) => callbacks.onSeek(details));
    navigator.mediaSession.setActionHandler('seekbackward', () => callbacks.onSeek({ seekTime: -10 }));
    navigator.mediaSession.setActionHandler('seekforward', () => callbacks.onSeek({ seekTime: 10 }));
  } catch (err) {
    console.warn('MediaSession update warning:', err);
  }
}

export function updateMediaPlaybackState(state: 'playing' | 'paused' | 'none') {
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = state;
    } catch (e) {
      // ignore
    }
  }
}

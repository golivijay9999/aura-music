import React, { useEffect, useRef } from 'react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

interface YouTubeEmbedPlayerProps {
  youtubeId: string;
  onClose?: () => void;
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string | HTMLElement, options: unknown) => {
        playVideo: () => void;
        pauseVideo: () => void;
        seekTo: (seconds: number, allowSeekAhead: boolean) => void;
        getCurrentTime: () => number;
        getDuration: () => number;
        destroy: () => void;
      };
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const YouTubeEmbedPlayer: React.FC<YouTubeEmbedPlayerProps> = ({ youtubeId, onClose }) => {
  const { isPlaying, onYouTubeStateChange, onYouTubeProgress } = useAudioPlayer();
  const playerRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load YouTube IFrame Player API script if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let interval: ReturnType<typeof setInterval>;

    const initPlayer = () => {
      if (!window.YT || !containerRef.current) return;

      playerRef.current = new window.YT.Player('yt-player-element', {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event: { target: { playVideo: () => void } }) => {
            event.target.playVideo();
          },
          onStateChange: (event: { data: number }) => {
            onYouTubeStateChange(event.data);
          }
        }
      });

      // Poll progress for seeking/duration synchronization
      interval = setInterval(() => {
        const player = playerRef.current as { getCurrentTime?: () => number; getDuration?: () => number } | null;
        if (player && typeof player.getCurrentTime === 'function') {
          const current = player.getCurrentTime();
          const total = player.getDuration ? player.getDuration() : 0;
          onYouTubeProgress(current, total);
        }
      }, 500);
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      clearInterval(interval);
      const player = playerRef.current as { destroy?: () => void } | null;
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [youtubeId]);

  // Synchronize play / pause with context
  useEffect(() => {
    const player = playerRef.current as { playVideo?: () => void; pauseVideo?: () => void } | null;
    if (player) {
      if (isPlaying && typeof player.playVideo === 'function') {
        player.playVideo();
      } else if (!isPlaying && typeof player.pauseVideo === 'function') {
        player.pauseVideo();
      }
    }
  }, [isPlaying]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black/90 border border-purple-500/20 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border-b border-white/5">
        <div className="flex items-center space-x-2 text-xs text-purple-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Official Authorized YouTube Playback</span>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href={`https://www.youtube.com/watch?v=${youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 transition-colors"
          >
            <span>Open on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div ref={containerRef} className="aspect-video w-full">
        <div id="yt-player-element" className="w-full h-full" />
      </div>
    </div>
  );
};

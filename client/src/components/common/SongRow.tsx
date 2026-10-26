import React from 'react';
import { Track } from '../../types/music';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { useRoom } from '../../context/RoomContext';
import { Play, Pause, Heart, Download, Scissors, Check, Plus } from 'lucide-react';

interface SongRowProps {
  track: Track;
  index: number;
  queueContext?: Track[];
  onOpenRingtone?: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '3:20';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const SongRow: React.FC<SongRowProps> = ({
  track,
  index,
  queueContext,
  onOpenRingtone,
  onAddToPlaylist
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();
  const { isLiked, toggleLike, downloadTrack, isDownloaded, downloadProgress } = useLibrary();
  const { isInRoom, syncChangeTrack } = useRoom();

  const isCurrent = currentTrack?.id === track.id;
  const isThisPlaying = isCurrent && isPlaying;
  const liked = isLiked(track.id);
  const downloaded = isDownloaded(track.id);
  const progress = downloadProgress[track.id];

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
      if (isInRoom) syncChangeTrack(track);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
        isCurrent
          ? 'bg-purple-950/40 border border-purple-500/30 text-white'
          : 'hover:bg-white/5 text-gray-300 hover:text-white border border-transparent'
      }`}
    >
      {/* Left: Index / Play & Artwork & Title */}
      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
        {/* Track Number / Play Icon */}
        <div className="w-6 text-center text-xs text-gray-500 font-mono shrink-0">
          <span className="group-hover:hidden">
            {isThisPlaying ? (
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping inline-block" />
            ) : (
              index + 1
            )}
          </span>
          <button className="hidden group-hover:inline-block text-cyan-400">
            {isThisPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
        </div>

        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-zinc-900">
          <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
        </div>

        {/* Metadata */}
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center space-x-2">
            <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-400' : 'text-white'}`}>
              {track.title}
            </p>
            {track.isYouTube && (
              <span className="text-[9px] px-1.5 py-0.2 bg-red-600/30 text-red-300 border border-red-500/30 rounded font-mono">
                YT
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{track.artist}</p>
        </div>
      </div>

      {/* Middle: Album Name (Desktop) */}
      <div className="hidden md:block w-1/4 text-xs text-gray-400 truncate pr-4">
        {track.album}
      </div>

      {/* Right: Actions & Duration */}
      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track);
          }}
          className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
            liked ? 'text-pink-500' : 'text-gray-400 hover:text-white'
          }`}
          title={liked ? 'Liked' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        </button>

        {onOpenRingtone && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenRingtone(track);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 hidden sm:block"
            title="Trim in Ringtone Studio"
          >
            <Scissors className="w-4 h-4" />
          </button>
        )}

        {onAddToPlaylist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist(track);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 hidden sm:block"
            title="Add to Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {track.isDownloadable && (
          <div>
            {downloaded ? (
              <span className="p-1.5 text-emerald-400 flex items-center" title="Saved Offline">
                <Check className="w-4 h-4" />
              </span>
            ) : progress !== undefined ? (
              <span className="text-[10px] font-mono text-cyan-400">
                {progress}%
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadTrack(track);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 hidden sm:block"
                title="Download Track"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <span className="text-xs text-gray-500 font-mono w-10 text-right">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
};

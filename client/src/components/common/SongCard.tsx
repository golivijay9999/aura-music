import React from 'react';
import { Track } from '../../types/music';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { useRoom } from '../../context/RoomContext';
import { Play, Pause, Heart, Download, Scissors, Check, Sparkles } from 'lucide-react';

interface SongCardProps {
  track: Track;
  queueContext?: Track[];
  onOpenRingtone?: (track: Track) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ track, queueContext, onOpenRingtone }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();
  const { isLiked, toggleLike, downloadTrack, isDownloaded, downloadProgress } = useLibrary();
  const { isInRoom, syncChangeTrack } = useRoom();

  const isCurrent = currentTrack?.id === track.id;
  const isThisPlaying = isCurrent && isPlaying;
  const liked = isLiked(track.id);
  const downloaded = isDownloaded(track.id);
  const progress = downloadProgress[track.id];

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
      if (isInRoom) syncChangeTrack(track);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(track);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!downloaded && track.isDownloadable) {
      downloadTrack(track);
    }
  };

  const handleRingtoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenRingtone) {
      onOpenRingtone(track);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className="group relative flex flex-col p-3 rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20 cursor-pointer"
    >
      {/* Artwork Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-zinc-900 border border-white/5">
        <img
          src={track.artwork}
          alt={track.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Ambient Dark Overlay on Hover */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isCurrent ? 'opacity-60' : 'opacity-0 group-hover:opacity-100'
        }`} />

        {/* Floating Play Button */}
        <div
          className={`absolute bottom-2.5 right-2.5 p-3 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-xl shadow-purple-600/40 transition-all duration-300 transform ${
            isCurrent || isThisPlaying
              ? 'opacity-100 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 scale-95 hover:scale-105'
          }`}
        >
          {isThisPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </div>

        {/* Badge: YouTube or Downloadable */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {track.isYouTube && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-600/80 text-white font-semibold backdrop-blur-md">
              YouTube
            </span>
          )}
          {track.provider === 'audius' && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-600/80 text-white font-semibold backdrop-blur-md flex items-center space-x-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Open</span>
            </span>
          )}
        </div>
      </div>

      {/* Song Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className={`text-sm font-semibold truncate ${
            isCurrent ? 'text-cyan-400' : 'text-white group-hover:text-purple-300'
          }`}>
            {track.title}
          </h4>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {track.artist}
          </p>
        </div>

        {/* Interactive Action Row */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
          <div className="flex items-center space-x-1">
            <button
              onClick={handleLikeClick}
              className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                liked ? 'text-pink-500' : 'text-gray-400 hover:text-white'
              }`}
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>

            {/* Ringtone Creator Studio Shortcut */}
            <button
              onClick={handleRingtoneClick}
              className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-colors"
              title="Create Ringtone / Trim Audio"
            >
              <Scissors className="w-4 h-4" />
            </button>
          </div>

          {/* Download Action */}
          {track.isDownloadable && (
            <div>
              {downloaded ? (
                <span className="p-1.5 text-emerald-400 flex items-center" title="Saved Offline">
                  <Check className="w-4 h-4" />
                </span>
              ) : progress !== undefined ? (
                <span className="text-[10px] font-mono text-cyan-400 animate-pulse">
                  {progress}%
                </span>
              ) : (
                <button
                  onClick={handleDownloadClick}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-white/10 transition-colors"
                  title="Download for Offline Playback"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

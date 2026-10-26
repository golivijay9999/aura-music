import React from 'react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { useRoom } from '../../context/RoomContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Maximize2,
  Sliders,
  ListMusic,
  Quote,
  Heart,
  Users
} from 'lucide-react';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isEqualizerOpen,
    isLyricsOpen,
    isQueueOpen,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setFullScreen,
    setEqualizerOpen,
    setLyricsOpen,
    setQueueOpen
  } = useAudioPlayer();

  const { isLiked, toggleLike } = useLibrary();
  const { isInRoom, activeRoom, syncPlayState, syncSeek } = useRoom();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentTrack.id);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
    if (isInRoom) {
      syncSeek(val);
    }
  };

  const handlePlayToggle = () => {
    togglePlay();
    if (isInRoom) {
      syncPlayState(!isPlaying, currentTime);
    }
  };

  return (
    <footer aria-label="Audio player" className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d091a]/95 backdrop-blur-2xl border-t border-purple-500/20 px-3 md:px-6 py-2.5 transition-all duration-300 shadow-[0_-10px_35px_rgba(0,0,0,0.7)]">
      {/* Top progress bar for mobile */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Song Metadata & Art */}
        <div className="flex items-center space-x-3.5 min-w-0 w-1/4">
          <div
            onClick={() => setFullScreen(true)}
            className="relative group cursor-pointer shrink-0 rounded-xl overflow-hidden w-12 h-12 md:w-14 md:h-14 shadow-lg border border-white/10"
          >
            <img
              src={currentTrack.artwork}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center space-x-0.5">
                <span className="w-1 bg-cyan-400 rounded-full animate-wave-1" />
                <span className="w-1 bg-purple-400 rounded-full animate-wave-2" />
                <span className="w-1 bg-cyan-400 rounded-full animate-wave-3" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <p
                onClick={() => setFullScreen(true)}
                className="text-sm font-semibold text-white truncate cursor-pointer hover:text-purple-300 transition-colors"
              >
                {currentTrack.title}
              </p>
              {currentTrack.isYouTube && (
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-red-600/30 text-red-300 border border-red-500/40 rounded-md font-mono">
                  YT
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate hover:text-gray-300 transition-colors">
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0 ${
              liked ? 'text-pink-500 hover:text-pink-400' : 'text-gray-400 hover:text-white'
            }`}
            title={liked ? 'Remove from Liked' : 'Like Song'}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center: Playback Controls & Seek Bar */}
        <div className="flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center space-x-3 md:space-x-5 mb-1">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition-colors hidden sm:block ${
                isShuffle ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={playPrevious}
              className="p-1.5 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Previous"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlayToggle}
              className="p-3 bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white rounded-full shadow-lg shadow-purple-600/40 transform active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={playNext}
              className="p-1.5 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Next"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full transition-colors hidden sm:block ${
                repeatMode !== 'off' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Time Seek Bar (Desktop / Tablet) */}
          <div className="hidden md:flex items-center space-x-3 w-full">
            <span className="text-[11px] text-gray-400 font-mono w-9 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 group flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:h-2 transition-all focus:outline-none"
              />
            </div>
            <span className="text-[11px] text-gray-400 font-mono w-9">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Auxiliary & Room Controls */}
        <div className="flex items-center justify-end space-x-2 md:space-x-3 w-1/4">
          {isInRoom && (
            <div
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-purple-950/70 border border-purple-500/40 rounded-full text-xs text-purple-300 animate-pulse cursor-pointer"
              title={`In Room: ${activeRoom?.name}`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px]">{activeRoom?.id}</span>
            </div>
          )}

          <button
            onClick={() => setEqualizerOpen(!isEqualizerOpen)}
            className={`p-2 rounded-xl transition-colors ${
              isEqualizerOpen ? 'text-cyan-400 bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Audio Equalizer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setLyricsOpen(!isLyricsOpen)}
            className={`p-2 rounded-xl transition-colors ${
              isLyricsOpen ? 'text-purple-400 bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Synchronized Lyrics"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            onClick={() => setQueueOpen(!isQueueOpen)}
            className={`p-2 rounded-xl transition-colors ${
              isQueueOpen ? 'text-purple-400 bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Music Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center space-x-2 pl-1">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-18 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setFullScreen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            title="Full Screen View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

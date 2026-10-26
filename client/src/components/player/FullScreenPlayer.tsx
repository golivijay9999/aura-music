import React, { useState, useEffect, useRef } from 'react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { useRoom } from '../../context/RoomContext';
import { VisualizerCanvas } from './VisualizerCanvas';
import { YouTubeEmbedPlayer } from './YouTubeEmbedPlayer';
import { getCurrentLyricIndex } from '../../utils/lrcParser';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Sliders,
  ListMusic,
  Quote,
  Share2,
  Sparkles,
  Disc3,
  Video
} from 'lucide-react';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const FullScreenPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    isFullScreen,
    lyrics,
    plainLyrics,
    isLoadingLyrics,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    toggleShuffle,
    toggleRepeat,
    setFullScreen,
    setEqualizerOpen,
    setQueueOpen
  } = useAudioPlayer();

  const { isLiked, toggleLike } = useLibrary();
  const { isInRoom, activeRoom, syncPlayState, syncSeek } = useRoom();

  const [activeTab, setActiveTab] = useState<'visualizer' | 'lyrics' | 'video'>('lyrics');
  const [visualizerMode, setVisualizerMode] = useState<'bars' | 'wave' | 'circle'>('bars');
  const activeLyricRef = useRef<HTMLDivElement | null>(null);

  const activeLyricIndex = getCurrentLyricIndex(lyrics, currentTime);

  // Auto-scroll lyrics smoothly to active line
  useEffect(() => {
    if (activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLyricIndex]);

  if (!isFullScreen || !currentTrack) return null;

  const liked = isLiked(currentTrack.id);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
    if (isInRoom) syncSeek(val);
  };

  const handlePlayToggle = () => {
    togglePlay();
    if (isInRoom) syncPlayState(!isPlaying, currentTime);
  };

  const handleLyricClick = (time: number) => {
    seek(time);
    if (isInRoom) syncSeek(time);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#07050e] overflow-hidden select-none animate-in fade-in duration-300">
      {/* Dynamic blurred album artwork ambient background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-125 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url(${currentTrack.artwork})` }}
      />
      <div className="absolute inset-0 bg-radial from-transparent via-[#07050e]/80 to-[#07050e] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <button
          onClick={() => setFullScreen(false)}
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all backdrop-blur-md border border-white/10"
          title="Minimize Player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* View Mode Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'lyrics'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'visualizer'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visualizer</span>
          </button>

          {currentTrack.isYouTube && currentTrack.youtubeId && (
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'video'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isInRoom && (
            <span className="hidden sm:inline-flex items-center px-3 py-1 bg-purple-900/50 border border-purple-500/30 rounded-full text-xs text-purple-200">
              Room {activeRoom?.id}
            </span>
          )}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all backdrop-blur-md border border-white/10"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-4 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 overflow-hidden">
        {/* Left Column: Artwork & Vinyl Showcase */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 max-w-md shrink-0">
          <div className="relative group w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
            {/* Ambient Artwork Glow */}
            <div
              className="absolute -inset-4 rounded-3xl opacity-60 filter blur-2xl transition-all duration-700 pointer-events-none"
              style={{
                backgroundImage: `url(${currentTrack.artwork})`,
                backgroundSize: 'cover'
              }}
            />

            {/* Rotating Vinyl Record Behind Sleeve */}
            <div
              className={`absolute top-0 right-[-15%] w-full h-full rounded-full bg-zinc-950 border-4 border-zinc-800 shadow-2xl flex items-center justify-center transition-transform duration-700 ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
            >
              <div className="w-24 h-24 rounded-full border-2 border-zinc-700/60 overflow-hidden shadow-inner flex items-center justify-center">
                <img
                  src={currentTrack.artwork}
                  alt="Vinyl Center"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Main Cover Art Card */}
            <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-zinc-900">
              <img
                src={currentTrack.artwork}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Right Column: Tab View (Lyrics or Visualizer or Video) */}
        <div className="flex-1 w-full md:w-1/2 flex flex-col h-[280px] sm:h-[350px] md:h-[450px]">
          {activeTab === 'lyrics' && (
            <div className="flex-1 flex flex-col glass-card rounded-3xl p-6 border border-white/10 overflow-hidden relative shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <div className="flex items-center space-x-2 text-xs font-medium text-purple-300">
                  <Quote className="w-4 h-4" />
                  <span>Synchronized Lyrics</span>
                </div>
                {isLoadingLyrics && (
                  <span className="text-xs text-cyan-400 animate-pulse">Syncing...</span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-center md:text-left scroll-smooth">
                {lyrics.length > 0 ? (
                  lyrics.map((line, i) => {
                    const isActive = i === activeLyricIndex;
                    return (
                      <div
                        key={i}
                        ref={isActive ? activeLyricRef : null}
                        onClick={() => handleLyricClick(line.time)}
                        className={`cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-xl font-medium ${
                          isActive
                            ? 'text-white text-xl sm:text-2xl font-bold bg-white/10 scale-102 neon-glow-purple'
                            : 'text-gray-400 hover:text-gray-200 text-base sm:text-lg opacity-60 hover:opacity-100'
                        }`}
                      >
                        {line.text}
                      </div>
                    );
                  })
                ) : plainLyrics ? (
                  <div className="text-gray-300 whitespace-pre-line text-sm sm:text-base leading-relaxed">
                    {plainLyrics}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                    <Quote className="w-10 h-10 opacity-30" />
                    <p className="text-sm">No lyrics found for this track</p>
                    <p className="text-xs text-gray-500">Enjoy the rhythm & melody</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'visualizer' && (
            <div className="flex-1 flex flex-col glass-card rounded-3xl p-6 border border-white/10 shadow-2xl justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-medium text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Audio Visualizer</span>
                </div>
                <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
                  {(['bars', 'wave', 'circle'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setVisualizerMode(m)}
                      className={`text-[11px] capitalize px-2.5 py-1 rounded-md transition-colors ${
                        visualizerMode === m ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="my-auto py-6">
                <VisualizerCanvas mode={visualizerMode} isPlaying={isPlaying} />
              </div>

              <div className="text-center text-xs text-gray-500 font-mono">
                Web Audio API Analyser • 48 kHz High Fidelity
              </div>
            </div>
          )}

          {activeTab === 'video' && currentTrack.youtubeId && (
            <div className="flex-1 flex flex-col justify-center">
              <YouTubeEmbedPlayer youtubeId={currentTrack.youtubeId} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Area */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full px-6 py-6 flex flex-col items-center">
        {/* Track Title & Artist & Like */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
              {currentTrack.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-400 truncate mt-0.5">
              {currentTrack.artist} • <span className="text-gray-500">{currentTrack.album}</span>
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-3 rounded-full hover:bg-white/10 transition-transform active:scale-90 ${
              liked ? 'text-pink-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`w-7 h-7 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Progress Slider */}
        <div className="w-full flex items-center space-x-3 mb-4">
          <span className="text-xs text-gray-400 font-mono w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:h-2.5 transition-all focus:outline-none"
          />
          <span className="text-xs text-gray-400 font-mono w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center justify-between w-full max-w-md">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${
              isShuffle ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={playPrevious}
            className="p-3 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Previous"
          >
            <SkipBack className="w-7 h-7" />
          </button>

          <button
            onClick={handlePlayToggle}
            className="p-5 bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white rounded-full shadow-2xl shadow-purple-600/50 transform active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-3 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Next"
          >
            <SkipForward className="w-7 h-7" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 transition-colors ${
              repeatMode !== 'off' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Action icons row */}
        <div className="flex items-center space-x-6 mt-4">
          <button
            onClick={() => setEqualizerOpen(true)}
            className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center space-x-1.5 text-xs"
          >
            <Sliders className="w-4 h-4" />
            <span>Equalizer</span>
          </button>

          <button
            onClick={() => setQueueOpen(true)}
            className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-1.5 text-xs"
          >
            <ListMusic className="w-4 h-4" />
            <span>Up Next</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Track } from '../types/music';
import { api } from '../utils/api';
import { SongCard } from '../components/common/SongCard';
import { SongRow } from '../components/common/SongRow';
import { Compass, Flame, TrendingUp, Trophy, Sparkles } from 'lucide-react';

interface ExplorePageProps {
  onOpenRingtone: (track: Track) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ onOpenRingtone }) => {
  const [activeLang, setActiveLang] = useState('telugu');
  const [chartSongs, setChartSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const languages = [
    { id: 'telugu', label: 'Telugu Charts' },
    { id: 'hindi', label: 'Bollywood Top' },
    { id: 'tamil', label: 'Tamil Hits' },
    { id: 'kannada', label: 'Kannada Top' },
    { id: 'malayalam', label: 'Malayalam Hits' },
    { id: 'english', label: 'Global Top 50' },
    { id: 'punjabi', label: 'Punjabi Hot' }
  ];

  useEffect(() => {
    setLoading(true);
    api.getTrending(activeLang, 25)
      .then(setChartSongs)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [activeLang]);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Explore Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Music Discovery Hub</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Explore Charts & Viral Hits
        </h2>

        {/* Language Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          {languages.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLang(l.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
                activeLang === l.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-mono">Loading chart rankings...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 3 Podium Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {chartSongs.slice(0, 3).map((track, i) => (
              <div
                key={track.id}
                className="glass-card rounded-3xl p-5 border border-white/10 flex items-center space-x-4 relative overflow-hidden"
              >
                <div className={`p-2.5 rounded-2xl font-black text-sm shrink-0 ${
                  i === 0
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : i === 1
                    ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40'
                    : 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                }`}>
                  #{i + 1}
                </div>
                <img src={track.artwork} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{track.title}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Grid View */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {chartSongs.slice(0, 6).map((track) => (
              <SongCard
                key={track.id}
                track={track}
                queueContext={chartSongs}
                onOpenRingtone={onOpenRingtone}
              />
            ))}
          </div>

          {/* Full Chart Tracklist */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-2">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Full Ranked Chartlist</span>
            </h3>
            <div className="space-y-1">
              {chartSongs.map((track, i) => (
                <SongRow
                  key={track.id}
                  track={track}
                  index={i}
                  queueContext={chartSongs}
                  onOpenRingtone={onOpenRingtone}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

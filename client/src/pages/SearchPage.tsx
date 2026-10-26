import React, { useState, useEffect } from 'react';
import { Track } from '../types/music';
import { api } from '../utils/api';
import { SongCard } from '../components/common/SongCard';
import { SongRow } from '../components/common/SongRow';
import { Search, Sparkles, Video, Disc3, Music, History } from 'lucide-react';

interface SearchPageProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenRingtone: (track: Track) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenRingtone
}) => {
  const [filterType, setFilterType] = useState<'all' | 'songs' | 'youtube' | 'open'>('all');
  const [results, setResults] = useState<{ songs: Track[]; youtube: Track[]; openLicensed: Track[] }>({
    songs: [],
    youtube: [],
    openLicensed: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const quickTags = [
    'Telugu Melodies',
    'Devara',
    'Anirudh Ravichander',
    'Guntur Kaaram',
    'Arijit Singh',
    'Pushpa 2',
    'Sid Sriram',
    'Thaman S',
    'Believer',
    'Lo-Fi Chill'
  ];

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({ songs: [], youtube: [], openLicensed: [] });
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      api.search(searchQuery.trim(), filterType)
        .then((res) => {
          setResults({
            songs: res.songs || [],
            youtube: res.youtube || [],
            openLicensed: res.openLicensed || []
          });
        })
        .catch((err) => console.error('Search error:', err))
        .finally(() => setIsLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, filterType]);

  const allTracks = [
    ...(filterType === 'all' || filterType === 'songs' ? results.songs : []),
    ...(filterType === 'all' || filterType === 'youtube' ? results.youtube : []),
    ...(filterType === 'all' || filterType === 'open' ? results.openLicensed : [])
  ];

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Search Header & Filter Pills */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Search Music & Videos
        </h2>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'songs', 'youtube', 'open'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`capitalize px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === type
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {type === 'open' ? 'Open Licensed' : type === 'youtube' ? 'YouTube' : type}
            </button>
          ))}
        </div>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-gray-400 flex items-center space-x-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Popular:</span>
          </span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="text-xs px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-mono">Searching catalogs...</p>
        </div>
      ) : searchQuery.trim() && allTracks.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-gray-400 space-y-3">
          <Search className="w-12 h-12 mx-auto opacity-30 text-purple-400" />
          <h3 className="text-lg font-bold text-white">No results found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try checking for typos or searching for a different track, singer, or movie title.
          </p>
        </div>
      ) : allTracks.length > 0 ? (
        <div className="space-y-8">
          {/* Top Result Card Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allTracks.slice(0, 6).map((track) => (
              <SongCard
                key={track.id}
                track={track}
                queueContext={allTracks}
                onOpenRingtone={onOpenRingtone}
              />
            ))}
          </div>

          {/* Full List view */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-2">
            <h3 className="text-base font-bold text-white mb-4">
              All Results ({allTracks.length})
            </h3>
            <div className="space-y-1">
              {allTracks.map((track, i) => (
                <SongRow
                  key={`${track.id}-${i}`}
                  track={track}
                  index={i}
                  queueContext={allTracks}
                  onOpenRingtone={onOpenRingtone}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State / Initial Search Guidance */
        <div className="glass-card rounded-3xl p-12 text-center text-gray-400 space-y-3">
          <Music className="w-12 h-12 mx-auto opacity-30 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Search Anything</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Find chartbusters in Telugu, Hindi, Tamil, Kannada, Malayalam, English, Punjabi, or paste YouTube links directly.
          </p>
        </div>
      )}
    </div>
  );
};

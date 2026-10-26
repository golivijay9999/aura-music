import React, { useState, useEffect } from 'react';
import { Genre, Track } from '../types/music';
import { api } from '../utils/api';
import { SongCard } from '../components/common/SongCard';
import { SongRow } from '../components/common/SongRow';
import { Radio, ArrowLeft, Sparkles } from 'lucide-react';

interface GenresPageProps {
  onOpenRingtone: (track: Track) => void;
}

export const GenresPage: React.FC<GenresPageProps> = ({ onOpenRingtone }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genreSongs, setGenreSongs] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    api.getGenres().then(setGenres);
  }, []);

  const handleSelectGenre = (genre: Genre) => {
    setSelectedGenre(genre);
    setIsLoading(true);
    api.getGenreSongs(genre.id)
      .then((res) => setGenreSongs(res.songs || []))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Radio className="w-4 h-4" />
          <span>Curated Vibes</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Genres & Moods
        </h2>
        <p className="text-sm text-gray-400">
          Find music matched to your feeling, vibe, tempo, and atmosphere.
        </p>
      </div>

      {selectedGenre ? (
        /* Selected Genre View */
        <div className="space-y-8 animate-in fade-in">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedGenre(null)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedGenre.name}</h3>
              <p className="text-xs text-gray-400">Curated playlist of {genreSongs.length} songs</p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-xs text-gray-400 font-mono">Loading {selectedGenre.name} songs...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {genreSongs.slice(0, 6).map((track) => (
                  <SongCard
                    key={track.id}
                    track={track}
                    queueContext={genreSongs}
                    onOpenRingtone={onOpenRingtone}
                  />
                ))}
              </div>

              <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-2">
                <h4 className="text-base font-bold text-white mb-4">Complete Tracklist</h4>
                <div className="space-y-1">
                  {genreSongs.map((track, i) => (
                    <SongRow
                      key={track.id}
                      track={track}
                      index={i}
                      queueContext={genreSongs}
                      onOpenRingtone={onOpenRingtone}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Genres Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <div
              key={genre.id}
              onClick={() => handleSelectGenre(genre)}
              className={`group relative h-36 sm:h-40 rounded-3xl p-5 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:scale-103 hover:shadow-2xl bg-gradient-to-br ${genre.color} border border-white/10`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {genre.name}
                </h3>
                <Sparkles className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
              </div>
              <p className="text-[11px] text-white/70 font-medium">Explore Vibe →</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Language, Track } from '../types/music';
import { api } from '../utils/api';
import { SongCard } from '../components/common/SongCard';
import { SongRow } from '../components/common/SongRow';
import { Globe2, ArrowLeft } from 'lucide-react';

interface LanguagesPageProps {
  onOpenRingtone: (track: Track) => void;
}

export const LanguagesPage: React.FC<LanguagesPageProps> = ({ onOpenRingtone }) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [langSongs, setLangSongs] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    api.getLanguages().then(setLanguages);
  }, []);

  const handleSelectLang = (lang: Language) => {
    setSelectedLang(lang);
    setIsLoading(true);
    api.getLanguageSongs(lang.id)
      .then((res) => setLangSongs(res.songs || []))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Globe2 className="w-4 h-4" />
          <span>Multilingual Music Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Regional Music Hub
        </h2>
        <p className="text-sm text-gray-400">
          Discover native catalog and chartbusters across all Indian regional languages and global Billboard hits.
        </p>
      </div>

      {selectedLang ? (
        /* Selected Language View */
        <div className="space-y-8 animate-in fade-in">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedLang(null)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>{selectedLang.flag}</span>
                <span>{selectedLang.name} Music Hub</span>
              </h3>
              <p className="text-xs text-gray-400">{selectedLang.subtitle}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-xs text-gray-400 font-mono">Loading {selectedLang.name} hits...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {langSongs.slice(0, 6).map((track) => (
                  <SongCard
                    key={track.id}
                    track={track}
                    queueContext={langSongs}
                    onOpenRingtone={onOpenRingtone}
                  />
                ))}
              </div>

              <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-2">
                <h4 className="text-base font-bold text-white mb-4">Trending {selectedLang.name} Songs</h4>
                <div className="space-y-1">
                  {langSongs.map((track, i) => (
                    <SongRow
                      key={track.id}
                      track={track}
                      index={i}
                      queueContext={langSongs}
                      onOpenRingtone={onOpenRingtone}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Language Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {languages.map((lang) => (
            <div
              key={lang.id}
              onClick={() => handleSelectLang(lang)}
              className="glass-card p-6 rounded-3xl border border-white/10 cursor-pointer hover:border-purple-500/40 hover:scale-102 transition-all group flex items-center justify-between"
            >
              <div className="space-y-1.5 min-w-0 pr-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{lang.flag}</span>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {lang.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed truncate">{lang.subtitle}</p>
              </div>
              <span className="text-xs font-semibold text-cyan-400 shrink-0">Open →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

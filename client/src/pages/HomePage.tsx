import React, { useState, useEffect } from 'react';
import { Track } from '../types/music';
import { api } from '../utils/api';
import { SongCard } from '../components/common/SongCard';
import { SongRow } from '../components/common/SongRow';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { useRoom } from '../context/RoomContext';
import {
  Play,
  Sparkles,
  Flame,
  Radio,
  Globe2,
  TrendingUp,
  Video,
  ChevronRight,
  ShieldCheck,
  Disc3,
  Users
} from 'lucide-react';

interface HomePageProps {
  selectedLanguage: string;
  onNavigateTab: (tab: string) => void;
  onOpenRingtone: (track: Track) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  selectedLanguage,
  onNavigateTab,
  onOpenRingtone
}) => {
  const { playTrack } = useAudioPlayer();
  const { likedSongs, history } = useLibrary();
  const { isInRoom, syncChangeTrack } = useRoom();

  const [trendingSongs, setTrendingSongs] = useState<Track[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<Track[]>([]);
  const [youtubeTrending, setYoutubeTrending] = useState<Track[]>([]);
  const [openLicensed, setOpenLicensed] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.getTrending(selectedLanguage, 12),
      api.getRecommendations({ likedSongs, history, preferences: { language: selectedLanguage } }),
      api.getYouTubeTrending(),
      api.getOpenLicensedTrending()
    ])
      .then(([trending, recs, yt, open]) => {
        if (!isMounted) return;
        setTrendingSongs(trending);
        setRecommendedSongs(recs);
        setYoutubeTrending(yt);
        setOpenLicensed(open);
      })
      .catch((err) => console.error('HomePage loading error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedLanguage]);

  const heroTrack = trendingSongs[0] || recommendedSongs[0];

  const handleHeroPlay = () => {
    if (heroTrack) {
      playTrack(heroTrack, trendingSongs);
      if (isInRoom) syncChangeTrack(heroTrack);
    }
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
      {/* Hero Showcase Banner */}
      {heroTrack && (
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 p-6 sm:p-10 shadow-2xl">
          {/* Ambient Blurred Artwork Glow */}
          <div
            className="absolute top-0 right-0 w-3/4 h-full bg-cover bg-center filter blur-3xl opacity-30 pointer-events-none scale-125"
            style={{ backgroundImage: `url(${heroTrack.artwork})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07050e] via-[#07050e]/80 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl flex flex-col justify-between space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-xs font-semibold text-cyan-300 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AURA SPOTLIGHT • TOP CHARTBUSTER</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {heroTrack.title}
              </h2>
              <p className="text-base sm:text-lg text-gray-300 font-medium mt-2">
                {heroTrack.artist}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Album: {heroTrack.album} • 320kbps Studio Quality • Ad-Free
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleHeroPlay}
                className="flex items-center space-x-2.5 px-7 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs rounded-full shadow-2xl shadow-purple-600/50 transform active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Now</span>
              </button>

              <button
                onClick={() => onNavigateTab('rooms')}
                className="flex items-center space-x-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold rounded-full transition-all"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Listen with Friends</span>
              </button>

              <button
                onClick={() => onOpenRingtone(heroTrack)}
                className="flex items-center space-x-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white text-xs font-semibold rounded-full transition-all"
              >
                <span>Make Ringtone</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && trendingSongs.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-mono">Fetching catalog from authorized providers...</p>
        </div>
      ) : (
        <>
          {/* Trending Songs Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                  <Flame className="w-5 h-5 text-amber-400 fill-current" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Trending in {selectedLanguage === 'all' ? 'India & Global' : selectedLanguage.toUpperCase()}
                  </h3>
                  <p className="text-xs text-gray-400">Top chartbusters streamed right now</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('explore')}
                className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                <span>See All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trendingSongs.slice(0, 6).map((track) => (
                <SongCard
                  key={track.id}
                  track={track}
                  queueContext={trendingSongs}
                  onOpenRingtone={onOpenRingtone}
                />
              ))}
            </div>
          </section>

          {/* AI Recommended / Daily Mix Section */}
          {recommendedSongs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Recommended For You
                    </h3>
                    <p className="text-xs text-gray-400">Curated by Aura AI based on your listening vibe</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {recommendedSongs.slice(0, 6).map((track) => (
                  <SongCard
                    key={track.id}
                    track={track}
                    queueContext={recommendedSongs}
                    onOpenRingtone={onOpenRingtone}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Authorized YouTube Music Videos Section */}
          {youtubeTrending.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
                      <span>YouTube Music Spotlight</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 rounded-full font-mono">
                        Authorized IFrame Playback
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Official music videos and live performances</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {youtubeTrending.slice(0, 4).map((track) => (
                  <SongCard
                    key={track.id}
                    track={track}
                    queueContext={youtubeTrending}
                    onOpenRingtone={onOpenRingtone}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Open-Licensed & Ringtone Ready Section */}
          {openLicensed.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                    <Disc3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Open Licensed & Ringtone Ready
                    </h3>
                    <p className="text-xs text-gray-400">100% authorized for offline downloads, audio trimming & ringtones</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('ringtone')}
                  className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  <span>Open Studio</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {openLicensed.slice(0, 6).map((track) => (
                  <SongCard
                    key={track.id}
                    track={track}
                    queueContext={openLicensed}
                    onOpenRingtone={onOpenRingtone}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Quick Tracklist (Top Chart Highlights) */}
          <section className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Today's Top Chart Highlights</span>
            </h3>

            <div className="space-y-1">
              {trendingSongs.slice(6, 12).map((track, i) => (
                <SongRow
                  key={track.id}
                  track={track}
                  index={i + 6}
                  queueContext={trendingSongs}
                  onOpenRingtone={onOpenRingtone}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

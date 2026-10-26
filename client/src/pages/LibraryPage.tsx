import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { Track } from '../types/music';
import { SongCard } from '../components/common/SongCard';
import { SongRow } from '../components/common/SongRow';
import {
  Heart,
  ListMusic,
  History,
  Plus,
  Trash2,
  FolderPlus,
  Sparkles,
  Music
} from 'lucide-react';

interface LibraryPageProps {
  onOpenRingtone: (track: Track) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ onOpenRingtone }) => {
  const { likedSongs, playlists, history, createPlaylist, deletePlaylist } = useLibrary();
  const [activeTab, setActiveTab] = useState<'likes' | 'playlists' | 'history'>('likes');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistTitle.trim()) return;
    await createPlaylist(playlistTitle.trim(), playlistDesc.trim());
    setPlaylistTitle('');
    setPlaylistDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header & Tabs */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          My Library
        </h2>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'likes'
                ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Liked Songs ({likedSongs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'playlists'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span>Playlists ({playlists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Liked Songs */}
      {activeTab === 'likes' && (
        <div className="space-y-6">
          {likedSongs.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center text-gray-400 space-y-3">
              <Heart className="w-12 h-12 mx-auto opacity-30 text-pink-400" />
              <h3 className="text-lg font-bold text-white">No Liked Songs Yet</h3>
              <p className="text-xs text-gray-500">Tap the heart on any song to save it to your favorites.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {likedSongs.slice(0, 6).map((track) => (
                  <SongCard
                    key={track.id}
                    track={track}
                    queueContext={likedSongs}
                    onOpenRingtone={onOpenRingtone}
                  />
                ))}
              </div>

              <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-1">
                <h4 className="text-sm font-bold text-white mb-3">All Liked Tracks</h4>
                {likedSongs.map((track, i) => (
                  <SongRow
                    key={track.id}
                    track={track}
                    index={i}
                    queueContext={likedSongs}
                    onOpenRingtone={onOpenRingtone}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Playlists */}
      {activeTab === 'playlists' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">Custom user collections</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Playlist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition-all space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <img src={pl.artwork} alt="" className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-white truncate">{pl.title}</h4>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{pl.description}</p>
                    <span className="text-[10px] text-purple-300 font-mono mt-1 block">
                      {pl.tracks.length} songs
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-[10px] text-gray-500 font-mono">
                    Created {new Date(pl.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => deletePlaylist(pl.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center text-gray-400 space-y-3">
              <History className="w-12 h-12 mx-auto opacity-30 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">No Listening History</h3>
              <p className="text-xs text-gray-500">Songs you play will appear here.</p>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-1">
              {history.map((track, i) => (
                <SongRow
                  key={`${track.id}-${i}`}
                  track={track}
                  index={i}
                  queueContext={history}
                  onOpenRingtone={onOpenRingtone}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0f0a1c] border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telugu Romance, Gym Beats..."
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Add an optional description..."
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

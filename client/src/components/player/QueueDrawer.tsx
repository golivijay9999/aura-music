import React from 'react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { useRoom } from '../../context/RoomContext';
import { X, Trash2, Play, Music, Sparkles } from 'lucide-react';

export const QueueDrawer: React.FC = () => {
  const {
    isQueueOpen,
    setQueueOpen,
    queue,
    currentTrack,
    playTrack,
    removeFromQueue,
    clearQueue
  } = useAudioPlayer();

  const { isInRoom, syncChangeTrack } = useRoom();

  if (!isQueueOpen) return null;

  const handleTrackClick = (track: (typeof queue)[0]) => {
    playTrack(track);
    if (isInRoom) syncChangeTrack(track);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#0c0817]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Play Queue</h3>
            <p className="text-xs text-gray-400">{queue.length} songs queued</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {queue.length > 1 && (
            <button
              onClick={clearQueue}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors text-xs flex items-center space-x-1"
              title="Clear queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setQueueOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Music className="w-10 h-10 opacity-30" />
            <p className="text-sm">Queue is empty</p>
            <p className="text-xs text-gray-500">Pick a song to start listening</p>
          </div>
        ) : (
          queue.map((track, index) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={`${track.id}-${index}`}
                className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div
                  onClick={() => handleTrackClick(track)}
                  className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img
                      src={track.artwork}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCurrent ? 'text-purple-300' : 'text-gray-200 group-hover:text-white'
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <button
                    onClick={() => removeFromQueue(index)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-gray-400 hover:text-red-400 transition-all"
                    title="Remove from queue"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Smart Queue Footer notice */}
      <div className="p-4 border-t border-white/10 bg-zinc-950/40">
        <div className="flex items-center space-x-2 text-xs text-purple-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Smart Queue auto-fills similar hits continuously</span>
        </div>
      </div>
    </div>
  );
};

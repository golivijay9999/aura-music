import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import {
  Plus,
  LogIn,
  LogOut,
  Send,
  Sparkles,
  Crown,
  Radio,
  Copy,
  Check,
  Users,
  ShieldAlert
} from 'lucide-react';

export const ListeningRoomsView: React.FC = () => {
  const {
    activeRoom,
    isInRoom,
    isHost,
    reactions,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    sendReaction,
    toggleCollaborative
  } = useRoom();

  const { currentTrack } = useAudioPlayer();

  const [roomNameInput, setRoomNameInput] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);

  const emojis = ['🔥', '❤️', '🎵', '🚀', '💃', '👏'];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom(roomNameInput.trim() || 'Aura Listening Lounge', currentTrack || undefined);
    setRoomNameInput('');
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    joinRoom(roomCodeInput.trim());
    setRoomCodeInput('');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim());
    setChatInput('');
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard?.writeText(activeRoom.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300 relative">
      {/* Floating Real-time Emoji Reactions */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-24 text-4xl animate-bounce transition-all duration-1000"
            style={{ left: `${r.x}%` }}
          >
            <span>{r.emoji}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
            <span>Cross-Device Real-Time Sync</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Synchronized Listening Rooms
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Listen with friends in perfect sync across phones, tablets, and laptops with shared queues and live chat.
          </p>
        </div>

        {isInRoom && (
          <button
            onClick={leaveRoom}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Session</span>
          </button>
        )}
      </div>

      {!isInRoom || !activeRoom ? (
        /* Lobby: Create or Join Room */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 flex flex-col justify-between">
            <div>
              <div className="p-3 w-fit rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 mb-4">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Host a Listening Room</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Create a synchronized session. You control playback, queue tracks, or enable DJ mode for friends.
              </p>

              <form onSubmit={handleCreate} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1.5">
                    Room Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tollywood Party, Late Night Chill..."
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-xl shadow-purple-600/40 transition-all active:scale-95"
                >
                  Create & Launch Room
                </button>
              </form>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-purple-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Generates a unique 6-character room code to share</span>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 flex flex-col justify-between">
            <div>
              <div className="p-3 w-fit rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 mb-4">
                <LogIn className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Join with Room Code</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Enter a 6-character room code from your friend to join their session in real-time.
              </p>

              <form onSubmit={handleJoin} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1.5">
                    Room Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AURA42"
                    maxLength={6}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl font-mono tracking-widest text-white uppercase placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-center text-lg font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 shadow-lg transition-all active:scale-95"
                >
                  Connect & Synchronize
                </button>
              </form>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-[11px] text-gray-400 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Drift compensation automatically keeps playback in lock-step</span>
            </div>
          </div>
        </div>
      ) : (
        /* Active Room View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Active Session & Participants */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Banner */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                    <span className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider">
                      Live Synchronized Session
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">{activeRoom.name}</h3>
                  <p className="text-xs text-gray-400">Host: {activeRoom.hostName}</p>
                </div>

                {/* Shareable Code Box */}
                <div
                  onClick={handleCopyCode}
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 cursor-pointer hover:border-purple-400 transition-colors w-fit"
                  title="Click to copy Room Code"
                >
                  <div>
                    <p className="text-[10px] text-purple-300 font-medium">Room Code</p>
                    <p className="text-xl font-mono font-black text-white tracking-widest">{activeRoom.id}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-600/30 text-purple-200">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Host Collaborative Controls */}
              {isHost && (
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-gray-300">DJ Collaborative Mode:</span>
                    <span className="text-xs font-bold text-cyan-400">
                      {activeRoom.isCollaborative ? 'Everyone can queue' : 'Host Only'}
                    </span>
                  </div>
                  <button
                    onClick={toggleCollaborative}
                    className="text-xs text-purple-300 hover:text-white underline"
                  >
                    Toggle Permissions
                  </button>
                </div>
              )}
            </div>

            {/* Currently Playing in Room */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Playing for All Participants
              </h4>
              {activeRoom.currentTrack ? (
                <div className="flex items-center space-x-4 p-4 rounded-2xl bg-zinc-950/60 border border-white/5">
                  <img
                    src={activeRoom.currentTrack.artwork}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-white truncate">{activeRoom.currentTrack.title}</p>
                    <p className="text-xs text-gray-400 truncate">{activeRoom.currentTrack.artist}</p>
                    <span className="inline-block text-[10px] font-mono text-cyan-400 mt-1">
                      {activeRoom.isPlaying ? '▶ Synchronized Playing' : '⏸ Paused by Host'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-gray-500">
                  Select any song in the app to broadcast to all participants.
                </div>
              )}
            </div>

            {/* Participants Grid */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Connected Listeners ({activeRoom.participants.length})</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activeRoom.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center space-x-3 p-3 rounded-2xl bg-zinc-950/50 border border-white/5"
                  >
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10">
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                      {p.isHost && (
                        <span className="absolute bottom-0 right-0 p-0.5 bg-amber-500 rounded-full" title="Host">
                          <Crown className="w-2.5 h-2.5 text-black" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate flex items-center space-x-1">
                        <span>{p.name}</span>
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">{p.device}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live Room Chat & Emoji Reaction Deck */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col h-[520px]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-3 border-b border-white/5">
              Live Room Chat
            </h4>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              {activeRoom.messages.map((m) => (
                <div key={m.id} className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5">
                    <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1 bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-purple-300 text-[11px]">{m.sender}</span>
                      <span className="text-[9px] text-gray-500 font-mono">{m.timestamp}</span>
                    </div>
                    <p className="text-gray-200 break-words leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Emoji Reaction Deck */}
            <div className="flex justify-between items-center py-2 px-1 border-t border-white/5">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(emoji)}
                  className="p-1.5 text-xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                placeholder="Say something to the room..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-zinc-950/70 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

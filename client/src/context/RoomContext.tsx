import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ListeningRoom, RoomMessage, Track } from '../types/music';
import { useAuth } from './AuthContext';
import { useAudioPlayer } from './AudioPlayerContext';
import confetti from 'canvas-confetti';

interface FloatingReaction {
  id: string;
  emoji: string;
  userName: string;
  x: number;
}

interface RoomContextType {
  activeRoom: ListeningRoom | null;
  isInRoom: boolean;
  isHost: boolean;
  reactions: FloatingReaction[];
  createRoom: (roomName: string, initialTrack?: Track) => void;
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  sendChatMessage: (text: string) => void;
  sendReaction: (emoji: string) => void;
  toggleCollaborative: () => void;
  syncPlayState: (isPlaying: boolean, position?: number) => void;
  syncSeek: (position: number) => void;
  syncChangeTrack: (track: Track) => void;
  syncAddToQueue: (track: Track) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { playTrack, togglePlay, seek, currentTime } = useAudioPlayer();

  const [activeRoom, setActiveRoom] = useState<ListeningRoom | null>(null);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const isSyncingFromRemoteRef = useRef<boolean>(false);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socket = io('/', {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      // Connected to room server
    });

    socket.on('room:created', ({ room }: { room: ListeningRoom }) => {
      setActiveRoom(room);
    });

    socket.on('room:sync', ({ room }: { room: ListeningRoom }) => {
      setActiveRoom(room);
      if (room.currentTrack) {
        isSyncingFromRemoteRef.current = true;
        playTrack(room.currentTrack, room.queue).then(() => {
          if (typeof room.playbackPosition === 'number') {
            seek(room.playbackPosition);
          }
          isSyncingFromRemoteRef.current = false;
        });
      }
    });

    socket.on('room:play_state_changed', ({ isPlaying, playbackPosition, senderId }) => {
      if (senderId !== socket.id) {
        isSyncingFromRemoteRef.current = true;
        if (typeof playbackPosition === 'number') {
          seek(playbackPosition);
        }
        togglePlay();
        setTimeout(() => {
          isSyncingFromRemoteRef.current = false;
        }, 300);
      }
    });

    socket.on('room:seeked', ({ playbackPosition, senderId }) => {
      if (senderId !== socket.id) {
        isSyncingFromRemoteRef.current = true;
        seek(playbackPosition);
        setTimeout(() => {
          isSyncingFromRemoteRef.current = false;
        }, 300);
      }
    });

    socket.on('room:track_changed', ({ currentTrack, queue }) => {
      isSyncingFromRemoteRef.current = true;
      playTrack(currentTrack, queue).then(() => {
        isSyncingFromRemoteRef.current = false;
      });
      setActiveRoom(prev => prev ? { ...prev, currentTrack, queue } : null);
    });

    socket.on('room:queue_updated', ({ queue, currentTrack }) => {
      setActiveRoom(prev => prev ? { ...prev, queue, currentTrack } : null);
    });

    socket.on('room:new_chat', ({ message }: { message: RoomMessage }) => {
      setActiveRoom(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, message]
        };
      });
    });

    socket.on('room:reaction_received', ({ emoji, userName }) => {
      const id = 'rx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      const x = Math.floor(Math.random() * 80) + 10;
      setReactions(prev => [...prev, { id, emoji, userName, x }]);

      // Trigger celebratory particle burst
      try {
        confetti({
          particleCount: 20,
          spread: 60,
          origin: { y: 0.85, x: x / 100 }
        });
      } catch {
        // ignore
      }

      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== id));
      }, 3500);
    });

    socket.on('room:heartbeat', ({ playbackPosition, isPlaying: _isPlaying }) => {
      // Calibrate playback drift if drift > 1.5 seconds
      if (!isSyncingFromRemoteRef.current && typeof playbackPosition === 'number') {
        const drift = Math.abs(currentTime - playbackPosition);
        if (drift > 1.5) {
          seek(playbackPosition);
        }
      }
    });

    socket.on('room:participant_left', ({ participants, room }) => {
      setActiveRoom(prev => prev ? { ...prev, participants, ...room } : null);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentTime]);

  const createRoom = (roomName: string, initialTrack?: Track) => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:create', {
      roomName,
      userName: user?.username || 'Host',
      avatar: user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`,
      initialTrack
    });
  };

  const joinRoom = (roomCode: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:join', {
      roomCode: roomCode.trim().toUpperCase(),
      userName: user?.username || 'Guest Listener',
      avatar: user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`,
      device: navigator.userAgent.includes('Mobile') ? 'Mobile Phone' : 'Desktop'
    });
  };

  const leaveRoom = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:leave');
    setActiveRoom(null);
  };

  const sendChatMessage = (text: string) => {
    if (!socketRef.current || !text.trim()) return;
    socketRef.current.emit('room:send_chat', {
      text,
      userName: user?.username || 'Listener',
      avatar: user?.avatar
    });
  };

  const sendReaction = (emoji: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:reaction', {
      emoji,
      userName: user?.username || 'Listener'
    });
  };

  const toggleCollaborative = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:toggle_collaborative');
  };

  const syncPlayState = (isPlaying: boolean, position?: number) => {
    if (!socketRef.current || !activeRoom || isSyncingFromRemoteRef.current) return;
    socketRef.current.emit('room:play_state', { isPlaying, position });
  };

  const syncSeek = (position: number) => {
    if (!socketRef.current || !activeRoom || isSyncingFromRemoteRef.current) return;
    socketRef.current.emit('room:seek', { position });
  };

  const syncChangeTrack = (track: Track) => {
    if (!socketRef.current || !activeRoom || isSyncingFromRemoteRef.current) return;
    socketRef.current.emit('room:change_track', { track });
  };

  const syncAddToQueue = (track: Track) => {
    if (!socketRef.current || !activeRoom) return;
    socketRef.current.emit('room:add_queue', { track });
  };

  const isHost = Boolean(activeRoom && socketRef.current && activeRoom.hostId === socketRef.current.id);

  return (
    <RoomContext.Provider
      value={{
        activeRoom,
        isInRoom: Boolean(activeRoom),
        isHost,
        reactions,
        createRoom,
        joinRoom,
        leaveRoom,
        sendChatMessage,
        sendReaction,
        toggleCollaborative,
        syncPlayState,
        syncSeek,
        syncChangeTrack,
        syncAddToQueue
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

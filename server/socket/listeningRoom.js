// Listening Rooms Synchronization Engine powered by Socket.IO

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getCalculatedPosition(room) {
  if (!room.isPlaying || !room.lastUpdated) {
    return room.playbackPosition || 0;
  }
  const elapsedSec = (Date.now() - room.lastUpdated) / 1000;
  const currentPos = (room.playbackPosition || 0) + elapsedSec;
  if (room.currentTrack && room.currentTrack.duration && currentPos > room.currentTrack.duration) {
    return room.currentTrack.duration;
  }
  return currentPos;
}

function setupListeningRooms(io) {
  io.on('connection', (socket) => {
    let currentRoomCode = null;

    // Create Room
    socket.on('room:create', ({ roomName, userName, avatar, initialTrack }) => {
      let code = generateRoomCode();
      while (rooms.has(code)) {
        code = generateRoomCode();
      }

      const newRoom = {
        id: code,
        name: roomName || `${userName}'s Listening Lounge`,
        hostId: socket.id,
        hostName: userName || 'Host',
        isCollaborative: true,
        currentTrack: initialTrack || null,
        isPlaying: false,
        playbackPosition: 0,
        lastUpdated: Date.now(),
        queue: initialTrack ? [initialTrack] : [],
        participants: [
          {
            id: socket.id,
            name: userName || 'Host',
            avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${socket.id}`,
            isHost: true,
            device: 'Desktop / Mobile'
          }
        ],
        messages: [
          {
            id: 'msg_' + Date.now(),
            sender: 'Aura Sync',
            avatar: '/icons/icon-192.svg',
            text: `Welcome to ${roomName || 'Aura Room'}! Share room code "${code}" with friends to listen together.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };

      rooms.set(code, newRoom);
      currentRoomCode = code;
      socket.join(code);

      socket.emit('room:created', { room: newRoom });
    });

    // Join Room
    socket.on('room:join', ({ roomCode, userName, avatar, device }) => {
      const code = (roomCode || '').toUpperCase().trim();
      const room = rooms.get(code);

      if (!room) {
        return socket.emit('room:error', { message: `Room "${code}" not found. Please verify the code.` });
      }

      currentRoomCode = code;
      socket.join(code);

      // Add participant if not exists
      const existing = room.participants.find(p => p.id === socket.id);
      if (!existing) {
        room.participants.push({
          id: socket.id,
          name: userName || 'Guest Listener',
          avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${socket.id}`,
          isHost: false,
          device: device || 'Web / Mobile'
        });
      }

      // Sync calculated playback position
      const syncedPos = getCalculatedPosition(room);

      // System message
      room.messages.push({
        id: 'msg_' + Date.now(),
        sender: 'Aura Sync',
        avatar: '/icons/icon-192.svg',
        text: `${userName || 'A friend'} joined the listening session!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Broadcast updated room state
      io.to(code).emit('room:sync', {
        room: {
          ...room,
          playbackPosition: syncedPos
        }
      });
    });

    // Host or collaborative Play / Pause
    socket.on('room:play_state', ({ isPlaying, position }) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const isHost = room.hostId === socket.id;
      if (!isHost && !room.isCollaborative) return;

      room.isPlaying = isPlaying;
      if (typeof position === 'number') {
        room.playbackPosition = position;
      }
      room.lastUpdated = Date.now();

      io.to(currentRoomCode).emit('room:play_state_changed', {
        isPlaying: room.isPlaying,
        playbackPosition: room.playbackPosition,
        senderId: socket.id
      });
    });

    // Seek track
    socket.on('room:seek', ({ position }) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const isHost = room.hostId === socket.id;
      if (!isHost && !room.isCollaborative) return;

      room.playbackPosition = position;
      room.lastUpdated = Date.now();

      io.to(currentRoomCode).emit('room:seeked', {
        playbackPosition: position,
        senderId: socket.id
      });
    });

    // Change current track
    socket.on('room:change_track', ({ track }) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const isHost = room.hostId === socket.id;
      if (!isHost && !room.isCollaborative) return;

      room.currentTrack = track;
      room.playbackPosition = 0;
      room.isPlaying = true;
      room.lastUpdated = Date.now();

      // Ensure track is in queue
      if (!room.queue.find(t => t.id === track.id)) {
        room.queue.unshift(track);
      }

      io.to(currentRoomCode).emit('room:track_changed', {
        currentTrack: room.currentTrack,
        isPlaying: true,
        playbackPosition: 0,
        queue: room.queue
      });
    });

    // Add track to shared room queue
    socket.on('room:add_queue', ({ track }) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      room.queue.push(track);
      if (!room.currentTrack) {
        room.currentTrack = track;
        room.isPlaying = true;
        room.playbackPosition = 0;
        room.lastUpdated = Date.now();
      }

      io.to(currentRoomCode).emit('room:queue_updated', {
        queue: room.queue,
        currentTrack: room.currentTrack,
        isPlaying: room.isPlaying
      });
    });

    // Send Live Chat Message
    socket.on('room:send_chat', ({ text, userName, avatar }) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const msg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        sender: userName || 'Listener',
        avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${socket.id}`,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      room.messages.push(msg);
      // Keep max 50 recent messages
      if (room.messages.length > 50) {
        room.messages.shift();
      }

      io.to(currentRoomCode).emit('room:new_chat', { message: msg });
    });

    // Floating Emoji Reaction
    socket.on('room:reaction', ({ emoji, userName }) => {
      if (!currentRoomCode) return;
      io.to(currentRoomCode).emit('room:reaction_received', {
        emoji,
        userName,
        senderId: socket.id,
        id: 'rx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
      });
    });

    // Toggle Collaborative Mode (Host only)
    socket.on('room:toggle_collaborative', () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.hostId !== socket.id) return;

      room.isCollaborative = !room.isCollaborative;
      io.to(currentRoomCode).emit('room:collaborative_changed', {
        isCollaborative: room.isCollaborative
      });
    });

    // Leave room
    socket.on('room:leave', () => {
      handleLeave(socket, io, currentRoomCode);
      currentRoomCode = null;
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (currentRoomCode) {
        handleLeave(socket, io, currentRoomCode);
      }
    });
  });

  // Periodic heartbeat every 5 seconds to calibrate drift across all devices
  setInterval(() => {
    for (const [code, room] of rooms.entries()) {
      if (room.isPlaying && room.participants.length > 0) {
        const syncedPos = getCalculatedPosition(room);
        io.to(code).emit('room:heartbeat', {
          playbackPosition: syncedPos,
          isPlaying: room.isPlaying,
          timestamp: Date.now()
        });
      }
    }
  }, 5000);
}

function handleLeave(socket, io, code) {
  if (!code) return;
  const room = rooms.get(code);
  if (!room) return;

  const leaver = room.participants.find(p => p.id === socket.id);
  room.participants = room.participants.filter(p => p.id !== socket.id);

  if (room.participants.length === 0) {
    // Room is empty, clean up
    rooms.delete(code);
  } else {
    // If the host left, designate next participant as host
    if (room.hostId === socket.id) {
      room.hostId = room.participants[0].id;
      room.hostName = room.participants[0].name;
      room.participants[0].isHost = true;
    }

    if (leaver) {
      room.messages.push({
        id: 'msg_' + Date.now(),
        sender: 'Aura Sync',
        avatar: '/icons/icon-192.svg',
        text: `${leaver.name} left the room.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    io.to(code).emit('room:participant_left', {
      leftId: socket.id,
      newHostId: room.hostId,
      participants: room.participants,
      room
    });
  }

  socket.leave(code);
}

module.exports = { setupListeningRooms };

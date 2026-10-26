require('dotenv').config();
const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { router: authRouter } = require('./routes/auth');
const musicRouter = require('./routes/music');
const lyricsRouter = require('./routes/lyrics');
const libraryRouter = require('./routes/library');
const ringtonesRouter = require('./routes/ringtones');
const { setupListeningRooms } = require('./socket/listeningRoom');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup Listening Room Real-time Engine
setupListeningRooms(io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/music', musicRouter);
app.use('/api/lyrics', lyricsRouter);
app.use('/api/library', libraryRouter);
app.use('/api/ringtones', ringtonesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'AURA MUSIC',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// Fallback for SPA routing in Express 5
app.use((req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    const indexPath = path.join(clientDist, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🎵 AURA MUSIC SERVER RUNNING`);
  console.log(`🚀 Port: http://localhost:${PORT}`);
  console.log(`📡 Socket.IO Listening Rooms: Active`);
  console.log(`💎 Authorized Music Aggregator: Connected`);
  console.log(`==============================================\n`);
});

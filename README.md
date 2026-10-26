# 🎵 AURA MUSIC - Premium Ad-Free Music Streaming Application

**AURA MUSIC** is a complete, high-fidelity music streaming application inspired by Spotify, JioSaavn, Apple Music, and YouTube Music. It features an original, dark-aesthetic glassmorphism interface, deep black backgrounds, purple & cyan gradients, synchronized lyrics, cross-device real-time listening rooms, a built-in ringtone studio, offline downloading, and an intelligent recommendation engine.

---

## ✨ Features & Capabilities

### 1. Extraordinary User Interface
- **Dark Aesthetic & Glassmorphism:** Deep blacks (`#07050e`), electric purple and neon cyan gradients, blurred backdrop panels, dynamic album artwork ambient lighting, and smooth transitions.
- **Interactive Song Cards & Rows:** Play on hover, animated soundwave indicators, quick like, trim in ringtone studio, and download.
- **Responsive Across All Screen Sizes:** Optimized layout for Desktop, Tablet, and Mobile Android screens.
- **Immersive Full-Screen Player:** Ambient blurred album backdrop, rotating vinyl record animation, real-time audio visualizer canvas, live synchronized karaoke lyrics, and quick playback controls.

### 2. Complete Music Discovery
- **Extensive Regional Catalog:** Native discovery across **Telugu, Hindi, Tamil, Kannada, Malayalam, English, Punjabi**, and more through authorized music aggregator endpoints.
- **Top Charts & Trending:** Real-time top chart rankings with podium highlights and language filters.
- **Curated Genres & Moods:** Romantic, Party & Dance, Chill & Relax, Devotional, Workout, Golden Retro, Sad, Lo-Fi, EDM, Hip-Hop, Classical, and Acoustic.
- **320 kbps Studio Fidelity:** Studio-quality streaming with fallback to 160 kbps Data Saver mode.

### 3. YouTube Music & Video Integration
- **Official Authorized Playback:** Integrated using the official YouTube IFrame Player API.
- **Search & Discover:** Search for tracks, artists, and music videos.
- **Terms-Compliant:** Strictly adheres to YouTube developer terms—no scraping, no DRM bypass, no unauthorized extraction, and no ad blocking. YouTube tracks are marked for in-app video/audio streaming only.

### 4. Pure Ad-Free Experience
- Completely free of banner ads, pop-ups, third-party advertising SDKs, and sponsored clutter.

### 5. Advanced Music Player
- HTML5 Audio engine + YouTube IFrame fallback.
- Controls: Play/Pause, Next/Previous, Seek Bar, Volume slider + Mute, Shuffle, Repeat (Off, All, One).
- **Persistent Playback:** Music continues playing uninterrupted as you navigate across all pages.
- **Queue Management:** Up Next drawer, track removal, clear queue, and auto-play smart suggestions.
- **Lock-Screen Controls:** Complete **MediaSession API** integration for Android notification shade and lock-screen media controls.

### 6. AI Song Recommendations
- Dynamic recommendations based on listening history, liked songs, target languages, and currently playing acoustic attributes.
- **Smart Queue:** Automatically generates similar tracks when your queue ends so playback never stops.
- **Personalized Daily Mix:** Fresh recommendations tailored to your taste profile.

### 7. Ringtone Maker & Audio Cutter Studio
- **Built-in Audio Studio:** Load eligible tracks or upload your own local audio file (MP3, WAV, AAC).
- **Interactive Visual Trimmer:** Start and end timecode sliders with millisecond precision.
- **DSP Controls:** Fade-In (0–5s), Fade-Out (0–5s), and Volume Normalizer/Boost (50%–200%).
- **Presets:** Phone Ringtone (30s), Notification Tone (4s), Alarm Tone (20s), and Custom Clip.
- **High-Fidelity WAV Export:** Direct client-side encoding using Web Audio API AudioBuffers.
- **Ringtone Library:** Saves created ringtones with download access.
- **Android Setup Guide:** Clear steps for configuring custom ringtones in Android Settings.

### 8. Easy Music Downloads & Offline Storage
- **Dedicated Downloads Section:** IndexedDB-backed local storage for true offline playback.
- **Storage Gauge:** Real-time indicator of offline storage utilized in MB.
- **Compliance:** Clear download eligibility badges on tracks. Copyrighted/protected streams are marked for streaming only.

### 9. Synchronized Listening Rooms Across Devices
- **Real-Time WebSockets Engine:** Powered by Socket.IO on Express.
- **Sync Features:** Synchronized track changes, play/pause state, seek position, and shared room queue.
- **Drift Compensation:** Periodic 5-second calibration loop keeps all devices in sync within 1.5 seconds.
- **Host Controls:** Designate host permissions, collaborative DJ mode toggle.
- **Live Room Chat & Floating Emoji Reactions:** Real-time messages and floating animated emoji reactions (`🔥`, `❤️`, `🎵`, `🚀`, `💃`, `👏`) with confetti bursts!

### 10. Synchronized Lyrics & Web Audio Effects
- **LRCLIB Integration:** Synchronized karaoke lyrics with timestamps, smooth auto-scrolling, and interactive jump-to-line seeking.
- **10-Band Equalizer:** 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz with BiquadFilterNodes.
- **Equalizer Presets:** Flat, Bass Boost, Vocal Boost, Treble Boost, Pop, Rock, Electronic, Hip-Hop, Classical, Acoustic.
- **Canvas Audio Visualizer:** Real-time FFT spectrum visualizer with Frequency Bars, Oscilloscope Wave, and Circular Halo modes.

### 11. Personal Library & Accounts
- **Zero-Barrier Guest Mode:** Start listening immediately without logging in.
- **Secure Authentication:** Register & Login with bcrypt password hashing and JWT authorization tokens.
- **User Library:** Liked Songs, Custom Playlists, and Listening History.

### 12. Android PWA (Progressive Web App)
- Web App Manifest (`manifest.json`) with custom app icons (`icon-192.svg`, `icon-512.svg`).
- Service Worker (`sw.js`) for offline caching of app assets.
- Responsive mobile bottom navigation bar and background audio support.

---

## 🛠️ Architecture

```
thar-music/
  ├── package.json              # Root project configuration & unified scripts
  ├── server/                   # Backend Express & Socket.IO server
  │    ├── index.js             # API server & production static client serving
  │    ├── routes/
  │    │     ├── auth.js        # Authentication & Profile routes
  │    │     ├── music.js       # Discovery, search, and charts aggregator
  │    │     ├── lyrics.js      # LRCLIB synchronized lyrics proxy
  │    │     ├── library.js     # Liked songs, playlists, history
  │    │     └── ringtones.js   # Ringtone studio library storage
  │    ├── services/
  │    │     ├── saavnService.js # Regional music engine (Telugu, Hindi, etc.) with DES decryption
  │    │     ├── youtubeService.js # YouTube search & curated music video directory
  │    │     ├── audiusService.js # Open-licensed & creative commons track engine
  │    │     ├── recommendationEngine.js # AI recommendation & smart queue algorithms
  │    │     └── storage.js     # File-backed database store
  │    └── socket/
  │          └── listeningRoom.js # Real-time synchronized listening room manager
  ├── client/                   # Vite + React + TypeScript + Tailwind CSS Frontend
  │    ├── index.html           # HTML5 entry with PWA manifest & fonts
  │    ├── vite.config.ts       # Tailwind CSS v4 & dev server proxy
  │    ├── src/
  │    │     ├── main.tsx       # Root React bootstrap
  │    │     ├── App.tsx        # Context providers wrapper
  │    │     ├── types/         # TypeScript definitions
  │    │     ├── context/       # AuthContext, LibraryContext, AudioPlayerContext, RoomContext
  │    │     ├── components/    # PlayerBar, FullScreenPlayer, Equalizer, RingtoneStudio, Rooms
  │    │     ├── pages/         # Home, Search, Explore, Genres, Languages, Library, Downloads, Settings
  │    │     └── utils/         # audioEngine, audioCutter, downloadManager, lrcParser, mediaSession, api
  │    └── public/              # manifest.json, sw.js, and icons
  └── test/                     # Automated Test Suite (12/12 passing)
       ├── suite.js             # API & stream verification tests
       └── runner.js            # Automated test runner with server lifecycle management
```

---

## 🚀 Setup & Running Instructions

### Prerequisites
- **Node.js:** v18.0.0 or later (Tested on Node v24.21.0)
- **NPM:** v9.0.0 or later (Tested on NPM v11.19.0)

### 1. Install Dependencies
```bash
# In project root:
npm install
npm install --prefix client
```

### 2. Run in Development Mode
To run both the backend server and frontend Vite hot-reloading dev server concurrently:
```bash
npm run dev
```
- **Frontend:** `http://localhost:3000` (proxies `/api` and `/socket.io` to backend)
- **Backend Server:** `http://localhost:5000`

### 3. Build for Production
To compile the TypeScript frontend into optimized static production assets:
```bash
npm run build
```

### 4. Run the Production Server
```bash
npm start
```
The server will be live at **`http://localhost:5000`**, serving both the API, Socket.IO listening rooms, and the compiled Single Page Application!

### 5. Run the Automated Verification Suite
```bash
node test/runner.js
```
Executes all 12 end-to-end integration tests:
- Server Health Check
- Guest Session Generation
- User Registration & JWT
- User Login with Bcrypt Verification
- Regional Music Aggregator (Telugu Discovery)
- 320kbps Audio Stream Reachability
- LRCLIB Synced Lyrics Integration
- Unified Multi-Provider Search
- User Library Liked Songs & Persistence
- Custom Playlist Creation & Track Addition
- Ringtone Studio Library Save & Retrieve
- Production Client Bundle Serving & Fallback Routing

---

## 🔑 Environment Variables (Optional)

Create a `.env` file in the project root if you wish to configure optional settings:

```env
PORT=5000
JWT_SECRET=your_custom_jwt_secret_key_here
YOUTUBE_API_KEY=your_optional_youtube_data_api_v3_key
```

*Note: All core features work out of the box without any paid API keys or configuration.*

---

## 📱 Android Installation (PWA)

1. Open **`http://<your-ip-or-domain>:5000`** in **Google Chrome on Android**.
2. Tap the **"Install App"** pill in the top navbar, or tap Chrome's three dots menu (⋮) and select **"Install App"** or **"Add to Home screen"**.
3. Aura Music will be installed as a standalone Android app with the official app icon, full-screen playback, and lock-screen media controls.

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  year?: string;
  duration: number; // in seconds
  artwork: string;
  streamUrl: string;
  stream160?: string;
  stream320?: string;
  downloadUrl?: string;
  language?: string;
  hasLyrics?: boolean;
  provider: 'saavn' | 'audius' | 'youtube' | 'local';
  isDownloadable: boolean;
  isYouTube: boolean;
  youtubeId?: string;
  genre?: string;
  likedAt?: string;
  playedAt?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  artwork: string;
  tracks: Track[];
  createdAt: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  year?: string;
  tracks: Track[];
}

export interface Genre {
  id: string;
  name: string;
  color: string;
  query: string;
}

export interface Language {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  flag: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  bio?: string;
  favoriteLanguages: string[];
  favoriteGenres: string[];
  isGuest?: boolean;
}

export interface RoomParticipant {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  device: string;
}

export interface RoomMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface ListeningRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  isCollaborative: boolean;
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackPosition: number;
  lastUpdated: number;
  queue: Track[];
  participants: RoomParticipant[];
  messages: RoomMessage[];
}

export interface RingtoneItem {
  id: string;
  title: string;
  originalTrack: string;
  startTime: number;
  endTime: number;
  duration: number;
  preset: 'ringtone' | 'notification' | 'alarm' | 'custom';
  audioData?: string;
  size?: string;
  createdAt: string;
}

export interface DownloadedTrack extends Track {
  cachedAt: string;
  fileBlob?: Blob;
  sizeBytes?: number;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface LyricsLine {
  time: number; // in seconds
  text: string;
}

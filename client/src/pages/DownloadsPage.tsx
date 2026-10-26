import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Track } from '../types/music';
import { SongRow } from '../components/common/SongRow';
import {
  Download,
  Trash2,
  HardDrive,
  ShieldCheck,
  CheckCircle,
  Play,
  WifiOff
} from 'lucide-react';

interface DownloadsPageProps {
  onOpenRingtone: (track: Track) => void;
}

export const DownloadsPage: React.FC<DownloadsPageProps> = ({ onOpenRingtone }) => {
  const { downloadedTracks, removeDownload } = useLibrary();
  const { playTrack } = useAudioPlayer();

  const totalBytes = downloadedTracks.reduce((acc, t) => acc + (t.sizeBytes || 4500000), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  const handlePlayAllOffline = () => {
    if (downloadedTracks.length > 0) {
      playTrack(downloadedTracks[0], downloadedTracks);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Downloads Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <WifiOff className="w-4 h-4" />
            <span>Authorized Offline Playback</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Downloaded Music
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Permitted tracks cached locally on your device for uninterrupted offline streaming.
          </p>
        </div>

        {downloadedTracks.length > 0 && (
          <button
            onClick={handlePlayAllOffline}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Play All Offline</span>
          </button>
        )}
      </div>

      {/* Storage Gauge Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Offline Storage Utilized</h4>
            <p className="text-xs text-gray-400">IndexedDB Client Cache: {totalMB} MB across {downloadedTracks.length} tracks</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-400 bg-zinc-950/60 px-4 py-2 rounded-xl border border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>DRM Compliant • Authorized Sources Only</span>
        </div>
      </div>

      {/* Tracklist */}
      {downloadedTracks.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-gray-400 space-y-3">
          <Download className="w-12 h-12 mx-auto opacity-30 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">No Offline Downloads Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Look for songs with the download arrow icon to save them for offline listening.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-2">
          <h3 className="text-base font-bold text-white mb-4">
            Available Offline ({downloadedTracks.length})
          </h3>
          <div className="space-y-1">
            {downloadedTracks.map((track, i) => (
              <div key={track.id} className="relative group">
                <SongRow
                  track={track}
                  index={i}
                  queueContext={downloadedTracks}
                  onOpenRingtone={onOpenRingtone}
                />
                <button
                  onClick={() => removeDownload(track.id)}
                  className="absolute right-14 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove download"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

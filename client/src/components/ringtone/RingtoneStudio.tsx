import React, { useState, useEffect, useRef } from 'react';
import { Track, RingtoneItem } from '../../types/music';
import { trimAudioBuffer, audioBufferToWav } from '../../utils/audioCutter';
import { api } from '../../utils/api';
import {
  Scissors,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Volume2,
  Sliders,
  Check,
  FileAudio,
  Trash2,
  AlertCircle,
  HelpCircle,
  Upload
} from 'lucide-react';

interface RingtoneStudioProps {
  initialTrack?: Track | null;
}

export const RingtoneStudio: React.FC<RingtoneStudioProps> = ({ initialTrack }) => {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(initialTrack || null);
  const [openTracks, setOpenTracks] = useState<Track[]>([]);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(30);
  const [totalDuration, setTotalDuration] = useState<number>(30);
  const [fadeIn, setFadeIn] = useState<number>(1.0);
  const [fadeOut, setFadeOut] = useState<number>(1.5);
  const [volumeBoost, setVolumeBoost] = useState<number>(1.0);
  const [preset, setPreset] = useState<'ringtone' | 'notification' | 'alarm' | 'custom'>('ringtone');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [ringtoneTitle, setRingtoneTitle] = useState<string>('');
  const [savedRingtones, setSavedRingtones] = useState<RingtoneItem[]>([]);
  const [showAndroidGuide, setShowAndroidGuide] = useState<boolean>(false);

  const previewSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load open licensed tracks for quick selection & load saved ringtones
  useEffect(() => {
    api.getOpenLicensedTrending().then(setOpenTracks);
    api.getRingtones().then(setSavedRingtones);

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtxRef.current = new AudioCtx();

    return () => {
      if (previewSourceRef.current) previewSourceRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  // When selected track changes, fetch its audio buffer
  useEffect(() => {
    if (!selectedTrack) return;
    loadAudioFromUrl(selectedTrack.downloadUrl || selectedTrack.stream320 || selectedTrack.streamUrl, selectedTrack.title);
  }, [selectedTrack?.id]);

  const loadAudioFromUrl = async (url: string, title: string) => {
    if (!url || !audioCtxRef.current) return;
    setIsLoadingAudio(true);
    stopPreview();
    setExportedBlob(null);

    try {
      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      const decoded = await audioCtxRef.current.decodeAudioData(arrayBuffer);

      setAudioBuffer(decoded);
      setTotalDuration(decoded.duration);
      setRingtoneTitle(`${title} - Ringtone`);

      // Apply initial preset bounds
      applyPreset('ringtone', decoded.duration);
    } catch (err) {
      console.error('Failed to decode audio for trimmer:', err);
      alert('Could not decode audio stream. You can upload any local MP3/WAV file to trim.');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !audioCtxRef.current) return;

    setIsLoadingAudio(true);
    stopPreview();
    setExportedBlob(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const decoded = await audioCtxRef.current!.decodeAudioData(arrayBuffer);
        setAudioBuffer(decoded);
        setTotalDuration(decoded.duration);
        const nameClean = file.name.replace(/\.[^/.]+$/, '');
        setRingtoneTitle(`${nameClean} - Ringtone`);
        setSelectedTrack({
          id: 'local_' + Date.now(),
          title: nameClean,
          artist: 'My Audio File',
          album: 'Uploaded Audio',
          duration: Math.round(decoded.duration),
          artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
          streamUrl: '',
          provider: 'local',
          isDownloadable: true,
          isYouTube: false
        });
        applyPreset('ringtone', decoded.duration);
      } catch (err) {
        alert('Could not load uploaded audio file. Supported formats: MP3, WAV, AAC.');
      } finally {
        setIsLoadingAudio(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const applyPreset = (presetType: 'ringtone' | 'notification' | 'alarm' | 'custom', durationLimit: number = totalDuration) => {
    setPreset(presetType);
    let clipLength = 30;
    if (presetType === 'notification') clipLength = 4;
    if (presetType === 'alarm') clipLength = 20;
    if (presetType === 'ringtone') clipLength = 30;

    const start = Math.min(startTime, Math.max(0, durationLimit - clipLength));
    const end = Math.min(durationLimit, start + clipLength);
    setStartTime(start);
    setEndTime(end);
  };

  const togglePreview = () => {
    if (isPreviewPlaying) {
      stopPreview();
    } else {
      startPreview();
    }
  };

  const startPreview = () => {
    if (!audioBuffer || !audioCtxRef.current) return;
    stopPreview();

    try {
      const trimmed = trimAudioBuffer(audioCtxRef.current, audioBuffer, {
        startTime,
        endTime,
        fadeInDuration: fadeIn,
        fadeOutDuration: fadeOut,
        volumeMultiplier: volumeBoost
      });

      const source = audioCtxRef.current.createBufferSource();
      source.buffer = trimmed;
      source.loop = true;
      source.connect(audioCtxRef.current.destination);
      source.start();

      previewSourceRef.current = source;
      setIsPreviewPlaying(true);
    } catch (err) {
      console.error('Preview error:', err);
    }
  };

  const stopPreview = () => {
    if (previewSourceRef.current) {
      try {
        previewSourceRef.current.stop();
      } catch {
        // ignore
      }
      previewSourceRef.current = null;
    }
    setIsPreviewPlaying(false);
  };

  const handleExport = async () => {
    if (!audioBuffer || !audioCtxRef.current) return;
    stopPreview();

    try {
      const trimmed = trimAudioBuffer(audioCtxRef.current, audioBuffer, {
        startTime,
        endTime,
        fadeInDuration: fadeIn,
        fadeOutDuration: fadeOut,
        volumeMultiplier: volumeBoost
      });

      const wavBlob = audioBufferToWav(trimmed);
      setExportedBlob(wavBlob);

      // Save to Ringtone Library
      const saved = await api.saveRingtone({
        title: ringtoneTitle || 'My Ringtone',
        originalTrack: selectedTrack?.title || 'Custom Audio',
        startTime,
        endTime,
        duration: Math.round(endTime - startTime),
        preset,
        size: `${(wavBlob.size / 1024).toFixed(1)} KB`
      });

      setSavedRingtones(prev => [saved, ...prev]);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export audio clip');
    }
  };

  const handleDownloadClip = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'Aura_Ringtone'}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowAndroidGuide(true);
  };

  const handleDeleteSaved = async (id: string) => {
    await api.deleteRingtone(id);
    setSavedRingtones(prev => prev.filter(r => r.id !== id));
  };

  const clipDuration = Math.max(0, endTime - startTime);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Scissors className="w-4 h-4" />
            <span>Built-in Audio Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ringtone & Audio Cutter
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Trim eligible tracks, add fades, boost volume, and create ringtones, alarms, and notifications.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all shadow-sm"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Upload Audio File</span>
          </button>
          <button
            onClick={() => setShowAndroidGuide(!showAndroidGuide)}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 text-xs font-medium transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Android Setup</span>
          </button>
        </div>
      </div>

      {/* Android Ringtone Setup Instructional Modal / Alert */}
      {showAndroidGuide && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/40 text-purple-200 text-xs leading-relaxed animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between font-bold text-white text-sm mb-2">
            <span className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>How to Set as Ringtone on Android</span>
            </span>
            <button onClick={() => setShowAndroidGuide(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-gray-300">
            <li>Click <strong>Export & Download</strong> below to save the created clip to your device.</li>
            <li>On your Android phone, open <strong>Settings</strong> → <strong>Sound & Vibration</strong>.</li>
            <li>Tap <strong>Phone ringtone</strong> (or <strong>Default notification sound</strong>).</li>
            <li>Select <strong>Custom Ringtone</strong> or tap the <strong>+</strong> icon in the top right to choose your downloaded audio file.</li>
          </ol>
        </div>
      )}

      {/* Track Selector Bar (If no audio loaded or to switch) */}
      {!audioBuffer && (
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Select an Eligible Track to Trim</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {openTracks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTrack(t)}
                className="flex items-center space-x-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all"
              >
                <img src={t.artwork} alt={t.title} className="w-10 h-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{t.title}</p>
                  <p className="text-[10px] text-gray-400 truncate">{t.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Trimmer Studio Card */}
      {isLoadingAudio ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3 glass-card rounded-3xl">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-mono">Decoding audio waveforms...</p>
        </div>
      ) : audioBuffer ? (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-8 shadow-2xl">
          {/* Active Audio Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 shrink-0">
                <img src={selectedTrack?.artwork} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <input
                  type="text"
                  value={ringtoneTitle}
                  onChange={(e) => setRingtoneTitle(e.target.value)}
                  className="text-base font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-400">{selectedTrack?.artist} • {totalDuration.toFixed(1)}s Total Duration</p>
              </div>
            </div>

            {/* Preset Selector */}
            <div className="flex items-center space-x-2 bg-zinc-950/60 p-1.5 rounded-2xl border border-white/5">
              {(['ringtone', 'notification', 'alarm', 'custom'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className={`capitalize px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                    preset === p
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Waveform / Trimming Sliders */}
          <div className="space-y-4 bg-zinc-950/70 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span>Start: <strong className="text-cyan-400">{startTime.toFixed(1)}s</strong></span>
              <span className="text-purple-300 font-bold">Clip Duration: {clipDuration.toFixed(1)}s</span>
              <span>End: <strong className="text-cyan-400">{endTime.toFixed(1)}s</strong></span>
            </div>

            {/* Start Time Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                <span>Trim Start Time</span>
                <span>{startTime.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(0, endTime - 1)}
                step={0.1}
                value={startTime}
                onChange={(e) => {
                  stopPreview();
                  setStartTime(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              />
            </div>

            {/* End Time Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                <span>Trim End Time</span>
                <span>{endTime.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min={startTime + 1}
                max={totalDuration}
                step={0.1}
                value={endTime}
                onChange={(e) => {
                  stopPreview();
                  setEndTime(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Audio Effects: Fade-In, Fade-Out, Volume Boost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs text-gray-300 font-medium">
                <span>Fade In</span>
                <span className="font-mono text-purple-400">{fadeIn.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.2}
                value={fadeIn}
                onChange={(e) => {
                  stopPreview();
                  setFadeIn(parseFloat(e.target.value));
                }}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="p-4 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs text-gray-300 font-medium">
                <span>Fade Out</span>
                <span className="font-mono text-purple-400">{fadeOut.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.2}
                value={fadeOut}
                onChange={(e) => {
                  stopPreview();
                  setFadeOut(parseFloat(e.target.value));
                }}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="p-4 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs text-gray-300 font-medium">
                <span>Volume Boost</span>
                <span className="font-mono text-cyan-400">{Math.round(volumeBoost * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={volumeBoost}
                onChange={(e) => {
                  stopPreview();
                  setVolumeBoost(parseFloat(e.target.value));
                }}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Action Row: Preview & Export */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            <button
              onClick={togglePreview}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg ${
                isPreviewPlaying
                  ? 'bg-red-500/80 text-white shadow-red-500/30'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              {isPreviewPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              <span>{isPreviewPlaying ? 'Pause Loop Preview' : 'Preview Selection'}</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-xl shadow-purple-600/40 transition-all active:scale-95"
              >
                <Scissors className="w-4 h-4" />
                <span>Export Ringtone</span>
              </button>

              {exportedBlob && (
                <button
                  onClick={() => handleDownloadClip(exportedBlob, ringtoneTitle)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xl shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .WAV</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Ringtone Library */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <FileAudio className="w-5 h-5 text-purple-400" />
          <span>My Created Ringtones ({savedRingtones.length})</span>
        </h3>

        {savedRingtones.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No ringtones created yet. Select a song above to trim!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {savedRingtones.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 flex items-center justify-between hover:border-purple-500/30 transition-all"
              >
                <div className="min-w-0 pr-3">
                  <p className="text-xs font-bold text-white truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {item.originalTrack} • {item.duration}s • {item.preset}
                  </p>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => handleDeleteSaved(item.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

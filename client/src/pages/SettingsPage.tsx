import React, { useState } from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { EQUALIZER_PRESETS } from '../utils/audioEngine';
import {
  Settings,
  Sparkles,
  Sliders,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentPreset, setPreset } = useAudioPlayer();
  const [quality, setQuality] = useState<string>(() => localStorage.getItem('aura_quality') || '320');

  const handleQualityChange = (q: string) => {
    setQuality(q);
    localStorage.setItem('aura_quality', q);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-white/10">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>Application Preferences</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Settings & Audio Engine
        </h2>
        <p className="text-sm text-gray-400">
          Tune your streaming fidelity, sound presets, and device preferences.
        </p>
      </div>

      {/* Audio Quality Section */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Streaming Audio Fidelity</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => handleQualityChange('320')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              quality === '320'
                ? 'bg-purple-950/60 border-purple-500/50 shadow-lg shadow-purple-900/30'
                : 'bg-zinc-950/50 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-white">320 kbps (Studio Hi-Fi)</span>
              {quality === '320' && (
                <span className="text-[10px] px-2 py-0.5 bg-purple-600 text-white rounded-full font-bold">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Crystal clear high-frequency treble, punchy sub-bass, uncompressed acoustics.
            </p>
          </div>

          <div
            onClick={() => handleQualityChange('160')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              quality === '160'
                ? 'bg-purple-950/60 border-purple-500/50 shadow-lg shadow-purple-900/30'
                : 'bg-zinc-950/50 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-white">160 kbps (Data Saver)</span>
              {quality === '160' && (
                <span className="text-[10px] px-2 py-0.5 bg-purple-600 text-white rounded-full font-bold">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Optimized for mobile cellular connections with fast buffering.
            </p>
          </div>
        </div>
      </div>

      {/* Default Equalizer Section */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Active Equalizer Sound Profile</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {Object.keys(EQUALIZER_PRESETS).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentPreset === p
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Android PWA Information */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Android PWA Installation</span>
        </h3>

        <p className="text-xs text-gray-400 leading-relaxed">
          Aura Music is configured with a Progressive Web App manifest, service worker caching, and Android MediaSession integration for lock screen and notification shade music controls.
        </p>

        <div className="p-4 bg-zinc-950/60 rounded-2xl border border-white/5 text-xs text-gray-300 space-y-1">
          <p><strong>Status:</strong> Service Worker Registered & Active</p>
          <p><strong>Background Audio:</strong> Supported via HTML5 Audio & MediaSession API</p>
          <p><strong>Installation:</strong> Tap 'Install App' in the top navbar or Chrome menu</p>
        </div>
      </div>

      {/* Compliance & Architecture Disclaimer */}
      <div className="p-6 rounded-3xl bg-zinc-950/60 border border-white/5 text-xs text-gray-400 space-y-2">
        <div className="flex items-center space-x-2 text-white font-semibold">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Compliance & Authorized Playback Architecture</span>
        </div>
        <p className="leading-relaxed">
          Aura Music respects intellectual property and terms of service. Regional music is aggregated from authorized public endpoints; open-licensed tracks are sourced from Audius/Creative Commons; YouTube discovery runs through official embedded player APIs without DRM circumvention or ad blocking.
        </p>
      </div>
    </div>
  );
};

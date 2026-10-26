import React from 'react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { FREQUENCIES, EQUALIZER_PRESETS } from '../../utils/audioEngine';
import { X, Sliders, Volume2, RotateCcw } from 'lucide-react';

function formatFreq(freq: number): string {
  if (freq >= 1000) {
    return `${freq / 1000}k`;
  }
  return `${freq}`;
}

export const EqualizerModal: React.FC = () => {
  const {
    isEqualizerOpen,
    setEqualizerOpen,
    currentPreset,
    setPreset,
    customGains,
    setBandGain
  } = useAudioPlayer();

  if (!isEqualizerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f0a1c] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Audio Equalizer & DSP</h3>
              <p className="text-xs text-gray-400">Web Audio API 10-Band Parametric Filter</p>
            </div>
          </div>

          <button
            onClick={() => setEqualizerOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="mt-5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 block">
            Sound Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(EQUALIZER_PRESETS).map((preset) => {
              const isActive = currentPreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => setPreset(preset)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* 10-Band Sliders */}
        <div className="mt-8 bg-zinc-950/60 rounded-2xl p-4 sm:p-6 border border-white/5">
          <div className="grid grid-cols-10 gap-2 sm:gap-3 items-end h-48 sm:h-52">
            {FREQUENCIES.map((freq, i) => {
              const gain = customGains[i] || 0;
              return (
                <div key={freq} className="flex flex-col items-center h-full justify-between">
                  <span className="text-[10px] font-mono text-cyan-400">
                    {gain > 0 ? `+${gain}` : gain}
                  </span>

                  {/* Vertical Slider */}
                  <div className="relative h-32 sm:h-36 flex items-center justify-center">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={gain}
                      onChange={(e) => setBandGain(i, parseInt(e.target.value, 10))}
                      className="h-full w-1.5 appearance-none bg-zinc-800 rounded-full cursor-pointer accent-purple-400 hover:w-2 transition-all focus:outline-none [writing-mode:vertical-lr] [direction:rtl]"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-gray-400 mt-2">
                    {formatFreq(freq)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-3 pt-3 border-t border-white/5">
            <span>Bass (32 Hz)</span>
            <span>Mids (1 kHz)</span>
            <span>Treble (16 kHz)</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPreset('Flat')}
            className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Flat</span>
          </button>

          <button
            onClick={() => setEqualizerOpen(false)}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

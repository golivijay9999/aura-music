// Web Audio API Audio Engine: 10-Band Equalizer & FFT Analyser

export const FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQUALIZER_PRESETS: Record<string, number[]> = {
  'Flat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [8, 7, 5, 2, 0, 0, 0, 1, 2, 3],
  'Vocal Boost': [-2, -2, 0, 3, 6, 6, 4, 2, 0, -2],
  'Treble Boost': [-2, -1, 0, 0, 1, 3, 5, 7, 8, 9],
  'Pop': [-1, 1, 3, 4, 3, 1, -1, 2, 3, 4],
  'Rock': [5, 4, 2, -1, -2, 0, 3, 5, 6, 6],
  'Electronic': [6, 5, 2, 0, -2, 2, 1, 3, 5, 6],
  'Hip-Hop': [7, 6, 4, 1, -1, -1, 1, 2, 3, 4],
  'Classical': [4, 3, 2, 1, -1, -1, 0, 2, 4, 5],
  'Acoustic': [3, 2, 1, 2, 3, 3, 2, 3, 4, 3]
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private isInitialized = false;

  public init(audioElement: HTMLAudioElement) {
    if (this.isInitialized && this.source) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Analyser for real-time visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Master Gain
      this.gainNode = this.ctx.createGain();

      // Setup 10-band Biquad filters
      this.filters = FREQUENCIES.map((freq, i) => {
        const filter = this.ctx!.createBiquadFilter();
        if (i === 0) {
          filter.type = 'lowshelf';
        } else if (i === FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      // Connect HTML5 audio source
      this.source = this.ctx.createMediaElementSource(audioElement);

      // Connect chain: source -> filter[0] -> ... -> filter[9] -> gainNode -> analyser -> destination
      let prevNode: AudioNode = this.source;
      for (const filter of this.filters) {
        prevNode.connect(filter);
        prevNode = filter;
      }

      prevNode.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (err) {
      console.warn('Web Audio API context could not attach to audio element:', err);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setBandGain(bandIndex: number, gainValue: number) {
    if (this.filters[bandIndex]) {
      this.filters[bandIndex].gain.setTargetAtTime(gainValue, this.ctx?.currentTime || 0, 0.05);
    }
  }

  public applyPreset(presetName: string) {
    const gains = EQUALIZER_PRESETS[presetName] || EQUALIZER_PRESETS['Flat'];
    gains.forEach((val, i) => {
      this.setBandGain(i, val);
    });
  }

  public getFrequencyData(array: Uint8Array<ArrayBuffer>) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(array);
    }
  }

  public getWaveformData(array: Uint8Array<ArrayBuffer>) {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(array);
    }
  }
}

export const audioEngine = new AudioEngine();

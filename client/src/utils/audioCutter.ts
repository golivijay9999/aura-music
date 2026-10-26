/**
 * Audio Cutter & Ringtone Creator Studio Utility
 * Web Audio API buffer manipulation & WAV audio encoder
 */

export interface TrimOptions {
  startTime: number;    // in seconds
  endTime: number;      // in seconds
  fadeInDuration?: number;  // in seconds (e.g. 1.5s)
  fadeOutDuration?: number; // in seconds (e.g. 2.0s)
  volumeMultiplier?: number;// e.g. 1.2 (120%)
}

/**
 * Trims an AudioBuffer and applies fades/volume gain
 */
export function trimAudioBuffer(
  audioCtx: AudioContext,
  sourceBuffer: AudioBuffer,
  options: TrimOptions
): AudioBuffer {
  const { startTime, endTime, fadeInDuration = 0, fadeOutDuration = 0, volumeMultiplier = 1.0 } = options;

  const sampleRate = sourceBuffer.sampleRate;
  const startOffset = Math.max(0, Math.floor(startTime * sampleRate));
  const endOffset = Math.min(sourceBuffer.length, Math.floor(endTime * sampleRate));
  const frameCount = Math.max(1, endOffset - startOffset);

  const numberOfChannels = sourceBuffer.numberOfChannels;
  const trimmedBuffer = audioCtx.createBuffer(numberOfChannels, frameCount, sampleRate);

  const fadeInFrames = Math.floor(fadeInDuration * sampleRate);
  const fadeOutFrames = Math.floor(fadeOutDuration * sampleRate);

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const sourceData = sourceBuffer.getChannelData(channel);
    const targetData = trimmedBuffer.getChannelData(channel);

    for (let i = 0; i < frameCount; i++) {
      let sample = sourceData[startOffset + i] * volumeMultiplier;

      // Apply Fade In
      if (fadeInFrames > 0 && i < fadeInFrames) {
        sample *= (i / fadeInFrames);
      }

      // Apply Fade Out
      if (fadeOutFrames > 0 && i > (frameCount - fadeOutFrames)) {
        const remaining = frameCount - i;
        sample *= (remaining / fadeOutFrames);
      }

      targetData[i] = Math.max(-1, Math.min(1, sample));
    }
  }

  return trimmedBuffer;
}

/**
 * Encodes AudioBuffer to 16-bit PCM WAV Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numOfChan * 2; // 16-bit = 2 bytes
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  // RIFF Chunk Descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numOfChan * 2, true); // ByteRate
  view.setUint16(32, numOfChan * 2, true);              // BlockAlign
  view.setUint16(34, 16, true);                         // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Interleave channels & write PCM samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numOfChan; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numOfChan; c++) {
      let sample = Math.max(-1, Math.min(1, channels[c][i]));
      // Convert float [-1, 1] to 16-bit signed integer [-32768, 32767]
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, sample, true);
      offset += 2;
    }
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

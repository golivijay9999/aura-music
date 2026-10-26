import { LyricsLine } from '../types/music';

/**
 * Parses raw LRC string format [mm:ss.xx] into structured LyricsLine[]
 */
export function parseLRC(lrcText: string): LyricsLine[] {
  if (!lrcText) return [];

  const lines = lrcText.split(/\r?\n/);
  const result: LyricsLine[] = [];
  const regex = /\[(\d{2}):(\d{2}(?:\.\d{2,3})?)\](.*)/;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;
      const text = match[3].trim();
      if (text) {
        result.push({ time, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

/**
 * Finds the index of the current active line for the given timestamp
 */
export function getCurrentLyricIndex(lyrics: LyricsLine[], currentTime: number): number {
  if (lyrics.length === 0) return -1;
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }
  return activeIndex;
}

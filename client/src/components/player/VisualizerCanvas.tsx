import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioEngine';

interface VisualizerCanvasProps {
  mode?: 'bars' | 'wave' | 'circle';
  className?: string;
  isPlaying: boolean;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  mode = 'bars',
  className = '',
  isPlaying
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const bufferLength = 64;
    const freqData = new Uint8Array(bufferLength);
    const waveData = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isPlaying) {
        audioEngine.getFrequencyData(freqData);
        audioEngine.getWaveformData(waveData);
      } else {
        // Idle gentle wave animation
        for (let i = 0; i < bufferLength; i++) {
          freqData[i] = Math.max(0, Math.sin(Date.now() / 600 + i / 5) * 20 + 20);
          waveData[i] = 128 + Math.sin(Date.now() / 800 + i / 6) * 10;
        }
      }

      if (mode === 'bars') {
        const barWidth = (width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (freqData[i] / 255) * (height * 0.9);

          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
          grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.8)');
          grad.addColorStop(1, 'rgba(6, 182, 212, 1)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          x += barWidth + 1;
          if (x > width) break;
        }
      } else if (mode === 'wave') {
        ctx.lineWidth = 3;
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#c084fc');
        grad.addColorStop(0.5, '#8b5cf6');
        grad.addColorStop(1, '#06b6d4');
        ctx.strokeStyle = grad;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#8b5cf6';

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = waveData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else if (mode === 'circle') {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.6;

        ctx.lineWidth = 2.5;
        const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.5);
        grad.addColorStop(0, '#ec4899');
        grad.addColorStop(0.5, '#8b5cf6');
        grad.addColorStop(1, '#06b6d4');
        ctx.strokeStyle = grad;

        ctx.beginPath();
        for (let i = 0; i < bufferLength; i++) {
          const angle = (i / bufferLength) * Math.PI * 2;
          const amp = (freqData[i] / 255) * 35;
          const r = radius + amp;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={90}
      className={`w-full pointer-events-none transition-opacity duration-500 ${className}`}
    />
  );
};

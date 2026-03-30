'use client';

import { useState, useRef, useCallback, useEffect, MutableRefObject } from 'react';
import { WaveformVisualizer } from './WaveformVisualizer';
import { Loader2 } from 'lucide-react';
import { BirdSpecies } from '@/lib/birds';

interface AudioFeatures {
  dominantFrequency: number;
  frequencyRange: [number, number];
  duration: number;
  rhythmPattern: string;
  amplitude: number;
}

export interface DetectedBird {
  bird: BirdSpecies;
  confidence: number;
}

export interface IdentifyResult {
  detectedBirds: DetectedBird[];
}

interface AudioRecorderProps {
  onIdentified: (result: IdentifyResult) => void;
  /** When provided, the ref is populated with a toggle function the R1 PTT button can call */
  toggleRef?: MutableRefObject<(() => void) | null>;
}

export function AudioRecorder({ onIdentified, toggleRef }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimeRef = useRef(0);

  const analyzeAudio = useCallback(async (audioBlob: Blob, duration: number): Promise<AudioFeatures> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioCtx = new AudioContext();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const analyserNode = audioCtx.createAnalyser();
          analyserNode.fftSize = 2048;

          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(analyserNode);

          const freqData = new Uint8Array(analyserNode.frequencyBinCount);
          analyserNode.getByteFrequencyData(freqData);

          let maxAmp = 0;
          let maxIdx = 0;
          let totalAmp = 0;
          let minFreqIdx = freqData.length;
          let maxFreqIdx = 0;

          for (let i = 0; i < freqData.length; i++) {
            if (freqData[i] > maxAmp) {
              maxAmp = freqData[i];
              maxIdx = i;
            }
            if (freqData[i] > 20) {
              minFreqIdx = Math.min(minFreqIdx, i);
              maxFreqIdx = Math.max(maxFreqIdx, i);
            }
            totalAmp += freqData[i];
          }

          const sampleRate = audioCtx.sampleRate;
          const dominantFreq = (maxIdx / freqData.length) * (sampleRate / 2);
          const minFreq = (minFreqIdx / freqData.length) * (sampleRate / 2);
          const maxFreq = (maxFreqIdx / freqData.length) * (sampleRate / 2);
          const avgAmp = totalAmp / freqData.length;

          await audioCtx.close();

          resolve({
            dominantFrequency: Math.round(dominantFreq),
            frequencyRange: [Math.round(minFreq), Math.round(maxFreq)],
            duration,
            rhythmPattern: duration < 1 ? 'short' : duration < 3 ? 'medium' : 'long',
            amplitude: Math.round(avgAmp)
          });
        } catch {
          resolve({
            dominantFrequency: 3000 + Math.random() * 3000,
            frequencyRange: [500, 8000],
            duration,
            rhythmPattern: 'medium',
            amplitude: 64
          });
        }
      };
      reader.readAsArrayBuffer(audioBlob);
    });
  }, []);

  const identifyBirds = useCallback(async (audioBlob: Blob, duration: number) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const features = await analyzeAudio(audioBlob, duration);

      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioFeatures: features })
      });

      if (!res.ok) throw new Error('Identification failed');
      const result: IdentifyResult = await res.json();
      onIdentified(result);
    } catch {
      setError('Failed to identify birds. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeAudio, onIdentified]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const finalDuration = recordingTimeRef.current;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const recorder = mediaRecorderRef.current;
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        identifyBirds(blob, finalDuration);
      };
      recorder.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
    setAnalyser(null);
  }, [identifyBirds]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 2048;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      recordingTimeRef.current = 0;
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
        if (recordingTimeRef.current >= 30 && timerRef.current) {
          stopRecording();
        }
      }, 1000);
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  }, [stopRecording]);

  useEffect(() => {
    // Expose toggle function to the R1 PTT side button
    if (toggleRef) {
      toggleRef.current = () => {
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      };
    }
    return () => {
      if (toggleRef) toggleRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [isRecording, startRecording, stopRecording, toggleRef]);

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-5 py-2 sm:py-4">
      {/* Waveform */}
      <div className="bg-[#1d2021] rounded-xl p-2 sm:p-3 h-14 sm:h-28 w-full border border-[#504945]/50">
        <WaveformVisualizer analyser={analyser} isRecording={isRecording} />
      </div>

      {/* Circular listen button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isAnalyzing}
        className={[
          'relative flex items-center justify-center rounded-full transition-all duration-300 select-none',
          'w-20 h-20 sm:w-28 sm:h-28',
          isRecording
            ? 'border-[3px] border-[#b8bb26] bg-[#1d2021]'
            : 'border-[3px] border-[#504945] bg-[#1d2021] hover:border-[#665c54] active:scale-95',
          isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
        style={isRecording ? { animation: 'r1-pulse 1.5s ease-in-out infinite' } : undefined}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {/* Bird SVG icon */}
        <svg viewBox="0 0 24 24" className={`w-8 h-8 sm:w-11 sm:h-11 transition-colors duration-300 ${isRecording ? 'fill-[#fabd2f]' : 'fill-[#a89984]'}`} xmlns="http://www.w3.org/2000/svg">
          <path d="M23 2a1 1 0 0 0-1.4-.92l-4.08 1.63A5 5 0 0 0 14 2H9a7 7 0 0 0-7 7v1a3 3 0 0 0 3 3h1v3a3 3 0 0 0 3 3h2l2 3h2l-1-3h2a5 5 0 0 0 4.9-4H21a2 2 0 0 0 2-2V2z" />
        </svg>
      </button>

      {/* Status text */}
      <div className="text-center space-y-0.5">
        <p className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${isRecording ? 'text-[#ebdbb2]' : 'text-[#928374]'}`}>
          {isRecording ? `Listening… ${recordingTime}s` : 'Tap to listen'}
        </p>
        <p className="text-[#665c54] text-xs sm:text-sm">
          {isRecording ? 'Tap again or press PTT to identify' : 'Or press the side (PTT) button'}
        </p>
      </div>

      {/* Analyzing state */}
      {isAnalyzing && (
        <div className="flex items-center gap-2 text-[#fabd2f] animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-medium text-sm">Analyzing audio…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[#fb4934] text-xs sm:text-sm text-center bg-[#fb4934]/10 rounded-lg px-3 py-2 border border-[#fb4934]/30">{error}</p>
      )}
    </div>
  );
}

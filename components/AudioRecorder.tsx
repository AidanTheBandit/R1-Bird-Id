'use client';

import { useState, useRef, useCallback, useEffect, MutableRefObject } from 'react';
import { Button } from '@/components/ui/button';
import { WaveformVisualizer } from './WaveformVisualizer';
import { Mic, MicOff, Upload, X, Loader2 } from 'lucide-react';
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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
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
      setError('Microphone access denied. Please allow microphone access or upload a file.');
    }
  }, [stopRecording]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    identifyBirds(file, 5);
  }, [identifyBirds]);

  const clearAudio = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [audioUrl]);

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
    <div className="space-y-2 sm:space-y-4">
      {/* Waveform — shorter on R1 to save vertical space */}
      <div className="bg-[#1d2021] rounded-xl p-2 sm:p-3 h-16 sm:h-32 border border-[#504945]/50">
        <WaveformVisualizer analyser={analyser} isRecording={isRecording} />
      </div>

      {/* Controls — compact on R1 */}
      <div className="flex flex-row gap-2 items-center justify-center sm:flex-row sm:gap-3">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-[#b8bb26] hover:bg-[#98971a] text-[#282828] gap-1 sm:gap-2 h-9 sm:h-12 px-4 sm:px-8 text-sm sm:text-base font-semibold rounded-full flex-1 sm:flex-none"
            disabled={isAnalyzing}
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Start Recording</span>
            <span className="sm:hidden">Record</span>
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            className="bg-[#fb4934] hover:bg-[#cc241d] text-[#fbf1c7] gap-1 sm:gap-2 h-9 sm:h-12 px-4 sm:px-8 text-sm sm:text-base font-semibold rounded-full flex-1 sm:flex-none animate-pulse"
          >
            <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
            Stop ({recordingTime}s)
          </Button>
        )}

        <div className="relative">
          <Button
            variant="outline"
            className="gap-1 sm:gap-2 h-9 sm:h-12 px-3 sm:px-8 rounded-full border-[#665c54] text-[#bdae93] hover:bg-[#3c3836]/70 hover:text-[#ebdbb2] text-sm"
            disabled={isRecording || isAnalyzing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Upload Audio</span>
            <span className="sm:hidden">Upload</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Audio preview */}
      {audioUrl && (
        <div className="flex items-center gap-2 sm:gap-3 bg-[#3c3836]/50 rounded-lg p-2 sm:p-3 border border-[#504945]/50">
          <audio src={audioUrl} controls className="flex-1 h-7 sm:h-8" />
          <Button variant="ghost" size="icon" onClick={clearAudio} className="text-[#a89984] hover:text-[#fb4934] h-7 w-7 sm:h-9 sm:w-9">
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      )}

      {/* Analyzing state */}
      {isAnalyzing && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-[#fabd2f] animate-pulse">
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          <span className="font-medium text-sm sm:text-base">Analyzing audio…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[#fb4934] text-sm text-center bg-[#fb4934]/10 rounded-lg p-3 border border-[#fb4934]/30">{error}</p>
      )}
    </div>
  );
}

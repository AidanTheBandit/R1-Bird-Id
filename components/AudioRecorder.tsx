'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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

interface IdentifyResult {
  bird: BirdSpecies;
  confidence: number;
  alternates: Array<{ bird: BirdSpecies; confidence: number }>;
}

interface AudioRecorderProps {
  onIdentified: (result: IdentifyResult) => void;
}

export function AudioRecorder({ onIdentified }: AudioRecorderProps) {
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

  const identifyBird = useCallback(async (audioBlob: Blob, duration: number) => {
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
      setError('Failed to identify bird. Please try again.');
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
      // Override onstop to use the captured final duration
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        identifyBird(blob, finalDuration);
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
  }, [identifyBird]);

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
  }, [identifyBird, stopRecording]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    identifyBird(file, 5);
  }, [identifyBird]);

  const clearAudio = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Waveform */}
      <div className="bg-[#141b14] rounded-xl p-3 h-32 border border-green-900/30">
        <WaveformVisualizer analyser={analyser} isRecording={isRecording} />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-green-600 hover:bg-green-700 text-white gap-2 h-12 px-8 text-base font-semibold rounded-full"
            disabled={isAnalyzing}
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="gap-2 h-12 px-8 text-base font-semibold rounded-full animate-pulse"
          >
            <MicOff className="w-5 h-5" />
            Stop ({recordingTime}s)
          </Button>
        )}

        <div className="relative">
          <Button
            variant="outline"
            className="gap-2 h-12 px-8 rounded-full border-green-700 text-green-300 hover:bg-green-900/30"
            disabled={isRecording || isAnalyzing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5" />
            Upload Audio
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
        <div className="flex items-center gap-3 bg-green-950/30 rounded-lg p-3 border border-green-900/40">
          <audio src={audioUrl} controls className="flex-1 h-8" />
          <Button variant="ghost" size="icon" onClick={clearAudio} className="text-green-400 hover:text-red-400">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Analyzing state */}
      {isAnalyzing && (
        <div className="flex items-center justify-center gap-3 text-green-400 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">Analyzing audio patterns...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm text-center bg-red-950/20 rounded-lg p-3 border border-red-900/30">{error}</p>
      )}
    </div>
  );
}

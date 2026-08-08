import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Square,
  RotateCcw,
  Sparkles,
  Radio,
  Repeat,
  Zap,
  Check,
  Music,
  Clock
} from "lucide-react";

interface WaveformAudioPlayerProps {
  audioUrl?: string;
  title?: string;
  subtitle?: string;
  allowRecording?: boolean;
  onAudioSaved?: (url: string, durationSec: number) => void;
  accentColor?: "primary" | "tertiary" | "rose" | "amber";
  compact?: boolean;
}

export const WaveformAudioPlayer: React.FC<WaveformAudioPlayerProps> = ({
  audioUrl: initialAudioUrl,
  title = "Voice Message",
  subtitle = "Recorded with love",
  allowRecording = false,
  onAudioSaved,
  accentColor = "primary",
  compact = false
}) => {
  // Audio playback state
  const [audioUrl, setAudioUrl] = useState<string | undefined>(initialAudioUrl);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<boolean>(false);

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);

  // Web Audio API refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const liveMicStreamRef = useRef<MediaStream | null>(null);
  const liveMicSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Static waveform peaks for initial rendering / fallback (32 bars)
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>(() => 
    Array.from({ length: 36 }, () => 0.15 + Math.random() * 0.7)
  );

  // Update audioUrl if prop changes
  useEffect(() => {
    if (initialAudioUrl !== audioUrl) {
      setAudioUrl(initialAudioUrl);
      setIsPlaying(false);
      setCurrentTime(0);
      setAudioError(false);
    }
  }, [initialAudioUrl]);

  // Clean up Web Audio Context & Recording Streams on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
      if (liveMicStreamRef.current) {
        liveMicStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Initialize Audio Context & Analyser Node safely
  const initWebAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    // Connect HTML Audio Element to Analyser Node
    if (
      audioRef.current &&
      audioCtxRef.current &&
      analyserRef.current &&
      !mediaSourceRef.current
    ) {
      try {
        const source = audioCtxRef.current.createMediaElementSource(audioRef.current);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioCtxRef.current.destination);
        mediaSourceRef.current = source;
      } catch {
        // Source already connected or cross-origin restraint
      }
    }
  }, []);

  // Draw Waveform onto Canvas with Web Audio API real-time frequency data
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Get live frequency data if playing
    let frequencyData = new Uint8Array(32);
    if (analyserRef.current && isPlaying) {
      frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(frequencyData);
    }

    const barCount = waveformPeaks.length;
    const barWidth = (width / barCount) * 0.65;
    const barGap = (width / barCount) * 0.35;

    const progressRatio = duration > 0 ? currentTime / duration : 0;

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + barGap) + barGap / 2;
      
      // Calculate amplitude height from static peaks or live frequency
      let amplitude = waveformPeaks[i] || 0.3;
      if (isPlaying && frequencyData[i % frequencyData.length] !== undefined) {
        const liveVal = frequencyData[i % frequencyData.length] / 255;
        amplitude = Math.max(amplitude * 0.4, liveVal);
      }

      const barHeight = Math.max(6, amplitude * (height * 0.85));
      const y = (height - barHeight) / 2;

      const isPlayed = i / barCount <= progressRatio;

      // Color scheme based on played state & theme
      if (isPlayed) {
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, "#C97064"); // Warm terracotta
        gradient.addColorStop(1, "#8C3A32");
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = "rgba(140, 58, 50, 0.25)";
      }

      // Draw rounded rectangle bar
      const radius = Math.min(barWidth / 2, 4);
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, radius);
      ctx.fill();
    }

    if (isPlaying || isRecording) {
      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [duration, currentTime, isPlaying, isRecording, waveformPeaks]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Synthetic Fallback Sound Generator via Web Audio API (when no URL or CORS error)
  const playSynthesizedVoiceNote = () => {
    initWebAudio();
    if (!audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(8);

    const now = ctx.currentTime;
    // Play a gentle warm chord sequence
    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.9);

      gain.gain.setValueAtTime(0, now + idx * 0.9);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.9 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.9 + 0.85);

      if (analyserRef.current) {
        osc.connect(gain);
        gain.connect(analyserRef.current);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }

      osc.start(now + idx * 0.9);
      osc.stop(now + idx * 0.9 + 0.9);
    });

    // Simulate progress timer
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.25;
      setCurrentTime(progress);
      if (progress >= 8) {
        clearInterval(interval);
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }, 250);
  };

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    initWebAudio();

    if (!audioUrl) {
      // No URL provided -> synth voice demo
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        playSynthesizedVoiceNote();
      }
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setAudioError(false);
          })
          .catch((err) => {
            console.warn("Audio play error, falling back to synth waveform:", err);
            setAudioError(true);
            playSynthesizedVoiceNote();
          });
      }
    }
  };

  // Canvas Waveform Click / Seek
  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));

    const targetTime = ratio * (duration || 10);
    setCurrentTime(targetTime);

    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = targetTime;
    }
  };

  // Live Voice Recording (Web Audio API + MediaRecorder)
  const startRecording = async () => {
    try {
      initWebAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveMicStreamRef.current = stream;

      // Connect Mic to Web Audio Analyser for Live Waveform Visualization
      if (audioCtxRef.current && analyserRef.current) {
        const micSource = audioCtxRef.current.createMediaStreamSource(stream);
        micSource.connect(analyserRef.current);
        liveMicSourceRef.current = micSource;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setRecordedBlobUrl(url);
        setAudioUrl(url);
        
        // Generate random peaks based on recorded audio length
        const newPeaks = Array.from({ length: 36 }, () => 0.2 + Math.random() * 0.75);
        setWaveformPeaks(newPeaks);

        if (onAudioSaved) {
          onAudioSaved(url, recordingTime);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      recordTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 120) {
            // max 2 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Could not access microphone. Please allow microphone permissions in your browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }

      if (liveMicStreamRef.current) {
        liveMicStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Format Time Helper mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Cycle playback speed
  const handleRateChange = () => {
    const rates = [1.0, 1.25, 1.5, 2.0, 0.8];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  return (
    <div
      className={`w-full bg-gradient-to-br from-white/95 to-primary-container/20 backdrop-blur-xl border border-white rounded-3xl p-4 md:p-6 shadow-xl shadow-primary/5 transition-all relative overflow-hidden ${
        compact ? "max-w-md" : "max-w-xl"
      }`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

      {/* HTML Audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration || 10);
            }
          }}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onError={() => {
            setAudioError(true);
          }}
          loop={isLooping}
        />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            {isRecording ? (
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
            ) : (
              <Radio className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="font-serif-title text-base font-bold text-primary leading-tight">
              {isRecording ? "Recording Voice Note..." : title}
            </h4>
            <p className="text-[11px] text-on-surface-variant font-medium">
              {isRecording ? `Live Recording • ${formatTime(recordingTime)}` : subtitle}
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/60 border border-primary/10 text-[10px] font-bold text-primary">
          <Sparkles className="w-3 h-3" />
          <span>{isPlaying ? "PLAYING" : isRecording ? "RECORDING" : "WEB AUDIO API"}</span>
        </div>
      </div>

      {/* Waveform Canvas Area */}
      <div className="relative w-full h-20 bg-surface-container/50 border border-outline-variant/30 rounded-2xl p-2 mb-4 flex items-center justify-center cursor-pointer group">
        <canvas
          ref={canvasRef}
          width={480}
          height={64}
          onClick={handleWaveformClick}
          className="w-full h-full object-contain"
        />

        {/* Hover Scrub Overlay Hint */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
            Click to Seek Timestamp
          </span>
        </div>
      </div>

      {/* Progress & Time Labels */}
      <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-on-surface-variant mb-4">
        <span>{formatTime(currentTime)}</span>
        <div className="flex items-center gap-1 text-[10px] text-primary">
          <Clock className="w-3 h-3" />
          <span>{formatTime(isRecording ? recordingTime : duration || 12)}</span>
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-primary/10">
        
        {/* Left Side: Recording Trigger (if enabled) */}
        {allowRecording ? (
          <div>
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="px-4 py-2 rounded-full bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md animate-pulse hover:bg-red-600 transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="px-4 py-2 rounded-full bg-primary text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{recordedBlobUrl ? "Re-record Voice" : "Record Mic"}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {/* Speed Rate Button */}
            <button
              onClick={handleRateChange}
              className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-[10px] font-bold text-primary transition-colors cursor-pointer"
              title="Playback Speed"
            >
              {playbackRate}x
            </button>

            {/* Loop Toggle */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isLooping ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container"
              }`}
              title="Toggle Loop"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Center: Play / Pause Big Button */}
        <button
          onClick={handleTogglePlay}
          disabled={isRecording}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Right Side: Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newMute = !isMuted;
              setIsMuted(newMute);
              if (audioRef.current) {
                audioRef.current.muted = newMute;
              }
            }}
            className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-error" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              setIsMuted(val === 0);
              if (audioRef.current) {
                audioRef.current.volume = val;
              }
            }}
            className="w-16 accent-primary cursor-pointer hidden sm:block"
          />
        </div>
      </div>

      {audioError && (
        <p className="text-[10px] text-amber-600 font-medium text-center mt-2">
          ✨ Web Audio API harmonic synth playing waveform note preview.
        </p>
      )}
    </div>
  );
};

import React, { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
import {
  Package,
  Send,
  Mail,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Image as ImageIcon,
  Music,
  Video as VideoIcon,
  Play,
  Pause,
  Gift,
  Mic,
  Pencil,
  MapPin,
  Ticket,
  Newspaper,
  Heart,
} from "lucide-react";

declare const PaystackPop: any;

/* ---------------------------------------------------------
   A Little Box of Goodies — a tiny gifting app.
   Pack a digital care package, pay via Paystack, and hand
   someone a short code so they can open what you tucked inside.
--------------------------------------------------------- */

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Special+Elite&family=Work+Sans:wght@400;500;600;700&family=Caveat:wght@600;700&display=swap');";

const ITEM_TYPES = {
  note: { label: "Note", icon: FileText },
  photo: { label: "Photo", icon: ImageIcon },
  song: { label: "Song", icon: Music },
  video: { label: "Video", icon: VideoIcon },
  gift: { label: "Gift", icon: Gift },
  voice: { label: "Voice", icon: Mic },
  drawing: { label: "Drawing", icon: Pencil },
  location: { label: "Location", icon: MapPin },
  coupon: { label: "Coupon", icon: Ticket },
  news: { label: "News", icon: Newspaper },
};

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

const THEMES = {
  default: {
    name: "Classic Kraft",
    bg: "var(--kraft)",
    box: "var(--kraft)",
    boxDeep: "var(--kraft-deep)",
    accent: "var(--stamp-red)",
    text: "var(--ink)"
  },
  midnight: {
    name: "Midnight Sky",
    bg: "#0f172a",
    box: "#1e293b",
    boxDeep: "#0f172a",
    accent: "#94a3b8",
    text: "#f1f5f9",
    stars: true
  },
  rose: {
    name: "Rose Quartz",
    bg: "#fff1f2",
    box: "#fbafc2",
    boxDeep: "#f43f5e",
    accent: "#fbbf24",
    text: "#881337",
    ribbon: true
  },
  vintage: {
    name: "Vintage Letter",
    bg: "#f5f2e8",
    box: "#e5e0d0",
    boxDeep: "#d5cfb8",
    accent: "#7c2d12",
    text: "#431407",
    waxSeal: true
  }
};

const MOODS = {
  none: { label: "None", url: "" },
  piano: { label: "Soft Piano", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  rain: { label: "Gentle Rain", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  lofi: { label: "Lo-Fi Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
};

const CONFETTI = [
  { left: -46, dx: -60, dy: -78, rot: "120deg", color: "#a3392f", delay: 0.02 },
  { left: -22, dx: -28, dy: -100, rot: "220deg", color: "#33556a", delay: 0.09 },
  { left: 0, dx: 4, dy: -108, rot: "80deg", color: "#f2c869", delay: 0.0 },
  { left: 22, dx: 32, dy: -96, rot: "-70deg", color: "#5c7a4e", delay: 0.11 },
  { left: 46, dx: 58, dy: -70, rot: "-140deg", color: "#a3392f", delay: 0.05 },
  { left: -58, dx: -74, dy: -42, rot: "40deg", color: "#f2c869", delay: 0.14 },
  { left: 58, dx: 74, dy: -38, rot: "-30deg", color: "#33556a", delay: 0.03 },
  { left: -8, dx: -12, dy: -116, rot: "160deg", color: "#5c7a4e", delay: 0.16 },
];

function generateCode(len = 6) {
  let out = "";
  for (let i = 0; i < len; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
}

function generateBarcodeSeed() {
  let out = "";
  for (let i = 0; i < 22; i++) out += Math.floor(Math.random() * 10);
  return out;
}

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function isRestrictedBrowser() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
  return (ua.indexOf("Instagram") > -1) || (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
}

function trunc(s: string, n: number) {
  if (!s) return s;
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function getYouTubeId(url: string) {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function resizeImage(file: File, maxDim = 720, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("bad image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function itemSummary(it: any) {
  if (it.type === "note") return trunc(it.text, 30);
  if (it.type === "photo") return "a photo";
  if (it.type === "song") return it.artist ? `${it.title} — ${it.artist}` : it.title;
  if (it.type === "video") return "a video clip";
  if (it.type === "gift") return it.name;
  if (it.type === "voice") return trunc(it.text, 30) || "a voice note";
  if (it.type === "drawing") return "hand drawing";
  if (it.type === "location") return it.name;
  if (it.type === "coupon") return it.text;
  if (it.type === "news") return it.headline;
  return "";
}

function Barcode({ seed, height = 46 }: { seed: string, height?: number }) {
  const bars = useMemo(() => {
    let rng = hashStr(seed) || 1;
    const next = () => {
      rng = (rng * 1103515245 + 12345) % 2147483647;
      return (rng % 1000) / 1000;
    };
    const arr = [];
    let x = 0;
    while (x < 240) {
      const w = 1 + Math.floor(next() * 3);
      const gap = next() > 0.55;
      arr.push({ x, w, gap });
      x += w + 1;
    }
    return arr;
  }, [seed]);
  return (
    <svg viewBox={`0 0 240 ${height}`} width="100%" height={height} preserveAspectRatio="none">
      {bars.map(
        (b, i) =>
          !b.gap && <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="var(--ink)" />
      )}
    </svg>
  );
}

function getShareUrl(code: string) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("code", code);
    return url.toString();
  } catch (e) {
    return code;
  }
}

function LabelCard({ to, from, itemCount, sealed, seed }: any) {
  return (
    <div className="label-card paper-card">
      <div className="label-header">Digital Care Package</div>
      <div className="label-body">
        <span className="stamp-mark">
          to be delivered
          <br />
          with care and love
        </span>
        <div className="field-row">
          <span className="field-tag">To</span>
          <p className="handwritten-input static">{to || "…"}</p>
        </div>
        <div className="dashed-rule" />
        <div className="field-row">
          <span className="field-tag">From</span>
          <p className="handwritten-input static">{from || "…"}</p>
        </div>
        <div className="perforation" />
        <div className="barcode-wrap">
          <Barcode seed={seed} />
          <p className="barcode-caption">
            {sealed ? "sealed" : `${itemCount} item${itemCount !== 1 ? "s" : ""} tucked in · not yet sealed`}
          </p>
        </div>
      </div>
    </div>
  );
}

function CartThumb({ item }: any) {
  const Icon = (ITEM_TYPES as any)[item.type].icon;
  if ((item.type === "photo" || item.type === "drawing") && item.src) {
    return (
      <div className="cart-thumb">
        <img src={item.src} alt="" />
      </div>
    );
  }
  return (
    <div className="cart-thumb">
      <Icon size={16} strokeWidth={1.6} />
    </div>
  );
}

function DrawingPad({ onChange }: { onChange: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fffdf7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#241f17";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function pos(e: any) {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches && e.touches[0];
    const clientX = t ? t.clientX : e.clientX;
    const clientY = t ? t.clientY : e.clientY;
    return {
      x: ((clientX - rect.left) * canvasRef.current.width) / rect.width,
      y: ((clientY - rect.top) * canvasRef.current.height) / rect.height,
    };
  }

  function start(e: any) {
    e.preventDefault();
    drawing.current = true;
    const { x, y } = pos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }
  function move(e: any) {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = pos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    if (canvasRef.current) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  }
  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fffdf7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    onChange("");
  }

  return (
    <div className="drawing-pad">
      <canvas
        ref={canvasRef}
        width={280}
        height={170}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <button type="button" className="btn-secondary" style={{ marginTop: 10 }} onClick={clear}>
        Clear
      </button>
    </div>
  );
}

function AddItemModal({ type, onAdd, onClose }: any) {
  const cfg = (ITEM_TYPES as any)[type];
  const Icon = cfg.icon;

  const [noteText, setNoteText] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoErr, setPhotoErr] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songLink, setSongLink] = useState("");
  const [songDataUrl, setSongDataUrl] = useState("");
  const [songBusy, setSongBusy] = useState(false);
  const [songErr, setSongErr] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDataUrl, setVideoDataUrl] = useState("");
  const [videoBusy, setVideoBusy] = useState(false);
  const [videoErr, setVideoErr] = useState("");
  const [giftName, setGiftName] = useState("");
  const [giftLink, setGiftLink] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [voiceLink, setVoiceLink] = useState("");
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [drawingData, setDrawingData] = useState("");
  const [locName, setLocName] = useState("");
  const [locLink, setLocLink] = useState("");
  const [couponText, setCouponText] = useState("");
  const [newsHeadline, setNewsHeadline] = useState("");
  const [newsBody, setNewsBody] = useState("");

  async function handleFile(e: any) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoBusy(true);
    setPhotoErr("");
    try {
      const dataUrl = await resizeImage(file);
      setPhotoDataUrl(dataUrl);
    } catch (err) {
      setPhotoErr("Couldn't read that photo — try a different file.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleVideoFile(e: any) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setVideoErr("Video is too large (max 15MB). Try a shorter clip!");
      return;
    }
    setVideoBusy(true);
    setVideoErr("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setVideoDataUrl(ev.target?.result as string);
      setVideoBusy(false);
    };
    reader.onerror = () => {
      setVideoErr("Failed to read video file.");
      setVideoBusy(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleSongFile(e: any) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setSongErr("Audio file is too large (max 10MB).");
      return;
    }
    setSongBusy(true);
    setSongErr("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSongDataUrl(ev.target?.result as string);
      setSongBusy(false);
    };
    reader.onerror = () => {
      setSongErr("Failed to read audio file.");
      setSongBusy(false);
    };
    reader.readAsDataURL(file);
  }

  function canAdd() {
    if (type === "note") return noteText.trim().length > 0;
    if (type === "photo") return Boolean(photoDataUrl || photoUrl.trim());
    if (type === "song") return songTitle.trim().length > 0 && (Boolean(songDataUrl || songLink.trim()));
    if (type === "video") return Boolean(videoDataUrl || videoUrl.trim());
    if (type === "gift") return giftName.trim().length > 0;
    if (type === "voice") return voiceText.trim().length > 0;
    if (type === "drawing") return Boolean(drawingData);
    if (type === "location") return locName.trim().length > 0;
    if (type === "coupon") return couponText.trim().length > 0;
    if (type === "news") return newsHeadline.trim().length > 0;
    return false;
  }

  function handleAdd() {
    if (!canAdd()) return;
    const data: any = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type };
    if (type === "note") data.text = noteText.trim();
    if (type === "photo") data.src = photoDataUrl || photoUrl.trim();
    if (type === "song") {
      data.title = songTitle.trim();
      data.artist = songArtist.trim();
      data.link = songLink.trim();
      data.src = songDataUrl;
    }
    if (type === "video") {
      if (videoDataUrl) {
        data.src = videoDataUrl;
      } else {
        data.url = videoUrl.trim();
      }
    }
    if (type === "gift") {
      data.name = giftName.trim();
      data.link = giftLink.trim();
    }
    if (type === "voice") {
      data.text = voiceText.trim();
      data.link = voiceLink.trim();
      data.audioSrc = voiceBlob;
    }
    if (type === "drawing") data.src = drawingData;
    if (type === "location") {
      data.name = locName.trim();
      data.link = locLink.trim();
    }
    if (type === "coupon") data.text = couponText.trim();
    if (type === "news") {
      data.headline = newsHeadline.trim();
      data.body = newsBody.trim();
    }
    onAdd(data);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceBlob(reader.result as string);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setVoiceRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Could not access microphone.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && voiceRecording) {
      mediaRecorderRef.current.stop();
      setVoiceRecording(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card paper-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <Icon size={18} strokeWidth={1.75} />
          <h3>Add a {cfg.label.toLowerCase()}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {type === "note" && (
          <div className="stacked-form">
            <textarea
              className="note-input"
              rows={5}
              maxLength={1000}
              placeholder="Write a little something…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {type === "photo" && (
          <div className="stacked-form">
            <label className="file-drop">
              {photoBusy ? "Reading photo…" : photoDataUrl ? "Choose a different photo" : "Choose a photo from phone"}
              <input type="file" accept="image/*" capture="environment" onChange={handleFile} hidden />
            </label>
            {photoDataUrl && <img className="photo-preview" src={photoDataUrl} alt="Preview" />}
            {photoErr && <p className="error-text">{photoErr}</p>}
            <p className="or-divider">or paste a link</p>
            <input
              className="text-input"
              placeholder="https://…"
              value={photoUrl}
              onChange={(e) => {
                setPhotoUrl(e.target.value);
                if (e.target.value) setPhotoDataUrl("");
              }}
            />
          </div>
        )}

        {type === "song" && (
          <div className="stacked-form">
            <input className="text-input" placeholder="Song title" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} autoFocus />
            <input className="text-input" placeholder="Artist (optional)" value={songArtist} onChange={(e) => setSongArtist(e.target.value)} />
            <label className="file-drop">
              {songBusy ? "Reading audio…" : songDataUrl ? "Choose a different song" : "Upload an MP3 from phone"}
              <input type="file" accept="audio/*" onChange={handleSongFile} hidden />
            </label>
            {songDataUrl && <p className="mini-caption" style={{ color: 'var(--ok)' }}>✓ Audio loaded</p>}
            {songErr && <p className="error-text">{songErr}</p>}
            <p className="or-divider">or paste a link</p>
            <input className="text-input" placeholder="Link to listen (optional)" value={songLink} onChange={(e) => setSongLink(e.target.value)} />
          </div>
        )}

        {type === "video" && (
          <div className="stacked-form">
            <label className="file-drop">
              {videoBusy ? "Reading video…" : videoDataUrl ? "Choose a different video" : "Choose a video from phone"}
              <input type="file" accept="video/*" capture="environment" onChange={handleVideoFile} hidden />
            </label>
            {videoDataUrl && (
              <video className="photo-preview" src={videoDataUrl} controls />
            )}
            {videoErr && <p className="error-text">{videoErr}</p>}
            <p className="or-divider">or paste a link</p>
            <input
              className="text-input"
              placeholder="https://…"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                if (e.target.value) setVideoDataUrl("");
              }}
            />
          </div>
        )}

        {type === "gift" && (
          <div className="stacked-form">
            <input className="text-input" placeholder="What's the gift?" value={giftName} onChange={(e) => setGiftName(e.target.value)} autoFocus />
            <input className="text-input" placeholder="Link (optional)" value={giftLink} onChange={(e) => setGiftLink(e.target.value)} />
          </div>
        )}

        {type === "voice" && (
          <div className="stacked-form">
            <textarea
              className="note-input"
              rows={4}
              placeholder="What would you say to them?"
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              autoFocus
            />

            <div className="voice-recorder-wrap" style={{ textAlign: 'center', padding: '15px 0', background: 'rgba(0,0,0,0.03)', borderRadius: 8 }}>
              <p className="mini-caption" style={{ marginBottom: 10 }}>Record a voice note</p>
              {!voiceRecording ? (
                <button className="btn-secondary" onClick={startRecording} style={{ borderRadius: '50%', width: 54, height: 54, padding: 0 }}>
                  <Mic size={24} />
                </button>
              ) : (
                <button className="btn-primary" onClick={stopRecording} style={{ borderRadius: '50%', width: 54, height: 54, padding: 0, background: 'var(--stamp-red)', border: 'none', animation: 'pulse 1.5s infinite' }}>
                  <div style={{ width: 14, height: 14, background: '#fff', borderRadius: 2 }} />
                </button>
              )}
              {voiceBlob && !voiceRecording && (
                <div style={{ marginTop: 15 }}>
                  <audio src={voiceBlob} controls style={{ height: 32, maxWidth: '100%' }} />
                  <button className="btn-link" onClick={() => setVoiceBlob(null)} style={{ fontSize: 11, display: 'block', margin: '5px auto 0' }}>Clear recording</button>
                </div>
              )}
            </div>

            <p className="or-divider">or paste a link</p>
            <input className="text-input" placeholder="Link to a recording (optional)" value={voiceLink} onChange={(e) => setVoiceLink(e.target.value)} />
          </div>
        )}

        {type === "drawing" && <DrawingPad onChange={setDrawingData} />}

        {type === "location" && (
          <div className="stacked-form">
            <input className="text-input" placeholder="Where?" value={locName} onChange={(e) => setLocName(e.target.value)} autoFocus />
            <input className="text-input" placeholder="Map link (optional)" value={locLink} onChange={(e) => setLocLink(e.target.value)} />
          </div>
        )}

        {type === "coupon" && (
          <div className="stacked-form">
            <input className="text-input" placeholder="Good for one…" value={couponText} onChange={(e) => setCouponText(e.target.value)} autoFocus />
          </div>
        )}

        {type === "news" && (
          <div className="stacked-form">
            <input className="text-input" placeholder="Headline" value={newsHeadline} onChange={(e) => setNewsHeadline(e.target.value)} autoFocus />
            <textarea className="note-input" rows={3} placeholder="A few lines (optional)" value={newsBody} onChange={(e) => setNewsBody(e.target.value)} />
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleAdd} disabled={!canAdd() || photoBusy}>
            Add to box
          </button>
        </div>
      </div>
    </div>
  );
}

function BoutiqueAudioPlayer({ src, title, artist, onPlay }: any) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      if (onPlay) onPlay();
      audioRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <div className="boutique-player">
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} />
      <div className="vinyl-wrap">
        <div className={`vinyl-small ${playing ? 'spinning' : ''}`} />
      </div>
      <div className="player-info">
        <p className="player-title">{title || "Untitled"}</p>
        <p className="player-artist">{artist || "Unknown Artist"}</p>
        <button className="play-pill" onClick={toggle}>
          {playing ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}

function TuckedItem({ item, index = 0, onMediaPlay }: any) {
  const rot = (hashStr(item.id) % 7) - 3;
  const yOff = (hashStr(item.id + "y") % 13) - 6;
  const delay = Math.min(index, 8) * 70;
  let body = null;

  if (item.type === "note") {
    body = <p className="handwritten-note">{item.text}</p>;
  } else if (item.type === "photo") {
    body = <img className="tucked-photo" src={item.src} alt="Tucked keepsake" />;
  } else if (item.type === "song") {
    body = (
      <BoutiqueAudioPlayer
        src={item.src || item.link}
        title={item.title}
        artist={item.artist}
        onPlay={onMediaPlay}
      />
    );
  } else if (item.type === "video") {
    if (item.src) {
      body = (
        <div className="video-embed ethereal-frame">
          <video src={item.src} controls playsInline style={{ width: '100%', display: 'block' }} onPlay={onMediaPlay} />
        </div>
      );
    } else {
      const ytId = getYouTubeId(item.url);
      body = ytId ? (
        <div className="video-embed ethereal-frame">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title="Tucked video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a className="watch-link" href={item.url} target="_blank" rel="noreferrer" onClick={onMediaPlay}>
          <VideoIcon size={16} /> Watch clip
        </a>
      );
    }
  } else if (item.type === "gift") {
    body = (
      <div className="ephemera-face">
        <span className="ephemera-icon">
          <Gift size={19} strokeWidth={1.5} />
        </span>
        <p className="ephemera-title">{item.name}</p>
        {item.link && (
          <a className="listen-link" href={item.link} target="_blank" rel="noreferrer">
            Open gift <ArrowRight size={11} />
          </a>
        )}
      </div>
    );
  } else if (item.type === "voice") {
    body = (
      <div className="ephemera-face">
        <span className="ephemera-icon">
          <Mic size={19} strokeWidth={1.5} />
        </span>
        {item.text && <p className="handwritten-note">“{item.text}”</p>}
        {item.audioSrc && (
          <BoutiqueAudioPlayer
            src={item.audioSrc || item.link}
            title="Voice Note"
            artist="Recorded with care"
            onPlay={onMediaPlay}
          />
        )}
        {item.link && !item.audioSrc && (
          <a className="listen-link" href={item.link} target="_blank" rel="noreferrer" onClick={onMediaPlay}>
            <Play size={12} /> Play recording
          </a>
        )}
      </div>
    );
  }
else if (item.type === "drawing") {
    body = (
      <>
        <img className="tucked-photo" src={item.src} alt="A hand drawing" />
        <p className="polaroid-caption">✎ hand drawn</p>
      </>
    );
  } else if (item.type === "location") {
    body = (
      <div className="map-face">
        <div className="map-doodle">
          <MapPin size={20} />
        </div>
        <p className="ephemera-title">{item.name}</p>
        {item.link && (
          <a className="listen-link" href={item.link} target="_blank" rel="noreferrer">
            Open map <ArrowRight size={11} />
          </a>
        )}
      </div>
    );
  } else if (item.type === "coupon") {
    body = (
      <div className="coupon-face">
        <Ticket size={17} strokeWidth={1.6} className="coupon-icon" />
        <p className="coupon-label">good for</p>
        <p className="coupon-text">{item.text}</p>
      </div>
    );
  } else if (item.type === "news") {
    body = (
      <div className="news-face">
        <div className="news-head">
          <Newspaper size={13} strokeWidth={1.6} />
          <span>dispatch</span>
        </div>
        <p className="news-headline">{item.headline}</p>
        {item.body && <p className="news-body">{item.body}</p>}
      </div>
    );
  }
  return (
    <div className="tucked-card" style={{ "--r": `${rot}deg`, "--y": `${yOff}px`, animationDelay: `${delay}ms` } as any}>
      <span className="washi" />
      {body}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [theme, setTheme] = useState("default");
  const [mood, setMood] = useState("none");
  const [customMoodSrc, setCustomMoodSrc] = useState<string | null>(null);
  const [customMoodName, setCustomMoodName] = useState<string | null>(null);
  const [moodBusy, setMoodBusy] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sealError, setSealError] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [barcodeSeed, setBarcodeSeed] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [isSettingSecret, setIsSettingSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [enterCode, setEnterCode] = useState("");
  const [enterSecret, setEnterSecret] = useState("");
  const [openLoading, setOpenLoading] = useState(false);
  const [openError, setOpenError] = useState("");
  const [openedPackage, setOpenedPackage] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [needsSecret, setNeedsSecret] = useState(false);
  const [unlockTime, setUnlockTime] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState("classic");
  const [lidUp, setLidUp] = useState(false);
  const [isUntying, setIsUntying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [reactionText, setReactionText] = useState("");
  const [sendingReaction, setSendingReaction] = useState(false);
  const [showShareSuccess, setShowShareLoveSuccess] = useState(false);
  const [inRestrictedBrowser, setInRestrictedBrowser] = useState(false);

  useEffect(() => {
    if (isRestrictedBrowser()) {
      setInRestrictedBrowser(true);
      // Attempt auto-breakout for Android
      if (/Android/i.test(navigator.userAgent)) {
        const currentUrl = window.location.href.replace(/^https?:\/\//, "");
        window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      }
    }
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (!linkCopied) return;
    const t = setTimeout(() => setLinkCopied(false), 1600);
    return () => clearTimeout(t);
  }, [linkCopied]);

  const canCheckout = to.trim().length > 0 && from.trim().length > 0 && items.length > 0;

  function resetAll() {
    setTo("");
    setFrom("");
    setItems([]);
    setTheme("default");
    setMood("none");
    setCustomMoodSrc(null);
    setCustomMoodName(null);
    setUnlockDate("");
    setActiveForm(null);
    setPreviewOpen(false);
    setSealError("");
    setShareCode("");
    setSecretWord("");
    setIsSettingSecret(false);
    setCopied(false);
    setLinkCopied(false);
    setEnterCode("");
    setEnterSecret("");
    setOpenError("");
    setOpenedPackage(null);
    setIsLocked(false);
    setNeedsSecret(false);
    setLidUp(false);
    setIsUntying(false);
    setIsAudioPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setScreen("home");
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("code")) {
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.toString());
      }
    } catch (e) {}
  }

  function addItem(data: any) {
    setItems((prev) => [...prev, data]);
    setActiveForm(null);
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function handleMoodFile(e: any) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Audio file too large (max 10MB).");
      return;
    }
    setMoodBusy(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomMoodSrc(ev.target?.result as string);
      setCustomMoodName(file.name);
      setMood("custom");
      setMoodBusy(false);
    };
    reader.readAsDataURL(file);
  }

  async function handlePay() {
    if (!canCheckout) return;
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      alert("Paystack key is missing!");
      return;
    }
    if (typeof PaystackPop === 'undefined') {
      setSealError("Paystack library not loaded. Please check your internet or refresh.");
      return;
    }
    setPaying(true);
    setSealError("");
    try {
      const handler = PaystackPop.setup({
        key: paystackKey,
        email: "care@alittleboxofgoodies.io",
        amount: 5000,
        currency: "KES",
        callback: (response: any) => {
          setVerifying(true);
          const verifyPayment = async () => {
            try {
              const verifyResp = await fetch(`/api/paystack/verify/${response.reference}`);

              if (!verifyResp.ok) {
                const errorText = await verifyResp.text();
                throw new Error(`Server error (${verifyResp.status}): ${errorText.slice(0, 50)}`);
              }

              const verifyData = await verifyResp.json();
              if (verifyData.status !== true || verifyData.data.status !== "success") {
                setSealError("Payment verification failed. Please contact support.");
                setVerifying(false);
                setPaying(false);
                return;
              }
              const code = generateCode();
              const seed = generateBarcodeSeed();
              const payload = { to: to.trim(), from: from.trim(), items, theme, mood, customMoodSrc, sealedAt: Date.now(), unlockAt: unlockDate ? new Date(unlockDate).getTime() : null, secretWord: secretWord.trim().toLowerCase(), reference: response.reference };
              const { error } = await supabase.from('boxes').insert([{ code, data: payload }]);
              if (error) {
                console.error("Supabase Save Error:", error);
                setSealError("Payment verified, but failed to save package. Reference: " + response.reference);
                setVerifying(false);
                setPaying(false);
                return;
              }
              setShareCode(code);
              setBarcodeSeed(seed);
              setScreen("sealed");
              setVerifying(false);
              setPaying(false);
            } catch (err: any) {
              console.error("Verification Error:", err);
              setSealError(`Error: ${err.message || "System error during verification"}`);
              setVerifying(false);
              setPaying(false);
            }
          };
          verifyPayment();
        },
        onClose: () => {
          setPaying(false);
        }
      });
      handler.openIframe();
    } catch (err: any) {
      console.error("Paystack Init Error:", err);
      setSealError("Failed to initialize Paystack: " + (err.message || "Unknown error"));
      setPaying(false);
    }
  }

  async function loadPackage(code: string) {
    if (!code) return;
    setOpenLoading(true);
    setOpenError("");
    try {
      const { data, error } = await supabase.from('boxes').select('data').eq('code', code).single();
      if (error || !data) throw new Error("not found");
      const pkg = data.data;
      if (pkg.unlockAt && pkg.unlockAt > Date.now()) {
        setIsLocked(true);
        setUnlockTime(pkg.unlockAt);
      } else {
        setIsLocked(false);
      }
      if (pkg.secretWord && pkg.secretWord !== enterSecret.trim().toLowerCase()) {
        setNeedsSecret(true);
        setScreen("open");
        setOpenLoading(false);
        return;
      } else {
        setNeedsSecret(false);
      }
      setOpenedPackage(pkg);
      setLidUp(false);
      setScreen("unwrap");
    } catch (err) {
      setOpenError("No package found with that code.");
      setScreen("open");
    } finally {
      setOpenLoading(false);
    }
  }

  async function handleOpen() {
    const code = enterCode.trim().toUpperCase();
    if (!code) return;
    await loadPackage(code);
  }

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get("code");

      if (codeFromUrl) {
        const code = codeFromUrl.trim().toUpperCase();
        setEnterCode(code);
        loadPackage(code);
      } else {
        // Legacy Link Parsing (e.g. /path/CODE.html)
        const path = window.location.pathname;
        const match = path.match(/\/([A-Za-z0-9_-]+)\.html$/);
        if (match && match[1]) {
          const code = match[1].trim().toUpperCase();
          setEnterCode(code);
          loadPackage(code);
        }
      }
    } catch (e) {}
  }, []);

  function liftLid() {
    if (lidUp || isUntying) return;
    setIsUntying(true);
    let audioUrl = null;
    if (openedPackage?.mood === 'custom' && openedPackage.customMoodSrc) {
      audioUrl = openedPackage.customMoodSrc;
    } else if (openedPackage?.mood && openedPackage.mood !== 'none') {
      audioUrl = (MOODS as any)[openedPackage.mood].url;
    }
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.play().then(() => setIsAudioPlaying(true)).catch(e => console.error("Audio Play Error:", e));
      audioRef.current = audio;
    }
    setTimeout(() => {
      setLidUp(true);
      setTimeout(() => setScreen("view"), 650);
    }, 600);
  }

  function toggleAudio() {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error(e));
      setIsAudioPlaying(true);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
    } catch (err) {}
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getShareUrl(shareCode));
      setLinkCopied(true);
    } catch (err) {}
  }

  async function updateSecretWord() {
    if (!secretWord.trim() || !shareCode) return;
    setIsSettingSecret(true);
    try {
      const { data, error: fetchError } = await supabase.from('boxes').select('data').eq('code', shareCode).single();
      if (fetchError || !data) throw new Error("Fetch failed");
      const newData = { ...data.data, secretWord: secretWord.trim().toLowerCase() };
      const { error } = await supabase.from('boxes').update({ data: newData }).eq('code', shareCode);
      if (error) throw error;
      alert("Secret word added successfully!");
    } catch (err) {
      console.error("Update Secret Error:", err);
      alert("Failed to update secret word.");
    } finally {
      setIsSettingSecret(false);
    }
  }

  async function sendReaction(type: string, message?: string) {
    if (!shareCode && !enterCode) return;
    const code = shareCode || enterCode;
    try {
      const { data: current, error: fetchError } = await supabase.from('boxes').select('data').eq('code', code).single();
      if (fetchError || !current) throw new Error("Fetch failed");
      const reactions = current.data.reactions || { hearts: 0, messages: [] };
      if (type === 'heart') reactions.hearts += 1;
      if (type === 'message' && message) reactions.messages.push({ text: message, at: Date.now() });
      const newData = { ...current.data, reactions };
      const { error } = await supabase.from('boxes').update({ data: newData }).eq('code', code);
      if (error) throw error;
      alert("Reaction sent!");
    } catch (err) {
      console.error("Reaction Error:", err);
    }
  }

  async function handleSendReaction() {
    if (!reactionText.trim()) return;
    setSendingReaction(true);
    await sendReaction('message', reactionText);
    setReactionText("");
    setSendingReaction(false);
  }

  async function handleShareLove() {
    const url = window.location.origin + "/";
    const text = "Found the most heartfelt way to send digital gifts! 🎁✨ Check out A Little Box of Goodies:";
    if (navigator.share) {
      try {
        await navigator.share({ title: "A Little Box of Goodies", text, url });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShowShareLoveSuccess(true);
        setTimeout(() => setShowShareLoveSuccess(false), 2000);
      } catch (e) {}
    }
  }

  function handleMediaPlay() {
    if (audioRef.current && isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  }

  const currentTheme = (THEMES as any)[openedPackage?.theme || 'default'] || THEMES.default;

  return (
    <div className="app-root" style={{ background: currentTheme.bg, color: currentTheme.text } as any}>
      <style>{`
        ${FONT_IMPORT}
        .app-root {
          --kraft: #c69b6b;
          --kraft-deep: #a97c4e;
          --kraft-shadow: #86602f;
          --paper: #faf6ec;
          --paper-soft: #f1e7d2;
          --ink: #251f17;
          --ink-soft: #6b5f4e;
          --stamp-red: #a3392f;
          --airmail: #33556a;
          --brass: #b9853f;
          --ok: #5c7a4e;
          box-sizing: border-box;
          font-family: 'Work Sans', sans-serif;
          min-height: 100vh;
          width: 100%;
          padding: 40px 18px 70px;
          display: flex;
          justify-content: center;
          transition: background 0.4s ease;
        }
        .app-root *, .app-root *::before, .app-root *::after { box-sizing: border-box; }
        .app-root :focus-visible { outline: 2px solid var(--airmail); outline-offset: 2px; }
        .shell { width: 100%; max-width: 880px; }
        .paper-card { background: var(--paper); border-radius: 4px; box-shadow: 0 2px 0 rgba(0,0,0,0.06), 0 18px 30px -18px rgba(35,25,10,0.55); border: 1px solid rgba(0,0,0,0.06); }
        .paper-soft { background: var(--paper-soft); }
        .eyebrow { font-family: 'Special Elite', monospace; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 10px; }
        .mini-caption { text-align: center; font-family: 'Special Elite', monospace; font-size: 11px; letter-spacing: 0.1em; color: var(--ink-soft); margin: 12px 0 2px; }
        .thin-rule { border-top: 1px dashed rgba(0,0,0,0.28); margin: 10px 0; }
        .double-rule { display: flex; flex-direction: column; gap: 3px; margin: 14px 0; }
        .double-rule span { display: block; height: 1px; background: rgba(0,0,0,0.4); }
        .table-header { display: flex; justify-content: space-between; font-family: 'Special Elite', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-soft); }
        .btn-primary, .btn-secondary, .btn-link, .btn-stamp, .btn-ghost-card { font-weight: 600; font-size: 14.5px; border-radius: 3px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease, opacity 0.12s ease; font-family: 'Work Sans', sans-serif; }
        .btn-primary { background: var(--ink); color: var(--paper); border: none; padding: 13px 22px; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 14px -6px rgba(0,0,0,0.45); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-secondary { background: transparent; color: var(--ink); border: 1.5px solid var(--ink); padding: 11.5px 20px; }
        .btn-secondary:hover { background: rgba(0,0,0,0.05); }
        .btn-link { background: none; border: none; color: var(--ink-soft); text-decoration: underline; text-underline-offset: 3px; padding: 8px 4px; font-size: 13.5px; }
        .icon-btn { background: none; border: none; cursor: pointer; color: var(--ink-soft); padding: 4px; margin-left: auto; display: flex; }
        .btn-stamp { font-family: 'Special Elite', monospace; font-weight: 700; font-size: 14.5px; letter-spacing: 0.02em; background: var(--paper); color: var(--stamp-red); border: 2px solid var(--stamp-red); border-radius: 6px; padding: 14px 20px; }
        .btn-stamp:hover:not(:disabled) { background: rgba(163,57,47,0.07); transform: translateY(-1px); }
        .btn-stamp:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-ghost-card { font-family: 'Special Elite', monospace; font-size: 13.5px; background: var(--paper); color: var(--ink); border: 1.5px solid rgba(0,0,0,0.18); border-radius: 6px; padding: 12.5px 20px; }
        .btn-ghost-card:hover { border-color: var(--airmail); color: var(--airmail); }
        .text-input, .note-input, .handwritten-input, .code-input { width: 100%; font-family: 'Work Sans', sans-serif; font-size: 14.5px; border: 1.5px solid rgba(0,0,0,0.16); border-radius: 3px; padding: 11px 12px; background: #fff; color: var(--ink); }
        .note-input { font-family: 'Caveat', cursive; font-size: 20px; resize: vertical; }
        .stacked-form { display: flex; flex-direction: column; gap: 10px; }
        .home { display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 30px; }
        .brand-mark { width: 52px; height: 52px; border-radius: 50%; background: var(--paper); display: flex; align-items: center; justify-content: center; color: var(--stamp-red); margin-bottom: 18px; box-shadow: 0 6px 16px -8px rgba(0,0,0,0.5); }
        .wordmark { font-family: 'Archivo Black', sans-serif; font-size: clamp(24px, 4.6vw, 34px); letter-spacing: 0.01em; margin: 0 0 8px; }
        .tagline { font-family: 'Special Elite', monospace; font-size: 12.5px; color: var(--ink-soft); margin: 0 0 40px; letter-spacing: 0.04em; }
        .home-choices { display: flex; gap: 18px; flex-wrap: wrap; justify-content: center; }
        .choice-card { width: 230px; padding: 26px 20px; text-align: left; cursor: pointer; border: none; display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
        .choice-card .choice-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--paper-soft); color: var(--airmail); }
        .choice-card h3 { font-family: 'Archivo Black', sans-serif; font-size: 15px; margin: 0; }
        .choice-card p { margin: 0; font-size: 13.5px; color: var(--ink-soft); line-height: 1.4; }
        .top-nav { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; color: var(--paper); }
        .top-nav button { background: rgba(0,0,0,0.18); border: none; color: var(--paper); border-radius: 3px; padding: 7px 12px; font-size: 13px; display: flex; align-items: center; gap: 6px; cursor: pointer; }
        .top-nav button:hover { background: rgba(0,0,0,0.28); }
        .top-nav span { font-family: 'Special Elite', monospace; font-size: 12.5px; letter-spacing: 0.06em; }
        .workbench { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; align-items: start; }
        @media (max-width: 720px) { .workbench { grid-template-columns: 1fr; } }
        .label-card { padding: 0; overflow: hidden; }
        .label-header { background: var(--ink); color: var(--paper); font-family: 'Archivo Black', sans-serif; font-size: 18px; letter-spacing: 0.01em; padding: 16px 20px; }
        .label-body { padding: 20px 22px 22px; position: relative; }
        .field-row { margin-bottom: 14px; }
        .field-tag { display: block; font-family: 'Special Elite', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 6px; }
        .handwritten-input { font-family: 'Caveat', cursive; font-weight: 600; font-size: 24px; border: none; border-bottom: 1.5px dashed rgba(0,0,0,0.3); border-radius: 0; padding: 2px 2px 6px; background: transparent; margin: 0; }
        .handwritten-input.static { border-bottom: none; padding-bottom: 2px; }
        .handwritten-input::placeholder { color: rgba(0,0,0,0.28); }
        .stamp-mark { position: absolute; top: 16px; right: 18px; font-family: 'Caveat', cursive; font-weight: 700; font-size: 15px; line-height: 1.25; text-align: center; color: var(--stamp-red); border: 2px solid var(--stamp-red); border-radius: 8px; padding: 6px 11px; transform: rotate(7deg); opacity: 0.88; }
        .stamp-badge { display: inline-block; font-family: 'Caveat', cursive; font-weight: 700; font-size: 21px; color: var(--stamp-red); border: 2px solid var(--stamp-red); border-radius: 8px; padding: 7px 16px; transform: rotate(-3deg); opacity: 0.9; margin: 8px 0 2px; }
        .dashed-rule { border-top: 1.5px dashed rgba(0,0,0,0.25); margin: 4px 0 16px; }
        .perforation { height: 9px; margin: 4px -22px 0; background-image: radial-gradient(circle, var(--kraft) 3px, transparent 3.4px); background-size: 13px 9px; background-position: center; }
        .barcode-wrap { padding: 16px 0 2px; }
        .barcode-caption { font-family: 'Special Elite', monospace; font-size: 11px; color: var(--ink-soft); letter-spacing: 0.06em; margin-top: 6px; text-align: center; }
        .panel-brand { text-align: center; margin-bottom: 4px; }
        .panel-brand h2 { font-family: 'Archivo Black', sans-serif; font-size: 18px; letter-spacing: 0.01em; margin: 0 0 4px; }
        .panel-brand .sub { font-family: 'Special Elite', monospace; font-size: 11.5px; color: var(--ink-soft); margin: 0; letter-spacing: 0.03em; }
        .catalog-card { padding: 22px; }
        .item-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px 8px; margin: 4px 0 2px; }
        .item-tile { background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 9px; cursor: pointer; padding: 6px; }
        .item-icon-wrap { width: 60px; height: 60px; border-radius: 14px; background: linear-gradient(150deg, #fff, var(--paper-soft)); display: flex; align-items: center; justify-content: center; color: var(--ink-soft); box-shadow: 0 10px 16px -10px rgba(30,20,5,0.5), 0 2px 3px rgba(0,0,0,0.08); transform: rotate(var(--rot, 0deg)); transition: transform 0.15s ease, color 0.15s ease; }
        .item-tile:hover .item-icon-wrap { color: var(--airmail); transform: rotate(var(--rot, 0deg)) translateY(-3px); }
        .item-tile-label { font-family: 'Special Elite', monospace; font-size: 12.5px; letter-spacing: 0.03em; color: var(--ink); }
        .cart-list { margin-bottom: 4px; }
        .cart-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px dashed rgba(0,0,0,0.12); }
        .cart-row:last-child { border-bottom: none; }
        .cart-thumb { width: 38px; height: 38px; border-radius: 6px; background: var(--paper-soft); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; color: var(--ink-soft); }
        .cart-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .cart-info { flex: 1; min-width: 0; }
        .cart-type { font-weight: 700; font-size: 12.5px; letter-spacing: 0.03em; margin: 0; }
        .cart-detail { font-size: 12px; color: var(--ink-soft); margin: 2px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .remove-pill { border: 1.3px solid var(--stamp-red); color: var(--stamp-red); background: none; border-radius: 20px; padding: 6px 13px; font-size: 11px; font-family: 'Special Elite', monospace; letter-spacing: 0.03em; cursor: pointer; flex-shrink: 0; }
        .remove-pill:hover { background: rgba(163,57,47,0.08); }
        .error-text { color: var(--stamp-red); font-size: 13px; margin-top: 8px; text-align: center; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(20,15,8,0.55); backdrop-filter: blur(1px); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 50; }
        .modal-card { width: 100%; max-width: 380px; padding: 20px; }
        .modal-head { display: flex; align-items: center; gap: 9px; margin-bottom: 14px; }
        .modal-head h3 { font-family: 'Archivo Black', sans-serif; font-size: 14px; margin: 0; font-weight: normal; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
        .file-drop { display: flex; align-items: center; justify-content: center; text-align: center; border: 1.5px dashed rgba(0,0,0,0.3); border-radius: 4px; padding: 16px; font-size: 13.5px; cursor: pointer; color: var(--ink-soft); }
        .file-drop:hover { border-color: var(--airmail); color: var(--airmail); }
        .photo-preview { width: 100%; border-radius: 3px; margin-top: 10px; max-height: 180px; object-fit: cover; }
        .or-divider { font-size: 12px; color: var(--ink-soft); text-align: center; margin: 10px 0 2px; }
        .drawing-pad { display: flex; flex-direction: column; align-items: center; }
        .drawing-pad canvas { width: 100%; max-width: 280px; border: 1.5px solid rgba(0,0,0,0.25); border-radius: 4px; touch-action: none; background: #fffdf7; cursor: crosshair; }
        .preview-modal { max-width: 560px; }
        .preview-grid { max-height: 55vh; overflow-y: auto; padding: 4px 2px; }
        .checkout-card { padding: 24px 24px 26px; text-align: center; }
        .thankyou-card { padding: 26px 24px; text-align: center; }
        .thankyou-title { font-family: 'Archivo Black', sans-serif; font-size: 21px; margin: 4px 0 2px; }
        .thankyou-sub { font-family: 'Caveat', cursive; font-weight: 700; font-size: 19px; color: var(--ink-soft); margin: 0 0 22px; }
        .code-display { font-family: 'Special Elite', monospace; font-size: 28px; letter-spacing: 0.14em; background: var(--ink); color: var(--paper); border-radius: 4px; padding: 14px; margin: 0 0 14px; }
        .link-box { font-family: 'Work Sans', sans-serif; font-size: 12px; color: var(--ink-soft); background: #fff; border: 1.5px solid rgba(0,0,0,0.14); border-radius: 4px; padding: 10px 12px; margin: 4px 0 12px; word-break: break-all; text-align: left; }
        .hint { font-size: 12.5px; color: var(--ink-soft); margin-top: 10px; line-height: 1.5; }
        .open-screen, .unwrap-screen { display: flex; justify-content: center; padding-top: 20px; }
        .kiosk-card { width: 100%; max-width: 340px; padding: 30px 26px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .kiosk-card h2 { font-family: 'Archivo Black', sans-serif; font-size: 17px; margin: 10px 0 2px; }
        .code-input { text-align: center; font-family: 'Special Elite', monospace; font-size: 20px; letter-spacing: 0.16em; text-transform: uppercase; margin: 14px 0 12px; }
        .box-stage { width: 100%; max-width: 340px; text-align: center; }
        .unwrap-lead { font-family: 'Work Sans', sans-serif; font-size: 14.5px; color: var(--ink); margin: 0 0 18px; font-weight: 500; }
        .unwrap-lead strong { font-family: 'Caveat', cursive; font-weight: 700; font-size: 19px; color: var(--stamp-red); }
        .box-visual { position: relative; height: 180px; margin-bottom: 22px; }
        .box-glow { position: absolute; left: 50%; top: 56px; width: 10px; height: 10px; transform: translateX(-50%); border-radius: 50%; background: radial-gradient(circle, rgba(255,232,170,0.95), rgba(255,232,170,0) 72%); opacity: 0; transition: opacity 0.5s ease 0.22s, width 0.6s ease 0.22s, height 0.6s ease 0.22s; pointer-events: none; }
        .box-glow.up { opacity: 1; width: 200px; height: 130px; }
        .box-body { position: absolute; inset: 40px 10px 0; background: var(--kraft-deep); border: 2px solid var(--kraft-shadow); border-radius: 3px; box-shadow: 0 16px 24px -14px rgba(20,12,4,0.55), inset 0 10px 16px rgba(0,0,0,0.16); }
        .box-lid { position: absolute; top: 20px; left: 0; right: 0; height: 46px; background: var(--kraft); border: 2px solid var(--kraft-shadow); border-radius: 3px; transform-origin: top center; transition: transform 0.6s cubic-bezier(.32,.9,.4,1.1), opacity 0.6s ease; box-shadow: 0 3px 6px rgba(0,0,0,0.15); }
        .box-lid.up { transform: translateY(-80px) rotateX(82deg); opacity: 0; }
        .box-tape { position: absolute; top: 30px; left: 50%; transform: translateX(-50%); background: var(--paper-soft); font-family: 'Special Elite', monospace; font-size: 10px; letter-spacing: 0.1em; padding: 5px 10px; border: 1px solid rgba(0,0,0,0.15); transition: transform 0.5s ease, opacity 0.5s ease; z-index: 3; box-shadow: 0 2px 4px rgba(0,0,0,0.12); }
        .box-tape.peeled { transform: translate(-50%, -55px) rotate(-20deg); opacity: 0; }
        .confetti-dot { position: absolute; top: 56px; left: 50%; width: 6px; height: 7px; border-radius: 1px; opacity: 0; }
        .confetti-dot.up { animation: confetti-pop 0.85s ease forwards; }
        @keyframes confetti-pop { 0% { opacity: 0; transform: translate(-50%, 0) scale(0.5) rotate(0deg); } 18% { opacity: 1; } 100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), var(--dy)) scale(1) rotate(var(--rot)); } }
        @keyframes box-shake { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(1.5deg); } 75% { transform: rotate(-1.5deg); } }
        .box-shaking { animation: box-shake 0.4s ease-in-out infinite; }
        .ribbon-v, .ribbon-h { position: absolute; background: var(--stamp-red); box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 5; transition: transform 0.6s cubic-bezier(.32,.9,.4,1.1), opacity 0.4s ease; }
        .ribbon-v { left: 50%; top: 0; bottom: 0; width: 24px; transform: translateX(-50%); }
        .ribbon-h { top: 50%; left: 0; right: 0; height: 24px; transform: translateY(-50%); }
        .ribbon-v.untied { transform: translateX(-50%) translateY(-100%) scaleY(0); }
        .ribbon-h.untied { transform: translateY(-50%) translateX(100%) scaleX(0); }
        .view-screen { display: flex; flex-direction: column; align-items: center; gap: 26px; }
        .view-label { position: relative; width: 100%; max-width: 420px; padding: 24px 22px 20px; text-align: center; overflow: hidden; }
        .delivered-stamp { position: absolute; top: 14px; right: 14px; display: inline-flex; align-items: center; gap: 4px; font-family: 'Special Elite', monospace; font-size: 10px; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ok); border: 1.5px solid var(--ok); border-radius: 20px; padding: 4px 10px; transform: rotate(6deg); opacity: 0.85; }
        .view-label .to-line { font-family: 'Caveat', cursive; font-weight: 700; font-size: 28px; margin: 2px 0 0; }
        .view-label .from-line { font-size: 12.5px; color: var(--ink-soft); margin-top: 6px; }
        .tucked-grid { display: flex; flex-wrap: wrap; gap: 26px 22px; justify-content: center; max-width: 780px; padding: 4px 0 8px; }
        .tucked-card { position: relative; background: var(--paper); padding: 14px; width: 210px; box-shadow: 0 10px 20px -10px rgba(0,0,0,0.5); border-radius: 2px; animation: tucked-in 0.5s ease both; }
        @keyframes tucked-in { 0% { opacity: 0; transform: translateY(calc(var(--y, 0px) + 16px)) rotate(var(--r)) scale(0.94); } 100% { opacity: 1; transform: translateY(var(--y, 0px)) rotate(var(--r)) scale(1); } }
        .washi { position: absolute; top: -10px; left: 50%; transform: translateX(-50%) rotate(-3deg); width: 60px; height: 20px; background: rgba(179,58,50,0.35); }
        .handwritten-note { font-family: 'Caveat', cursive; font-weight: 600; font-size: 19px; line-height: 1.35; margin: 6px 2px; white-space: pre-wrap; }
        .polaroid-caption { font-family: 'Caveat', cursive; font-weight: 600; font-size: 15px; color: var(--ink-soft); text-align: center; margin: 8px 0 0; }
        .tucked-photo { width: 100%; display: block; border-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .song-face { display: flex; gap: 12px; align-items: center; padding: 6px 2px; }
        .vinyl { width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0; background: repeating-radial-gradient(circle, #1c1c1c 0, #1c1c1c 2px, #333 3px, #333 4px); border: 2px solid #111; transition: transform 0.4s ease; }
        .tucked-card:hover .vinyl { transform: rotate(24deg); }
        .song-title { font-weight: 600; font-size: 14px; margin: 0; }
        .song-artist { font-size: 12.5px; color: var(--ink-soft); margin: 2px 0 4px; }
        .listen-link { font-size: 12px; color: var(--airmail); display: inline-flex; align-items: center; gap: 4px; }
        .video-embed { border-radius: 2px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .video-embed iframe, .video-embed video { width: 100%; aspect-ratio: 16/9; display: block; border: none; }
        .watch-link { display: flex; align-items: center; gap: 6px; font-size: 13.5px; color: var(--airmail); padding: 10px 2px; }
        .ephemera-face { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; color: var(--ink-soft); padding: 4px 2px; }
        .ephemera-icon { width: 40px; height: 40px; border-radius: 50%; background: var(--paper-soft); display: flex; align-items: center; justify-content: center; color: var(--airmail); flex-shrink: 0; }
        .ephemera-title { font-weight: 600; font-size: 14px; color: var(--ink); margin: 0; }
        .map-face { text-align: center; padding: 4px 2px; }
        .map-doodle { width: 58px; height: 58px; margin: 0 auto 8px; border-radius: 50%; border: 3px solid var(--stamp-red); display: flex; align-items: center; justify-content: center; color: var(--stamp-red); opacity: 0.85; }
        .coupon-face { border: 1.5px dashed rgba(0,0,0,0.3); border-radius: 4px; padding: 14px 10px; text-align: center; }
        .coupon-icon { color: var(--stamp-red); margin-bottom: 2px; }
        .coupon-label { font-family: 'Special Elite', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 4px; }
        .coupon-text { font-weight: 700; font-size: 15px; margin: 0; }
        .news-face { padding: 4px 2px; }
        .news-head { display: flex; align-items: center; gap: 5px; font-family: 'Special Elite', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 8px; }
        .news-headline { font-family: 'Archivo Black', sans-serif; font-size: 13.5px; line-height: 1.3; margin: 0 0 6px; }
        .news-body { font-size: 12.5px; color: var(--ink-soft); line-height: 1.45; margin: 0; }
        .view-footer { text-align: center; margin-top: 4px; }
        .view-footer .thin-rule { max-width: 280px; margin: 0 auto; }
        .boutique-player { display: flex; gap: 14px; align-items: center; padding: 12px; background: rgba(0,0,0,0.03); border-radius: 10px; border: 1px solid rgba(0,0,0,0.08); width: 100%; }
        .vinyl-wrap { width: 44px; height: 44px; position: relative; flex-shrink: 0; }
        .vinyl-small { width: 100%; height: 100%; border-radius: 50%; background: repeating-radial-gradient(circle, #1c1c1c 0, #1c1c1c 2px, #333 3px, #333 4px); border: 2px solid #111; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        .vinyl-small::after { content: ''; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; background: var(--paper-soft); border-radius: 50%; border: 1px solid #111; }
        .spinning { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .player-info { flex: 1; min-width: 0; text-align: left; }
        .player-title { font-weight: 700; font-size: 13px; margin: 0; color: var(--ink); }
        .player-artist { font-size: 11px; color: var(--ink-soft); margin: 1px 0 6px; text-transform: uppercase; letter-spacing: 0.04em; }
        .play-pill { display: inline-flex; align-items: center; gap: 5px; background: var(--ink); color: var(--paper); border: none; border-radius: 20px; padding: 4px 10px; font-size: 10px; font-weight: 700; cursor: pointer; text-transform: uppercase; }
        .video-embed.ethereal-frame { border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px -10px rgba(0,0,0,0.5), 0 0 1px 1px rgba(255,255,255,0.2) inset; border: 1px solid rgba(0,0,0,0.1); }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(163,57,47,0.4); } 70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(163,57,47,0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(163,57,47,0); } }
        @media (prefers-reduced-motion: reduce) { .btn-primary, .btn-stamp, .item-icon-wrap, .box-lid, .box-tape, .box-glow, .confetti-dot, .tucked-card, .vinyl { transition: none !important; animation: none !important; } }
      `}</style>

      <div className="shell">
        {inRestrictedBrowser && (
          <div className="modal-backdrop" style={{ zIndex: 100, backdropFilter: 'blur(10px)' }}>
            <div className="kiosk-card paper-card ethereal-glow animate-gentle-bob" style={{ maxWidth: 360, padding: 40 }}>
              <div className="brand-mark" style={{ margin: '0 auto 20px' }}>
                <Package size={24} strokeWidth={1.75} />
              </div>
              <h2 className="wordmark" style={{ fontSize: 20 }}>Security Shield</h2>
              <p className="hint" style={{ margin: '15px 0', lineHeight: 1.6 }}>
                Instagram's browser is restricted. To ensure your <strong>Payments</strong> and <strong>Voice Notes</strong> work perfectly, please open this in your real browser.
              </p>
              <div className="dashed-rule" />
              <p className="mini-caption" style={{ marginBottom: 20 }}>Tap the three dots (⋮) and select "Open in Browser"</p>
              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  alert("Link copied! Paste it into Chrome, Brave, or Safari.");
                }}
              >
                Copy Link to Browser
              </button>
              <button
                className="btn-link"
                style={{ width: '100%', marginTop: 15, fontSize: 12 }}
                onClick={() => setInRestrictedBrowser(false)}
              >
                I'll take my chances (Continue anyway)
              </button>
            </div>
          </div>
        )}

        {screen !== "home" && (
          <div className="top-nav">
            <button onClick={resetAll}><ArrowLeft size={14} /> Home</button>
            <span>A LITTLE BOX OF GOODIES</span>
          </div>
        )}

        {screen === "home" && (
          <div className="home">
            <div className="brand-mark"><Package size={24} strokeWidth={1.75} /></div>
            <h1 className="wordmark">A Little Box of Goodies</h1>
            <p className="tagline">est. for sending a little care</p>
            <div className="home-choices">
              <button className="choice-card paper-card" onClick={() => setScreen("create")}>
                <span className="choice-icon"><Send size={18} /></span>
                <h3>Pack a package</h3>
                <p>Tuck in a note, a photo, a song, and more — then send it to someone.</p>
              </button>
              <button className="choice-card paper-card" onClick={() => setScreen("open")}>
                <span className="choice-icon"><Mail size={18} /></span>
                <h3>Open a package</h3>
                <p>Got a code from someone? Enter it here to unwrap what they sent.</p>
              </button>
            </div>
            <button className="btn-stamp animate-gentle-bob" style={{ marginTop: 40, gap: 10, background: 'rgba(163,57,47,0.05)' }} onClick={handleShareLove}>
              <Heart size={18} fill={showShareSuccess ? "var(--stamp-red)" : "none"} />
              {showShareSuccess ? "Link Copied!" : "Share the Love with Friends"}
            </button>
          </div>
        )}

        {screen === "create" && (
          <div className="workbench">
            <div className="label-card paper-card">
              <div className="label-header">Digital Care Package</div>
              <div className="label-body">
                <span className="stamp-mark">to be delivered<br />with care and love</span>
                <div className="field-row"><span className="field-tag">To</span><input className="handwritten-input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="cutie" maxLength={40} /></div>
                <div className="dashed-rule" />
                <div className="field-row"><span className="field-tag">Lock until (optional)</span><input type="datetime-local" className="text-input" style={{ background: 'transparent', border: 'none', borderBottom: '1.5px dashed rgba(0,0,0,0.3)', padding: '4px 0', fontSize: 13 }} value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} /></div>
                <div className="field-row"><span className="field-tag">From</span><input className="handwritten-input" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="you" maxLength={40} /></div>
                <div className="perforation" />
                <div className="barcode-wrap"><Barcode seed={to + from + items.length} /><p className="barcode-caption">{items.length} item{items.length !== 1 ? "s" : ""} tucked in · not yet sealed</p></div>
              </div>
            </div>
            <div className="catalog-card paper-card paper-soft">
              <div className="panel-brand"><h2>A Little Box of Goodies</h2><p className="sub">est. for sending a little care</p></div>
              <div style={{ textAlign: "center" }}><span className="stamp-badge">things to tuck inside</span></div>
              <p className="mini-caption">*** select items to tuck ***</p>
              <div className="double-rule"><span /><span /></div>
              <div className="table-header"><span>Item</span><span>Add</span></div>
              <div className="thin-rule" />
              <div className="item-grid">
                {Object.entries(ITEM_TYPES).map(([key, cfg], i) => {
                  const Icon = (cfg as any).icon;
                  const rot = ((i * 7) % 9) - 4;
                  return (
                    <button key={key} className="item-tile" style={{ "--rot": `${rot}deg` } as any} onClick={() => setActiveForm(key)}>
                      <span className="item-icon-wrap"><Icon size={25} strokeWidth={1.4} /></span>
                      <span className="item-tile-label">+ {(cfg as any).label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="thin-rule" />
              <p className="mini-caption">*** select box theme ***</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
                {Object.entries(THEMES).map(([key, t]) => (
                  <button key={key} className={`btn-secondary ${theme === key ? 'paper-soft' : ''}`} style={{ padding: '6px 10px', fontSize: 11, border: theme === key ? '1.5px solid var(--airmail)' : '1.5px solid rgba(0,0,0,0.1)' }} onClick={() => setTheme(key)}>{t.name}</button>
                ))}
              </div>
              <p className="mini-caption" style={{ marginTop: 14 }}>*** select background mood ***</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
                {Object.entries(MOODS).map(([key, m]) => (
                  <button key={key} className={`btn-secondary ${mood === key ? 'paper-soft' : ''}`} style={{ padding: '6px 10px', fontSize: 11, border: theme === key ? '1.5px solid var(--airmail)' : '1.5px solid rgba(0,0,0,0.1)' }} onClick={() => setMood(key)}>{m.label}</button>
                ))}
                <label className={`btn-secondary ${mood === 'custom' ? 'paper-soft' : ''}`} style={{ padding: '6px 10px', fontSize: 11, border: mood === 'custom' ? '1.5px solid var(--airmail)' : '1.5px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}>
                  {moodBusy ? "Reading..." : customMoodName ? trunc(customMoodName, 12) : "+ Custom Song"}
                  <input type="file" accept="audio/*" onChange={handleMoodFile} hidden />
                </label>
              </div>
              {items.length > 0 && (
                <>
                  <div className="thin-rule" /><div className="table-header"><span>In cart</span><span>Qty</span></div><div className="thin-rule" />
                  <div className="cart-list">
                    {items.map((it) => (
                      <div key={it.id} className="cart-row"><CartThumb item={it} /><div className="cart-info"><p className="cart-type">{(ITEM_TYPES as any)[it.type].label.toUpperCase()}</p><p className="cart-detail">{itemSummary(it)}</p></div><button className="remove-pill" onClick={() => removeItem(it.id)}>remove</button></div>
                    ))}
                  </div>
                </>
              )}
              <button className="btn-stamp" style={{ width: "100%", marginTop: 20 }} disabled={!canCheckout} onClick={() => setScreen("checkout")}>Continue to checkout <ArrowRight size={15} /></button>
            </div>
          </div>
        )}

        {activeForm && <AddItemModal type={activeForm} onAdd={addItem} onClose={() => setActiveForm(null)} />}

        {screen === "checkout" && (
          <div className="workbench">
            <LabelCard to={to} from={from} itemCount={items.length} seed={to + from + items.length} />
            <div className="catalog-card paper-card paper-soft checkout-card">
              <button className="btn-link back-edit" onClick={() => setScreen("create")}><ArrowLeft size={13} style={{ marginRight: 4, verticalAlign: -2 }} />edit your box</button>
              <div className="panel-brand"><h2>A Little Box of Goodies</h2><p className="sub">checkout · share your parcel</p></div>
              <div><span className="stamp-badge">send your package</span></div>
              <p className="mini-caption">*** pay via Paystack ***</p>
              <div className="double-rule"><span /><span /></div>
              <button className="btn-stamp" style={{ width: "100%" }} disabled={paying || verifying} onClick={handlePay}>{verifying ? "Verifying Payment..." : paying ? "Processing…" : "Pay & Generate Link"}</button>
              <button className="btn-ghost-card" style={{ width: "100%", marginTop: 10 }} onClick={() => setPreviewOpen(true)}>Preview</button>
              {sealError && <p className="error-text">{sealError}</p>}
              <div className="double-rule" style={{ marginTop: 20 }}><span /><span /></div>
              <Barcode seed={to + from + items.length} /><p className="mini-caption">send it to someone special</p>
            </div>
          </div>
        )}

        {previewOpen && (
          <div className="modal-backdrop" onClick={() => setPreviewOpen(false)}>
            <div className="modal-card paper-card preview-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head"><h3>Preview</h3><button className="icon-btn" onClick={() => setPreviewOpen(false)} aria-label="Close"><X size={16} /></button></div>
              <p className="hint" style={{ marginBottom: 14 }}>This is what {to || "they"} will see when they open it.</p>
              <div className="tucked-grid preview-grid">{items.map((it, idx) => <TuckedItem key={it.id} item={it} index={idx} />)}</div>
            </div>
          </div>
        )}

        {screen === "sealed" && (
          <div className="workbench">
            <LabelCard to={to} from={from} itemCount={items.length} sealed seed={barcodeSeed} />
            <div className="catalog-card paper-card thankyou-card">
              <Barcode seed={barcodeSeed} /><p className="barcode-caption" style={{ marginBottom: 18 }}>{barcodeSeed.replace(/(\d{4})(?=\d)/g, "$1 ")}</p>
              <h2 className="thankyou-title">Thank You For Caring</h2><p className="thankyou-sub">have a nice day :)</p>
              <p className="eyebrow" style={{ textAlign: "center" }}>your link</p>
              <div className="link-box">{getShareUrl(shareCode)}</div>
              <button className="btn-stamp" style={{ width: "100%" }} onClick={copyLink}>{linkCopied ? <>Copied <Check size={14} /></> : <>Copy link <Copy size={14} /></>}</button>
              <div className="thin-rule" style={{ margin: "20px 0" }} />
              <p className="eyebrow" style={{ textAlign: "center" }}>🔒 Secret Word (Premium)</p>
              <p className="hint" style={{ marginTop: 0 }}>Add an extra layer of privacy.</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><input className="text-input" placeholder="Secret word..." value={secretWord} onChange={(e) => setSecretWord(e.target.value)} /><button className="btn-primary" onClick={updateSecretWord} disabled={isSettingSecret || !secretWord.trim()}>{isSettingSecret ? "Saving..." : "Set"}</button></div>
              <div className="thin-rule" style={{ margin: "18px 0 14px" }} />
              <p className="mini-caption" style={{ marginBottom: 8 }}>or share the code instead</p>
              <div className="code-display">{shareCode}</div>
              <button className="btn-secondary" style={{ width: "100%" }} onClick={copyCode}>{copied ? <>Copied <Check size={14} /></> : <>Copy code <Copy size={14} /></>}</button>
              <p className="hint">They can type it in from the home screen — "Open a package."</p>
              <button className="btn-link" onClick={resetAll}>Pack another one</button>
            </div>
          </div>
        )}

        {screen === "open" && (
          <div className="open-screen">
            <div className="kiosk-card paper-card">
              {needsSecret ? (
                <><div className="stamp-badge">Vault Locked</div><p className="hint" style={{ margin: '15px 0' }}>This package is private. Enter the secret word to unwrap.</p><input className="code-input" value={enterSecret} onChange={(e) => setEnterSecret(e.target.value)} placeholder="SECRET WORD" onKeyDown={(e) => e.key === "Enter" && loadPackage(enterCode)} /><button className="btn-primary" onClick={() => loadPackage(enterCode)} disabled={openLoading || !enterSecret.trim()}>{openLoading ? "Verifying..." : "Unlock Vault"}</button><button className="btn-link" style={{ marginTop: 10 }} onClick={() => { setNeedsSecret(false); setEnterSecret(""); }}>Try different code</button></>
              ) : (
                <><Mail size={26} strokeWidth={1.5} color="var(--airmail)" /><h2>Open a package</h2><p className="hint">Enter the code you were given.</p><input className="code-input" value={enterCode} onChange={(e) => setEnterCode(e.target.value.toUpperCase())} placeholder="XXXXXX" maxLength={8} onKeyDown={(e) => e.key === "Enter" && handleOpen()} /><button className="btn-primary" onClick={handleOpen} disabled={openLoading || !enterCode.trim()}>{openLoading ? "Looking…" : <>Open <ArrowRight size={15} /></>}</button></>
              )}
              {openError && <p className="error-text">{openError}</p>}
            </div>
          </div>
        )}

        {screen === "unwrap" && openedPackage && (
          <div className="unwrap-screen">
            <div className="box-stage">
              {isLocked ? (
                <div className="kiosk-card paper-card ethereal-glow"><div className="stamp-badge">Locked Time Capsule</div><p className="hint" style={{ margin: '15px 0' }}>This package from <strong>{openedPackage.from}</strong> is sealed until:</p><div className="code-display" style={{ fontSize: 18 }}>{new Date(unlockTime!).toLocaleString()}</div><p className="hint">Come back then to lift the lid!</p><button className="btn-secondary" style={{ marginTop: 20 }} onClick={resetAll}>Go Back</button></div>
              ) : (
                <>
                  <p className="unwrap-lead">A package from <strong>{openedPackage.from}</strong> has arrived.<br/><span style={{ fontSize: 12, opacity: 0.6 }}>Tap the box to open</span></p>
                  <div className={`box-visual ${!lidUp && !isUntying ? 'box-shaking' : ''}`} onClick={liftLid} style={{ cursor: 'pointer' }}>
                    <div className={`box-glow ${lidUp ? "up" : ""}`} />
                    <div className={`ribbon-v ${isUntying ? 'untied' : ''}`} style={{ background: currentTheme.accent }} />
                    <div className={`ribbon-h ${isUntying ? 'untied' : ''}`} style={{ background: currentTheme.accent }} />
                    {lidUp && CONFETTI.map((c, i) => <span key={i} className="confetti-dot up" style={{ left: `calc(50% + ${c.left}px)`, background: c.color, animationDelay: `${c.delay}s`, "--dx": `${c.dx}px`, "--dy": `${c.dy}px`, "--rot": c.rot } as any} />)}
                    <div className="box-body" style={{ background: currentTheme.boxDeep, borderColor: currentTheme.accent }} />
                    <div className={`box-lid ${lidUp ? "up" : ""}`} style={{ background: currentTheme.box, borderColor: currentTheme.accent }} />
                    {currentTheme.waxSeal ? (
                      <div className={`box-tape ${lidUp || isUntying ? "peeled" : ""}`} style={{ borderRadius: '50%', width: 40, height: 40, background: currentTheme.accent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, zIndex: 10 }}>❦</div>
                    ) : currentTheme.ribbon ? (
                      <div className={`box-tape ${lidUp || isUntying ? "peeled" : ""}`} style={{ width: '100%', height: 10, background: currentTheme.accent, border: 'none', zIndex: 10 }} />
                    ) : (
                      <div className={`box-tape ${lidUp || isUntying ? "peeled" : ""}`} style={{ zIndex: 10 }}>SEALED WITH CARE</div>
                    )}
                    {currentTheme.stars && !lidUp && <div style={{ position: 'absolute', inset: 10, pointerEvents: 'none' }}>{[...Array(6)].map((_, i) => <div key={i} style={{ position: 'absolute', left: `${Math.random() * 80 + 10}%`, top: `${Math.random() * 80 + 10}%`, width: 4, height: 4, background: '#fff', borderRadius: '50%', opacity: 0.6, boxShadow: '0 0 5px #fff' }} />)}</div>}
                  </div>
                  <div style={{ marginTop: 20 }}><button className="btn-primary" onClick={liftLid} disabled={lidUp || isUntying}>{isUntying ? "Unwrapping..." : "Tap to open"}</button></div>
                </>
              )}
            </div>
          </div>
        )}

        {screen === "view" && openedPackage && (
          <div className="view-screen">
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className={`btn-secondary ${viewMode === 'classic' ? 'paper-soft' : ''}`} style={{ padding: '6px 14px', fontSize: 12, opacity: viewMode === 'classic' ? 1 : 0.6 }} onClick={() => setViewMode('classic')}>Classic Scrapbook</button>
                <button className={`btn-secondary ${viewMode === 'constellation' ? 'paper-soft' : ''}`} style={{ padding: '6px 14px', fontSize: 12, opacity: viewMode === 'constellation' ? 1 : 0.6 }} onClick={() => setViewMode('constellation')}>🌌 Constellation View</button>
              </div>
              {audioRef.current && <button className="btn-stamp" style={{ padding: '6px 14px', fontSize: 12, height: 'auto', borderStyle: 'dashed' }} onClick={toggleAudio}>{isAudioPlaying ? <Pause size={14} /> : <Play size={14} />}{isAudioPlaying ? "Pause Music" : "Play Music"}</button>}
            </div>

            {viewMode === "classic" ? (
              <>
                <div className="view-label paper-card">
                  <span className="delivered-stamp"><Check size={12} strokeWidth={3} /> delivered</span>
                  <p className="eyebrow" style={{ textAlign: "center", marginBottom: 2 }}>a package has arrived for</p>
                  <p className="to-line">{openedPackage.to}</p>
                  <p className="from-line">from {openedPackage.from}{openedPackage.sealedAt ? ` · ${new Date(openedPackage.sealedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}` : ""}</p>
                </div>
                <div className="tucked-grid">{openedPackage.items.map((it: any, idx: number) => <TuckedItem key={it.id} item={it} index={idx} onMediaPlay={handleMediaPlay} />)}</div>
              </>
            ) : (
              <div className="constellation-view" style={{ width: '100%', minHeight: '80vh', background: '#020617', borderRadius: 20, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>{[...Array(50)].map((_, i) => <div key={i} className="animate-pulse-slow" style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 2, height: 2, background: '#fff', boxShadow: '0 0 5px #fff', borderRadius: '50%', animationDelay: `${Math.random() * 4}s` } as any} />)}</div>
                <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'center', padding: 40 }}>{openedPackage.items.map((it: any, idx: number) => <div key={it.id} className="animate-gentle-bob" style={{ animationDelay: `${idx * 0.4}s`, transform: `translateZ(${(idx % 3) * 20}px)`, cursor: 'pointer' } as any}><TuckedItem item={it} index={idx} onMediaPlay={handleMediaPlay} /></div>)}</div>
              </div>
            )}
            <div className="view-footer">
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: 12, marginTop: 20, textAlign: 'center' }}>
                <p className="mini-caption" style={{ marginBottom: 10 }}>Send a reaction back</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 15 }}><button className="btn-secondary" style={{ borderRadius: '50%', width: 50, height: 50, padding: 0 }} onClick={() => sendReaction('heart')}>❤️</button></div>
                <div style={{ display: 'flex', gap: 8 }}><input className="text-input" placeholder="Say thank you..." value={reactionText} onChange={(e) => setReactionText(e.target.value)} /><button className="btn-primary" onClick={handleSendReaction} disabled={sendingReaction || !reactionText.trim()}>Send</button></div>
              </div>
              <div className="thin-rule" /><p className="mini-caption" style={{ marginTop: 4 }}>sent with care via a little box of goodies</p>
              <button className="btn-ghost-card" style={{ marginTop: 12 }} onClick={resetAll}>Pack your own <ArrowRight size={14} /></button>
              <button className="btn-link" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '20px auto 0', color: 'var(--stamp-red)' }} onClick={handleShareLove}><Heart size={14} fill={showShareSuccess ? "var(--stamp-red)" : "none"} />{showShareSuccess ? "Link Copied!" : "Share the Love"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

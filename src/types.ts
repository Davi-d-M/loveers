export type MemoryWeatherMode = 
  | "auto"
  | "cherry-blossom"
  | "snowfall"
  | "autumn-leaves"
  | "summer-sunbeams"
  | "gentle-rain"
  | "starfall"
  | "off";

export type GoodyType = 
  | "note" 
  | "photo" 
  | "song" 
  | "video" 
  | "voice" 
  | "drawing" 
  | "location" 
  | "coupon" 
  | "giftCard" 
  | "news";

export interface GoodyItem {
  id: string;
  type: GoodyType;
  title: string;
  content: string; // text content, URL, or audio transcription
  mediaUrl?: string; // photo/video/audio/drawing image URL
  caption?: string;
  year?: number;
  date?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
  artist?: string; // song
  couponCode?: string; // coupon/giftcard
  amount?: string;
  authorName?: string; // for collaborative gifts
  colorAccent?: string;
}

export type GiftTheme = 
  | "ethereal" 
  | "twilight" 
  | "warm-sunset" 
  | "rose-gold" 
  | "celestial" 
  | "cherry-blossom" 
  | "vintage";

export type MusicTrack = 
  | "none" 
  | "piano" 
  | "acoustic" 
  | "ambient-waves" 
  | "celestial-bells" 
  | "lofi-nostalgia";

export interface Reaction {
  id: string;
  emoji: "❤️" | "😭" | "🥹" | "😂" | "😍" | "🎉";
  userName: string;
  timestamp: string;
  message?: string;
}

export interface KeepsakeBox {
  id: string;
  slug: string;
  title: string;
  toName: string;
  fromName: string;
  occasion: string;
  createdAt: string;
  theme: GiftTheme;
  musicTrack: MusicTrack;
  isLocked: boolean;
  locked?: boolean;
  accessCode?: string;
  unlockDate?: string; // ISO date string for Time Capsule
  secretPin?: string;
  passwordPrompt?: string;
  coverImageUrl?: string;
  items: GoodyItem[];
  reactions: Reaction[];
  viewsCount: number;
  openedAt?: string;
  isCollaborative?: boolean;
  isPaid?: boolean;
  paidAt?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  giftTier?: "standard" | "deluxe" | "vip";
  paymentAmount?: number;
  transactionId?: string;
  accessKey?: string;
  dispatchStatus?: "draft" | "pending_payment" | "paid" | "sent_email" | "sent_sms";
}

export type ActiveTab = 
  | "garden" 
  | "constellation" 
  | "story" 
  | "dashboard" 
  | "builder" 
  | "opener";

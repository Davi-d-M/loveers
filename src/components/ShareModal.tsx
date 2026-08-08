import React, { useState } from "react";
import { KeepsakeBox } from "../types";
import { Share2, Copy, Check, QrCode, Eye, Heart, X, MessageSquare, Lock, CreditCard, MessageCircle, Smartphone } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: KeepsakeBox;
  onOpenCheckout?: (box: KeepsakeBox) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, box, onOpenCheckout }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = box.accessKey
    ? `${window.location.origin}/#gift-${box.id}?key=${box.accessKey}`
    : `${window.location.origin}/#gift-${box.id}`;
  const isPaid = box.isPaid || false;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hey ${box.toName}! ❤️ ${box.fromName} sent you a special EverGift digital care package! Open it here: ${shareUrl}`
  )}`;

  const smsUrl = `sms:?body=${encodeURIComponent(
    `Hey ${box.toName}! ❤️ ${box.fromName} sent you a special gift box: ${shareUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl border border-white p-5 sm:p-6 rounded-3xl shadow-2xl text-on-surface my-auto max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-2">
          <Share2 className="w-4 h-4" />
          <span>Share Keepsake Link</span>
        </div>

        <h3 className="font-serif-title text-2xl font-bold text-primary mb-1">
          {box.title}
        </h3>
        
        {/* Status Badge */}
        <div className="mb-4">
          {isPaid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Paid & Active Gift Link</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Checkout & Payment</span>
            </span>
          )}
        </div>

        {/* If unpaid, show payment prompt notice */}
        {!isPaid ? (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-4 space-y-3">
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              ⚠️ Complete checkout to activate this unique gift link so <strong>{box.toName}</strong> can unbox it.
            </p>
            <button
              onClick={() => {
                onClose();
                if (onOpenCheckout) onOpenCheckout(box);
              }}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-primary text-white font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Checkout ($2.99)</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-on-surface-variant mb-4">
            Send this link to {box.toName} via WhatsApp, iMessage, Email, or SMS!
          </p>
        )}

        {/* Link Input & Copy */}
        <div className="flex items-center gap-2 bg-surface-container/60 p-2 rounded-2xl border border-outline-variant/30 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-transparent text-xs text-primary font-mono px-2 focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Direct Social Share Buttons */}
        {isPaid && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C7E] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
            <a
              href={smsUrl}
              className="py-2 px-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>SMS / iMessage</span>
            </a>
          </div>
        )}

        {/* Viewing Insights & Analytics */}
        <div className="bg-primary-container/30 rounded-2xl p-4 border border-primary/10 mb-4">
          <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>Emotional Insights & Analytics</span>
          </h4>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-white/80 p-2.5 rounded-xl border border-white">
              <p className="text-lg font-bold text-primary">{box.viewsCount}</p>
              <p className="text-[10px] text-on-surface-variant">Times Opened</p>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-white">
              <p className="text-lg font-bold text-secondary">{box.reactions.length}</p>
              <p className="text-[10px] text-on-surface-variant">Heart Reactions</p>
            </div>
          </div>
        </div>

        {/* Recipient Reactions List */}
        {box.reactions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>Recipient Reactions</span>
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {box.reactions.map((r) => (
                <div key={r.id} className="bg-white/90 p-2.5 rounded-xl border border-white text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{r.emoji} {r.userName}</span>
                    <span className="text-[9px] text-on-surface-variant">{r.timestamp}</span>
                  </div>
                  {r.message && (
                    <p className="text-[11px] text-on-surface italic mt-1">"{r.message}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

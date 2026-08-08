import React, { useState } from "react";
import { KeepsakeBox } from "../types";
import { ambientAudio } from "../lib/audioEngine";
import confetti from "canvas-confetti";
import { 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Share2, 
  Mail, 
  MessageCircle, 
  PhoneCall, 
  QrCode, 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Gift, 
  ShieldCheck, 
  Smartphone,
  Send
} from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: KeepsakeBox;
  onPaymentSuccess: (paidBox: KeepsakeBox) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  box,
  onPaymentSuccess,
}) => {
  const [selectedTier, setSelectedTier] = useState<"standard" | "deluxe" | "vip">("standard");
  const [recipientEmail, setRecipientEmail] = useState(box.recipientEmail || "");
  const [recipientPhone, setRecipientPhone] = useState(box.recipientPhone || "");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple" | "paypal">("card");

  // Form states
  const [cardNumber, setCardNumber] = useState("4532 8920 1192 8821");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("882");
  const [cardName, setCardName] = useState(box.fromName || "Valued Sender");

  // Processing & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(box.isPaid || false);
  const [transactionId, setTransactionId] = useState(box.transactionId || "");
  const [createdAccessKey, setCreatedAccessKey] = useState(box.accessKey || "");
  const [copiedLink, setCopiedLink] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  if (!isOpen) return null;

  const tierPrices = {
    standard: 2.99,
    deluxe: 4.99,
    vip: 9.99,
  };

  const amountToPay = tierPrices[selectedTier];
  const activeAccessKey = createdAccessKey || box.accessKey || "";
  const shareUrl = activeAccessKey
    ? `${window.location.origin}/#gift-${box.id}?key=${activeAccessKey}`
    : `${window.location.origin}/#gift-${box.id}`;

  const generateSecureAccessKey = (): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
    }
    return `eg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate gateway response
    setTimeout(() => {
      const generatedTxn = `EVERGIFT-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      const newAccessKey = box.accessKey || generateSecureAccessKey();

      const updatedBox: KeepsakeBox = {
        ...box,
        isPaid: true,
        paidAt: new Date().toISOString(),
        recipientEmail,
        recipientPhone,
        giftTier: selectedTier,
        paymentAmount: amountToPay,
        transactionId: generatedTxn,
        accessKey: newAccessKey,
        dispatchStatus: "paid",
      };

      setTransactionId(generatedTxn);
      setCreatedAccessKey(newAccessKey);
      setIsProcessing(false);
      setIsPaidSuccess(true);
      
      // Play chime audio & celebratory confetti
      ambientAudio.playChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onPaymentSuccess(updatedBox);
    }, 1800);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const handleSendSms = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 4000);
  };

  const whatsappUrl = `https://wa.me/${recipientPhone ? recipientPhone.replace(/[^0-9]/g, "") : ""}?text=${encodeURIComponent(
    `Hey ${box.toName}! ❤️ ${box.fromName} created a special EverGift digital care package for you! Open your gift here: ${shareUrl}`
  )}`;

  const smsUrl = `sms:${recipientPhone || ""}?body=${encodeURIComponent(
    `Hey ${box.toName}! ❤️ ${box.fromName} sent you a special gift box: ${shareUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl border border-white p-5 sm:p-8 rounded-3xl shadow-2xl text-on-surface my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isPaidSuccess ? (
          <div>
            {/* Kraft Paper / Digital Care Package Header Banner */}
            <div className="bg-[#e2d1b9] p-5 rounded-2xl border border-[#c4a988] shadow-inner mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                
                {/* Shipping Label Box */}
                <div className="bg-white p-3.5 rounded-xl border-2 border-black shadow-md font-mono text-left relative overflow-hidden">
                  <div className="bg-black text-white font-bold text-[11px] px-2 py-1 uppercase tracking-widest text-center mb-2">
                    DIGITAL CARE PACKAGE
                  </div>
                  
                  {/* Tilted Red Stamp */}
                  <div className="absolute right-2 top-10 border-2 border-red-600 text-red-600 font-bold text-[9px] px-1.5 py-0.5 rounded rotate-[-8deg] opacity-80 uppercase font-serif tracking-tight pointer-events-none">
                    to be delivered with care and love
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-black font-semibold">
                      TO: <span className="bg-gray-100 px-1 py-0.5 rounded text-primary font-bold">{box.toName || "Cutie"}</span>
                    </p>
                    <p className="text-gray-400 text-[9px] border-b border-dashed border-gray-300 pb-1">
                      ------------------------------------
                    </p>
                    <p className="text-black font-semibold">
                      FROM: <span className="bg-gray-100 px-1 py-0.5 rounded text-primary font-bold">{box.fromName || "Toto"}</span>
                    </p>
                  </div>

                  {/* Barcode */}
                  <div className="mt-3 pt-2 border-t border-gray-200 text-center">
                    <div className="h-6 bg-gradient-to-r from-black via-transparent to-black bg-[length:4px_100%] bg-repeat-x opacity-80" />
                    <span className="text-[8px] text-gray-500 font-mono tracking-widest">9405 5118 9956 1891 2345 67</span>
                  </div>
                </div>

                {/* Receipt Title Badge */}
                <div className="bg-[#faf6f0] p-4 rounded-xl border border-[#d2c2ad] text-center font-mono space-y-2 shadow-xs">
                  <h3 className="font-bold text-sm text-black uppercase tracking-wider">
                    A LITTLE BOX OF GOODIES
                  </h3>
                  <p className="text-[10px] text-gray-600 tracking-tight">
                    checkout · share your parcel
                  </p>

                  <div className="inline-block border-2 border-red-700/80 text-red-700 font-bold text-[10px] px-3 py-1 rounded-md rotate-[-3deg] uppercase bg-red-50/50">
                    send your package
                  </div>

                  <p className="text-[9px] font-bold text-gray-700 tracking-widest pt-1">
                    *** PAY · THEN GET YOUR LINK ***
                  </p>
                </div>

              </div>
            </div>

            {/* Gift Package Summary Banner */}
            <div className="bg-primary-container/30 p-4 rounded-2xl border border-primary/10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary">{box.title}</h4>
                  <p className="text-xs text-on-surface-variant">
                    For <strong>{box.toName}</strong> • From <strong>{box.fromName}</strong> ({box.items.length} Memories)
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-primary bg-white px-3 py-1 rounded-full border border-primary/20 shadow-xs">
                ${amountToPay.toFixed(2)}
              </span>
            </div>

            {/* Select Gift Tier */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-2">
                1. Select Package Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTier("standard")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedTier === "standard"
                      ? "bg-primary-container/50 border-primary ring-2 ring-primary/40 shadow-sm"
                      : "bg-surface-container/30 border-outline-variant/30 hover:bg-surface-container/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-primary">Standard</span>
                    <span className="text-xs font-bold text-primary">$2.99</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-tight">
                    Permanent active link, audio music & unboxing experience.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTier("deluxe")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedTier === "deluxe"
                      ? "bg-primary-container/50 border-primary ring-2 ring-primary/40 shadow-sm"
                      : "bg-surface-container/30 border-outline-variant/30 hover:bg-surface-container/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <span>Deluxe</span>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    </span>
                    <span className="text-xs font-bold text-primary">$4.99</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-tight">
                    Standard + Time Capsule lock + AI Assistant + 4K Media.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTier("vip")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedTier === "vip"
                      ? "bg-primary-container/50 border-primary ring-2 ring-primary/40 shadow-sm"
                      : "bg-surface-container/30 border-outline-variant/30 hover:bg-surface-container/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-primary">VIP Vault</span>
                    <span className="text-xs font-bold text-primary">$9.99</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-tight">
                    Deluxe + Instant Email/SMS Dispatch + Printable Gift Card.
                  </p>
                </button>
              </div>
            </div>

            {/* Direct Recipient Delivery Info */}
            <div className="mb-6 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                2. Direct Recipient Contact Details (Optional)
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-primary mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Recipient Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. recipient@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-primary mb-1 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Recipient Phone / WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Form */}
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                3. Payment Details
              </label>

              {/* Express Checkout Options */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    paymentMethod === "card"
                      ? "bg-primary text-white border-primary"
                      : "bg-surface-container/50 text-on-surface-variant border-outline-variant/30"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("apple")}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    paymentMethod === "apple"
                      ? "bg-black text-white border-black"
                      : "bg-surface-container/50 text-on-surface-variant border-outline-variant/30"
                  }`}
                >
                  <span> Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    paymentMethod === "paypal"
                      ? "bg-[#003087] text-white border-[#003087]"
                      : "bg-surface-container/50 text-on-surface-variant border-outline-variant/30"
                  }`}
                >
                  <span className="italic font-bold">PayPal</span>
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-3 bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/30">
                  <div>
                    <label className="block text-[10px] font-semibold text-primary mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-white border border-outline-variant/30 rounded-xl p-2 text-xs text-on-surface focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-primary mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-outline-variant/30 rounded-xl p-2 text-xs font-mono text-on-surface focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-primary mb-1">Expires (MM/YY)</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-outline-variant/30 rounded-xl p-2 text-xs font-mono text-on-surface focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-primary mb-1">CVV / CVC</label>
                      <input
                        type="text"
                        required
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white border border-outline-variant/30 rounded-xl p-2 text-xs font-mono text-on-surface focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Pay Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-primary text-white font-bold text-sm shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Secure Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay ${amountToPay.toFixed(2)} & Activate Gift Link</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-on-surface-variant/70 pt-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Encrypted with 256-bit Stripe security. Instant delivery activation.</span>
              </div>
            </form>
          </div>
        ) : (
          /* Payment Success & Direct Delivery Dispatch Center */
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                Payment Verified & Active
              </span>
              <h2 className="font-serif-title text-2xl md:text-3xl font-bold text-primary mt-2">
                Gift Activated & Ready To Send! 🎉
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Transaction ID: <strong className="font-mono text-primary">{transactionId}</strong>
              </p>
            </div>

            {/* Unique Gift Share Link Box */}
            <div className="bg-surface-container/60 p-3 rounded-2xl border border-outline-variant/30 text-left space-y-2">
              <label className="block text-[11px] font-bold text-primary flex items-center justify-between">
                <span>Unique Encrypted Gift Link</span>
                <span className="text-emerald-600 font-normal">Unlocked & Active ✓</span>
              </label>
              
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-outline-variant/30">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full bg-transparent text-xs text-primary font-mono px-2 focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Send Action Buttons */}
            <div className="space-y-3 text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-primary">
                Direct Delivery Dispatch Options
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp Direct Send */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C7E] font-semibold text-xs flex items-center justify-between hover:bg-[#25D366]/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Send via WhatsApp</span>
                  </div>
                  <Share2 className="w-3.5 h-3.5" />
                </a>

                {/* SMS / iMessage Direct Send */}
                <a
                  href={smsUrl}
                  className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-xs flex items-center justify-between hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>Send via SMS / iMessage</span>
                  </div>
                  <Share2 className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Automated Email Dispatch Button */}
              {recipientEmail && (
                <div className="bg-primary-container/20 p-3.5 rounded-2xl border border-primary/10 flex items-center justify-between">
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-primary flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Automated Email Dispatch</span>
                    </p>
                    <p className="text-[10px] text-on-surface-variant truncate">
                      Deliver directly to {recipientEmail}
                    </p>
                  </div>

                  <button
                    onClick={handleSendEmail}
                    disabled={emailSent}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-all flex items-center gap-1 shrink-0 shadow-sm"
                  >
                    {emailSent ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Email Dispatched!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Email</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Done & Return */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-full bg-surface-container font-semibold text-xs text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Done & Return to Memory Garden
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

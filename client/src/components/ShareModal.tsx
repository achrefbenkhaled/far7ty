import React, { useState } from 'react';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import {
  X,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  MessageCircle,
  Instagram,
  Facebook,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  coverImage?: string;
  invitationUrl?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title = 'Alexandra & Michael Wedding Invitation',
  subtitle = 'You are cordially invited to celebrate our special day with us.',
  coverImage = '/templates/twain-love.png',
  invitationUrl,
}) => {
  const { t, isRtl } = useLanguageTheme();
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Form states - required for support contact
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const baseUrl = invitationUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://invly.app/template/twain-love-wedding');
  const sharedUrl = (() => {
    if (typeof window === 'undefined') return `${baseUrl}?view=shared`;

    const url = new URL(baseUrl, window.location.origin);
    const currentParams = new URLSearchParams(window.location.search);
    const incomingState = currentParams.get('invdata');

    if (incomingState) {
      url.searchParams.set('invdata', incomingState);
    }

    url.searchParams.set('view', 'shared');
    return url.toString();
  })();

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sharedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validateFields = (): boolean => {
    if (!address.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage(t('fill_required_fields') || 'Please fill in your Address, Mobile Phone, and Email to contact Support!');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 4000);
  };

  const handleSocialClick = (platform: 'whatsapp' | 'instagram' | 'facebook', e: React.MouseEvent) => {
    if (!validateFields()) {
      e.preventDefault();
      return;
    }
    setContactSubmitted(true);

    const supportMsg = `Hello Support! I want to create this invitation:\n\n📌 Event: ${title}\n📅 Subtitle: ${subtitle}\n\n📋 My Details:\n- Address: ${address}\n- Phone: ${phone}\n- Email: ${email}\n\n🔗 Generated Link: ${sharedUrl}`;
    const encodedMsg = encodeURIComponent(supportMsg);

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodedMsg}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharedUrl)}&quote=${encodedMsg}`, '_blank');
    } else if (platform === 'instagram') {
      window.open(`https://www.instagram.com/`, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-200">
      <div
        className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border border-rose-500/20 bg-[#0d0914] text-slate-100 shadow-2xl transition-all duration-200 ${
          isRtl ? 'text-right' : 'text-left'
        }`}
      >
        {/* Top Decorative Bar */}
        <div className="h-2 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-10 rounded-full bg-white/10 p-2 text-slate-300 transition hover:bg-white/20 hover:text-white`}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-5 sm:p-7 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Header Title */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-pink-300">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              <span>{t('contact_support_to_create') || 'Send Details to Support'}</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-rose-50">
              {t('send_to_support') || 'Order & Create via Support'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              {t('support_desc') || 'Enter your contact details below and click WhatsApp, Instagram, or Facebook to send your invitation link to Support for activation.'}
            </p>
          </div>

          {/* Warning Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/15 p-3.5 text-xs text-rose-200 animate-pulse">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Contact Information Form */}
          <form onSubmit={handleContactSubmit} className="rounded-2xl border border-rose-500/20 bg-white/5 p-4.5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm sm:text-base font-bold text-rose-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-pink-400" />
                <span>{t('contact_details_label') || 'Your Contact Details (Required)'}</span>
              </h3>
              {contactSubmitted && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Sent to Support!
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-pink-400" />
                  <span>{t('address_label') || 'Address / Event Location'} *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Grand Avenue, City, Country"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className={`w-full rounded-xl border bg-slate-900/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    !address.trim() && errorMessage ? 'border-rose-500 bg-rose-950/20' : 'border-white/10 focus:border-pink-500/60'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-pink-400" />
                  <span>{t('mobile_phone') || 'Mobile Phone / WhatsApp'} *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 234 567 8900"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className={`w-full rounded-xl border bg-slate-900/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    !phone.trim() && errorMessage ? 'border-rose-500 bg-rose-950/20' : 'border-white/10 focus:border-pink-500/60'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-pink-400" />
                  <span>{t('email_label') || 'Email Address'} *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. client@wedding.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className={`w-full rounded-xl border bg-slate-900/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    !email.trim() && errorMessage ? 'border-rose-500 bg-rose-950/20' : 'border-white/10 focus:border-pink-500/60'
                  }`}
                />
              </div>
            </div>
          </form>

          {/* Direct Support Contact Buttons (WhatsApp, Instagram, Facebook) */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-300 mb-2.5">
              📲 {t('contact_supp_via') || 'Click to Send Invitation to Support'}
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={(e) => handleSocialClick('whatsapp', e)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/20 py-3 px-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/30"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleSocialClick('instagram', e)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-pink-500/40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 py-3 px-2 text-xs font-bold text-pink-300 transition hover:bg-pink-500/30"
              >
                <Instagram className="h-4 w-4 text-pink-400" />
                <span>Instagram</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleSocialClick('facebook', e)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-blue-500/40 bg-blue-500/20 py-3 px-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/30"
              >
                <Facebook className="h-4 w-4 text-blue-400" />
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Generated URL Copy Box */}
          <div className="rounded-2xl border border-pink-500/20 bg-white/5 p-4 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              🔗 {t('generated_link') || 'Generated Invitation Link'}
            </span>
            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <input
                type="text"
                readOnly
                value={sharedUrl}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-rose-100 font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-600 px-3.5 py-2 text-xs font-bold text-white transition hover:opacity-90 flex-shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social Media Card Preview */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-300 mb-2">
              📲 {t('social_preview_label') || 'How your invitation looks on WhatsApp & Socials'}
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 shadow-lg">
              <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                <img src={coverImage} alt={title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute top-3 right-3 rounded-full border border-white/20 bg-slate-950/70 backdrop-blur px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-300">
                  💌 Official Invitation
                </div>
              </div>
              <div className="p-3.5 space-y-1 bg-slate-900/95">
                <div className="flex items-center gap-2 text-[10px] text-pink-400 font-medium">
                  <span>invly.app</span>
                  <span>•</span>
                  <span>Digital Invitation</span>
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-white leading-tight">{title}</h4>
                <p className="text-xs text-slate-300 line-clamp-2">{subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

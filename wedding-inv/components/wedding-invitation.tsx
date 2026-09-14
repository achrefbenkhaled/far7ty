'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  ChevronDown,
  MapPin,
  Clock,
  Music,
  Heart,
  ExternalLink,
  ZoomIn,
  Sparkles,
} from 'lucide-react';
import { ShareModal } from '../../client/src/components/ShareModal';

export interface InvitationData {
  brideName: string;
  groomName: string;
  brideImage: string;
  groomImage: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  story: string;
  showStoryTimeline?: boolean;
  gallery: string[];
  countdownEnabled: boolean;
  musicUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface InvitationProps {
  invitation: InvitationData;
  t?: (key: string) => string;
  isRtl?: boolean;
  isEditorOpen?: boolean;
  preview?: boolean;
  onEditorToggle?: () => void;
  onInvitationChange?: (data: InvitationData) => void;
}

// Type for countdown state
interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const FloralAccent = ({ color }: { color: string }) => (
  <motion.div
    className="absolute opacity-15 pointer-events-none"
    animate={{
      y: [0, -20, 0],
      rotate: [0, 8, -8, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 7,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    <Heart className="w-16 h-16" style={{ color }} />
  </motion.div>
);

const CountdownTimer: React.FC<{
  targetDate: string;
  colors: { primary: string; secondary: string; accent: string };
  t: (key: string) => string;
}> = ({ targetDate, colors, t }) => {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const CountdownUnit = ({
    value,
    label,
  }: {
    value: number;
    label: string;
  }) => (
    <motion.div
      className="flex min-w-0 flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="flex h-[clamp(3.5rem,16vw,5.5rem)] w-[clamp(3.5rem,16vw,5.5rem)] items-center justify-center rounded-2xl border text-[clamp(1.2rem,4vw,2.5rem)] font-serif font-bold backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${colors.accent}18, ${colors.accent}08)`,
          borderColor: `${colors.accent}30`,
          boxShadow: `0 8px 32px ${colors.accent}12`,
          color: colors.accent,
        }}
        whileHover={{ scale: 1.05, y: -4 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <p className="mt-2 text-[0.58rem] font-light uppercase tracking-[0.2em] text-gray-500 sm:text-[0.7rem] md:text-xs">
        {label}
      </p>
    </motion.div>
  );

  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-8">
      <CountdownUnit value={countdown.days} label={t('ej_days')} />
      <CountdownUnit value={countdown.hours} label={t('ej_hours')} />
      <CountdownUnit value={countdown.minutes} label={t('ej_minutes')} />
      <CountdownUnit value={countdown.seconds} label={t('ej_seconds')} />
    </div>
  );
};

const GalleryLightbox: React.FC<{
  images: string[];
  brideName: string;
  groomName: string;
}> = ({ images, brideName, groomName }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5">
        {images.map((image, idx) => (
          <motion.div
            key={idx}
            className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 0.97 }}
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image}
              alt={`${brideName} & ${groomName} - Photo ${idx + 1}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-md">
                <ZoomIn className="h-6 w-6 text-white" />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {selectedImage && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            src={selectedImage}
            alt="Enlarged"
            className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          />
        </motion.div>
      )}
    </>
  );
};

const TimelineCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  colors: { primary: string; secondary: string; accent: string };
}> = ({ title, description, icon, index, colors }) => (
  <motion.div
    className="relative flex gap-4 md:gap-6"
    initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7, delay: index * 0.15, ease: 'easeOut' }}
    viewport={{ once: true }}
  >
    <div className="flex flex-col items-center">
      <motion.div
        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}10)`,
          border: `1px solid ${colors.accent}30`,
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <div style={{ color: colors.accent }}>{icon}</div>
      </motion.div>
      {index < 3 && (
        <motion.div
          className="w-0.5 h-14 md:h-20 mt-2 rounded-full"
          style={{
            background: `linear-gradient(to bottom, ${colors.accent}40, ${colors.accent}08)`,
          }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
        />
      )}
    </div>
    <div className="pb-8 md:pb-12 pt-1">
      <p className="text-sm font-light uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
        {title}
      </p>
      <p className="text-gray-600 mt-2 text-sm md:text-base leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// ─── Editor Panel ──────────────────────────────────────────────
const EditorPanel: React.FC<{
  invitation: InvitationData;
  onChange: (data: InvitationData) => void;
  onOpenShareModal: () => void;
  t: (key: string) => string;
  isRtl: boolean;
}> = ({ invitation, onChange, onOpenShareModal, t, isRtl }) => {
  const update = <K extends keyof InvitationData>(field: K, value: InvitationData[K]) => {
    onChange({ ...invitation, [field]: value });
  };

  const updateColor = (field: keyof InvitationData['colors'], value: string) => {
    onChange({ ...invitation, colors: { ...invitation.colors, [field]: value } });
  };

  return (
    <div className={`fixed top-16 z-40 max-h-[calc(100vh-5rem)] w-[min(92vw,420px)] overflow-auto rounded-3xl border border-slate-200/20 bg-slate-950/95 p-4 shadow-2xl backdrop-blur ${isRtl ? 'left-4 text-right' : 'right-4 text-left'}`}>
      <div className={`flex items-center justify-between gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <p className="text-[10px] uppercase tracking-[0.35em] text-rose-300">{t('invitation_builder')}</p>
          <h3 className="text-lg font-semibold text-white">{t('edit_the_invitation')}</h3>
        </div>
        <button
          type="button"
          onClick={() => onChange({
            brideName: 'Emma',
            groomName: 'James',
            brideImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
            groomImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
            weddingDate: '2025-06-21',
            weddingTime: '4:00 PM',
            venueName: 'The Grand Ballroom',
            venueAddress: '123 Elegant Street, Wedding City, WC 12345',
            mapsUrl: 'https://maps.google.com/?q=wedding+venue',
            story: 'We met on a cold winter evening at a coffee shop, where Emma was working on her thesis and James ordered his usual cappuccino. After striking up a conversation that lasted until closing time, we realized we had found something special.',
            showStoryTimeline: true,
            gallery: [
              'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=500&fit=crop',
              'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&h=500&fit=crop',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop',
              'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=500&fit=crop',
              'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&h=500&fit=crop',
            ],
            countdownEnabled: true,
            musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            colors: { primary: '#8B5E3C', secondary: '#D4A574', accent: '#C06060' },
          })}
          className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/20 transition-colors"
        >
          {t('reset')}
        </button>
      </div>

      <div className="mt-4 space-y-4 text-sm text-slate-300">
        {/* Live Preview Card */}
        <div className="rounded-2xl border border-rose-400/20 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-slate-900/60 p-3">
          <p className="text-[10px] uppercase tracking-[0.35em] text-rose-300">{t('live_preview')}</p>
          <p className="mt-2 font-serif text-lg text-white">
            {invitation.brideName} & {invitation.groomName}
          </p>
          <p className="mt-1 text-sm text-slate-300">{invitation.weddingDate} · {invitation.weddingTime}</p>
        </div>

        {/* Generate Shareable URL Button */}
        <button
          type="button"
          onClick={onOpenShareModal}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-amber-500 py-3 px-4 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.02]"
        >
          <Sparkles className="h-4 w-4" />
          <span>{t('generate_shareable_url') || 'Generate Shareable URL'}</span>
        </button>

        {/* Story / Timeline Toggle */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <label className={`flex items-center justify-between cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs uppercase tracking-[0.25em] text-rose-200 font-semibold">
              {t('show_story_timeline') || 'Show Story Timeline'}
            </span>
            <input
              type="checkbox"
              checked={invitation.showStoryTimeline !== false}
              onChange={(e) => update('showStoryTimeline', e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-white/5 accent-rose-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Names */}
        <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('ej_bride_name')}</span>
          <input value={invitation.brideName} onChange={(e) => update('brideName', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-rose-400/40 transition-colors" />
        </label>
        <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('ej_groom_name')}</span>
          <input value={invitation.groomName} onChange={(e) => update('groomName', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-rose-400/40 transition-colors" />
        </label>

        {/* Date & Time */}
        <div className="grid gap-2 md:grid-cols-2">
          <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
            <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('ej_wedding_date')}</span>
            <input type="date" value={invitation.weddingDate} onChange={(e) => update('weddingDate', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-rose-400/40 transition-colors" />
          </label>
          <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
            <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('ej_wedding_time')}</span>
            <input value={invitation.weddingTime} onChange={(e) => update('weddingTime', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-rose-400/40 transition-colors" />
          </label>
        </div>

        {/* Venue */}
        <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('ej_venue_name')}</span>
          <input value={invitation.venueName} onChange={(e) => update('venueName', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-rose-400/40 transition-colors" />
        </label>
        <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('ej_venue_address')}</span>
          <input value={invitation.venueAddress} onChange={(e) => update('venueAddress', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-rose-400/40 transition-colors" />
        </label>
        <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('ej_maps_url')}</span>
          <input value={invitation.mapsUrl} onChange={(e) => update('mapsUrl', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-rose-400/40 transition-colors" />
        </label>

        {/* Story */}
        <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('ej_love_story')}</span>
          <textarea value={invitation.story} onChange={(e) => update('story', e.target.value)} rows={4} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-rose-400/40 transition-colors" />
        </label>

        {/* Images */}
        <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('ej_bride_image')}</span>
          <input value={invitation.brideImage} onChange={(e) => update('brideImage', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-rose-400/40 transition-colors" placeholder="Image URL" />
        </label>
        <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('ej_groom_image')}</span>
          <input value={invitation.groomImage} onChange={(e) => update('groomImage', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-rose-400/40 transition-colors" placeholder="Image URL" />
        </label>

        {/* Colors */}
        <div>
          <p className={`mb-2 text-xs uppercase tracking-[0.3em] text-slate-500 ${isRtl ? 'text-right' : 'text-left'}`}>{t('page_colors')}</p>
          <div className="grid gap-2 md:grid-cols-3">
            <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              <span className="mb-2 block">{t('ej_color_primary')}</span>
              <input type="color" value={invitation.colors.primary} onChange={(e) => updateColor('primary', e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
            </label>
            <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              <span className="mb-2 block">{t('ej_color_secondary')}</span>
              <input type="color" value={invitation.colors.secondary} onChange={(e) => updateColor('secondary', e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
            </label>
            <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              <span className="mb-2 block">{t('accent')}</span>
              <input type="color" value={invitation.colors.accent} onChange={(e) => updateColor('accent', e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
            </label>
          </div>
        </div>

        {/* Countdown Toggle */}
        <label className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <input type="checkbox" checked={invitation.countdownEnabled} onChange={(e) => update('countdownEnabled', e.target.checked)} className="rounded border-white/10 bg-white/5 h-4 w-4 accent-rose-500" />
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('ej_countdown_enabled')}</span>
        </label>

        {/* Music URL */}
        <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('ej_music_url')}</span>
          <input value={invitation.musicUrl} onChange={(e) => update('musicUrl', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-rose-400/40 transition-colors" placeholder="Audio URL" />
        </label>
      </div>
    </div>
  );
};

// ─── Default translation fallback ──────────────────────────────
const defaultT = (key: string): string => {
  const fallback: Record<string, string> = {
    ej_getting_married: 'We Are Getting Married',
    ej_our_love_story: 'Our Love Story',
    ej_the_big_day: 'The Big Day',
    ej_the_venue: 'The Venue',
    ej_location: 'Location',
    ej_get_directions: 'Get Directions',
    ej_gallery: 'Gallery',
    ej_schedule: 'Schedule',
    ej_dress_code: 'Dress Code',
    ej_dress_code_desc: 'Black Tie Optional',
    ej_join_celebration: 'Join Our Celebration',
    ej_rsvp_desc: 'Please let us know if you can make it to our special day.',
    ej_rsvp_now: 'RSVP Now',
    ej_thank_you: 'Thank you for sharing in our joy',
    ej_with_love: 'With love,',
    ej_days: 'Days',
    ej_hours: 'Hours',
    ej_minutes: 'Minutes',
    ej_seconds: 'Seconds',
    ej_we_met: 'We Met',
    ej_we_met_desc: 'The beginning of our beautiful journey together',
    ej_fell_in_love: 'We Fell in Love',
    ej_fell_in_love_desc: 'Every moment became more precious',
    ej_the_proposal: 'The Proposal',
    ej_the_proposal_desc: 'The moment we decided forever starts now',
    ej_now_celebrate: 'Now We Celebrate',
    ej_now_celebrate_desc: 'Surrounded by everyone we love',
    ej_guests_arrival: 'Guests Arrival',
    ej_ceremony_begins: 'Ceremony Begins',
    ej_reception_dinner: 'Reception & Dinner',
    ej_toasts_dancing: 'Toasts & Dancing',
    ej_send_off: 'Send Off',
    ej_bride_name: 'Bride Name',
    ej_groom_name: 'Groom Name',
    ej_wedding_date: 'Wedding Date',
    ej_wedding_time: 'Wedding Time',
    ej_venue_name: 'Venue Name',
    ej_venue_address: 'Venue Address',
    ej_maps_url: 'Maps URL',
    ej_love_story: 'Love Story',
    ej_bride_image: 'Bride Image',
    ej_groom_image: 'Groom Image',
    ej_color_primary: 'Primary',
    ej_color_secondary: 'Secondary',
    ej_countdown_enabled: 'Show Countdown',
    ej_music_url: 'Music URL',
    invitation_builder: 'Invitation Builder',
    edit_the_invitation: 'Edit the invitation',
    reset: 'Reset',
    live_preview: 'Live preview',
    page_colors: 'Page Colors',
    accent: 'Accent',
  };
  return fallback[key] || key;
};

export default function WeddingInvitation({
  invitation,
  t: externalT,
  isRtl = false,
  isEditorOpen = false,
  preview = false,
  onInvitationChange,
}: InvitationProps) {
  const t = externalT || defaultT;
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Use local state for editor if no external handler is provided
  const [localData, setLocalData] = useState<InvitationData>(invitation);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    setLocalData(invitation);
  }, [invitation]);

  const currentData = onInvitationChange ? invitation : localData;
  const handleChange = (data: InvitationData) => {
    if (onInvitationChange) {
      onInvitationChange(data);
    } else {
      setLocalData(data);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const isAudio = currentData.musicUrl.endsWith('.mp3') || currentData.musicUrl.endsWith('.wav');

  const scheduleItems = [
    { time: '4:00 PM', event: t('ej_guests_arrival') },
    { time: '4:30 PM', event: t('ej_ceremony_begins') },
    { time: '5:30 PM', event: t('ej_reception_dinner') },
    { time: '7:00 PM', event: t('ej_toasts_dancing') },
    { time: '11:00 PM', event: t('ej_send_off') },
  ];

  const timelineItems = [
    { title: t('ej_we_met'), desc: t('ej_we_met_desc') },
    { title: t('ej_fell_in_love'), desc: t('ej_fell_in_love_desc') },
    { title: t('ej_the_proposal'), desc: t('ej_the_proposal_desc') },
    { title: t('ej_now_celebrate'), desc: t('ej_now_celebrate_desc') },
  ];

  return (
    <div className={`overflow-hidden bg-white text-gray-900 ${isRtl ? 'rtl' : 'ltr'}`}>
      {!preview && (
        <>
          {/* Floating background decorations */}
          <motion.div
            className="pointer-events-none fixed right-4 top-10 opacity-[0.04] sm:right-10"
            animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
            transition={{ duration: reduceMotion ? 0 : 60, repeat: reduceMotion ? 0 : Infinity, ease: 'linear' }}
          >
            <Heart className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40" style={{ color: currentData.colors.accent }} />
          </motion.div>
          <motion.div
            className="pointer-events-none fixed bottom-20 left-4 opacity-[0.03] sm:left-10"
            animate={reduceMotion ? { rotate: 0 } : { rotate: -360 }}
            transition={{ duration: reduceMotion ? 0 : 80, repeat: reduceMotion ? 0 : Infinity, ease: 'linear' }}
          >
            <Heart className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28" style={{ color: currentData.colors.accent }} />
          </motion.div>
        </>
      )}

      {/* ─── EDITOR PANEL ─── */}
      {isEditorOpen && !preview && (
        <EditorPanel
          invitation={currentData}
          onChange={handleChange}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          t={t}
          isRtl={isRtl}
        />
      )}

      {/* ─── SHARE MODAL ─── */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`${currentData.brideName} & ${currentData.groomName} Wedding Invitation`}
        subtitle={`Join us on ${currentData.weddingDate} at ${currentData.venueName}`}
        coverImage={currentData.brideImage || '/templates/emma-james.png'}
      />

      {/* ─── HERO SECTION ─── */}
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at top left, ${currentData.colors.accent}12 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, ${currentData.colors.secondary}15 0%, transparent 50%),
              linear-gradient(180deg, #fefcfb 0%, #fff9f5 50%, #fff5ee 100%)
            `,
          }}
        />

        {/* Floating particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="pointer-events-none absolute h-1.5 w-1.5 rounded-full"
            style={{
              background: `${currentData.colors.accent}40`,
              left: `${15 + (i * 11) % 70}%`,
              top: `${20 + (i * 13) % 60}%`,
            }}
            animate={reduceMotion ? { opacity: 0.4 } : {
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: reduceMotion ? 0 : 4 + i * 0.5,
              repeat: reduceMotion ? 0 : Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        ))}

        <FloralAccent color={currentData.colors.accent} />

        <motion.div
          className="relative z-10 mx-auto max-w-4xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Wedding Label */}
          <motion.p
            variants={itemVariants}
            className="mb-6 text-[0.7rem] font-light uppercase tracking-[0.3em] sm:mb-8 sm:text-sm"
            style={{ color: currentData.colors.accent }}
          >
            {t('ej_getting_married')}
          </motion.p>

          {/* Names */}
          <motion.div variants={itemVariants} className="mb-8 sm:mb-10 lg:mb-14">
            <h1 className="mb-3 font-serif text-[clamp(2.7rem,13vw,7rem)] font-light leading-[0.9] tracking-[0.04em]" style={{ color: currentData.colors.primary }}>
              {currentData.brideName}
            </h1>
            <motion.div
              className="mx-auto mb-4 h-[2px] w-16 rounded-full sm:w-20 lg:w-28"
              style={{ background: `linear-gradient(90deg, transparent, ${currentData.colors.accent}, transparent)` }}
              animate={reduceMotion ? { scaleX: 1 } : { scaleX: [0.6, 1, 0.6] }}
              transition={{ duration: reduceMotion ? 0 : 3, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
            />
            <h2 className="font-serif text-[clamp(2.7rem,13vw,7rem)] font-light leading-[0.9] tracking-[0.04em]" style={{ color: currentData.colors.primary }}>
              {currentData.groomName}
            </h2>
          </motion.div>

          {/* Portraits */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-10 lg:mb-14 lg:gap-14"
          >
            {currentData.brideImage && (
              <motion.div
                className="h-[clamp(5.5rem,27vw,13rem)] w-[clamp(5.5rem,27vw,13rem)] overflow-hidden rounded-full shadow-2xl"
                style={{
                  border: `3px solid ${currentData.colors.accent}`,
                  boxShadow: `0 20px 60px ${currentData.colors.accent}20`,
                }}
                whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: 2 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <img
                  src={currentData.brideImage}
                  alt={currentData.brideName}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            )}
            <motion.div
              className="flex items-center justify-center"
              animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.15, 1] }}
              transition={{ duration: reduceMotion ? 0 : 2, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
            >
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" style={{ color: currentData.colors.accent, fill: currentData.colors.accent }} />
            </motion.div>
            {currentData.groomImage && (
              <motion.div
                className="h-[clamp(5.5rem,27vw,13rem)] w-[clamp(5.5rem,27vw,13rem)] overflow-hidden rounded-full shadow-2xl"
                style={{
                  border: `3px solid ${currentData.colors.accent}`,
                  boxShadow: `0 20px 60px ${currentData.colors.accent}20`,
                }}
                whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: -2 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <img
                  src={currentData.groomImage}
                  alt={currentData.groomName}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            )}
          </motion.div>

          {/* Date */}
          <motion.p
            variants={itemVariants}
            className="mb-8 font-serif text-[clamp(1.4rem,5vw,2.8rem)] leading-snug"
            style={{ color: currentData.colors.primary }}
          >
            {new Date(currentData.weddingDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </motion.p>

          {/* Scroll Indicator */}
          <motion.div
            animate={reduceMotion ? { y: 0 } : { y: [0, 12, 0] }}
            transition={{ duration: reduceMotion ? 0 : 2.5, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
            style={{ opacity }}
          >
            <ChevronDown className="mx-auto h-6 w-6" style={{ color: currentData.colors.accent }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── LOVE STORY SECTION ─── */}
      {currentData.showStoryTimeline !== false && (
        <section className="flex min-h-[100dvh] items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
          style={{
            background: `linear-gradient(180deg, #fff5ee 0%, #fffaf7 50%, #fff5ee 100%)`,
          }}
        >
          <motion.div
            className="mx-auto w-full max-w-4xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="mb-4 text-center font-serif text-[clamp(2.3rem,8vw,4.5rem)] leading-none"
              style={{ color: currentData.colors.primary }}
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t('ej_our_love_story')}
            </motion.h2>
            <motion.div
              className="mx-auto mb-8 h-[2px] w-20 rounded-full sm:mb-10 lg:mb-14"
              style={{ background: `linear-gradient(90deg, transparent, ${currentData.colors.accent}, transparent)` }}
            />

            <motion.p
              className="mx-auto mb-10 max-w-2xl text-center text-base leading-relaxed text-gray-600 sm:text-lg lg:mb-16 lg:text-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {currentData.story}
            </motion.p>

            {/* Timeline */}
            <div className="space-y-2 md:space-y-4 mt-16">
              {timelineItems.map((item, idx) => (
                <TimelineCard
                  key={idx}
                  title={item.title}
                  description={item.desc}
                  icon={<Heart size={22} />}
                  index={idx}
                  colors={currentData.colors}
                />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ─── COUNTDOWN SECTION ─── */}
      {currentData.countdownEnabled && (
        <section className="flex min-h-[100dvh] items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
          style={{
            background: `linear-gradient(180deg, #fffaf7 0%, #fef6f0 50%, #fffaf7 100%)`,
          }}
        >
          <motion.div
            className="mx-auto w-full max-w-4xl text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="mb-4 font-serif text-[clamp(2.3rem,8vw,4.5rem)] leading-none"
              style={{ color: currentData.colors.primary }}
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t('ej_the_big_day')}
            </motion.h2>
            <motion.div
              className="mx-auto mb-8 h-[2px] w-20 rounded-full sm:mb-12 lg:mb-16"
              style={{ background: `linear-gradient(90deg, transparent, ${currentData.colors.accent}, transparent)` }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <CountdownTimer
                targetDate={currentData.weddingDate}
                colors={currentData.colors}
                t={t}
              />
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* ─── VENUE SECTION ─── */}
      <section className="flex min-h-[100dvh] items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        style={{
          background: `linear-gradient(180deg, #fff5ee 0%, #fffaf7 50%, #fff5ee 100%)`,
        }}
      >
        <motion.div
          className="mx-auto w-full max-w-4xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="mb-4 text-center font-serif text-[clamp(2.3rem,8vw,4.5rem)] leading-none"
            style={{ color: currentData.colors.primary }}
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('ej_the_venue')}
          </motion.h2>
          <motion.div
            className="mx-auto mb-8 h-[2px] w-20 rounded-full sm:mb-10 lg:mb-14"
            style={{ background: `linear-gradient(90deg, transparent, ${currentData.colors.accent}, transparent)` }}
          />

          <motion.div
            className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6 sm:space-y-7">
              <div>
                <p
                  className="mb-2 text-xs font-light uppercase tracking-[0.25em] sm:text-sm"
                  style={{ color: currentData.colors.accent }}
                >
                  {t('ej_location')}
                </p>
                <h3 className="font-serif text-[clamp(1.8rem,6vw,3rem)] leading-tight" style={{ color: currentData.colors.primary }}>
                  {currentData.venueName}
                </h3>
              </div>

              <div className="flex items-start gap-4">
                <MapPin style={{ color: currentData.colors.accent }} className="mt-1 h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6" />
                <p className="text-base leading-relaxed text-gray-600 sm:text-lg">{currentData.venueAddress}</p>
              </div>

              <div className="flex items-start gap-4">
                <Clock style={{ color: currentData.colors.accent }} className="mt-1 h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6" />
                <p className="text-base leading-relaxed text-gray-600 sm:text-lg">{currentData.weddingTime}</p>
              </div>

              {currentData.mapsUrl && (
                <motion.a
                  href={currentData.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[0.68rem] font-light uppercase tracking-[0.2em] shadow-lg sm:px-7 sm:py-3.5 sm:text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${currentData.colors.accent}, ${currentData.colors.accent}cc)`,
                    color: 'white',
                    boxShadow: `0 8px 30px ${currentData.colors.accent}30`,
                  }}
                  whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t('ej_get_directions')}
                  <ExternalLink size={16} />
                </motion.a>
              )}
            </div>

            <motion.div
              className="h-64 w-full overflow-hidden rounded-2xl shadow-xl sm:h-72 md:h-80"
              style={{ border: `1px solid ${currentData.colors.accent}20` }}
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            >
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(currentData.venueAddress || currentData.venueName || '')}&z=14&output=embed`}
                width="100%"
                height="100%"
                className="block h-full w-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map for ${currentData.venueName}`}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── GALLERY SECTION ─── */}
      {currentData.gallery.length > 0 && (
        <section className="flex min-h-[100dvh] items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
          style={{
            background: `linear-gradient(180deg, #fffaf7 0%, #fef6f0 50%, #fffaf7 100%)`,
          }}
        >
          <motion.div
            className="mx-auto w-full max-w-4xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="mb-4 text-center font-serif text-[clamp(2.3rem,8vw,4.5rem)] leading-none"
              style={{ color: currentData.colors.primary }}
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t('ej_gallery')}
            </motion.h2>
            <motion.div
              className="mx-auto mb-8 h-[2px] w-20 rounded-full sm:mb-10 lg:mb-14"
              style={{ background: `linear-gradient(90deg, transparent, ${currentData.colors.accent}, transparent)` }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <GalleryLightbox
                images={currentData.gallery}
                brideName={currentData.brideName}
                groomName={currentData.groomName}
              />
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* ─── SCHEDULE SECTION ─── */}
      <section className="flex min-h-[100dvh] items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        style={{
          background: `linear-gradient(180deg, #fff5ee 0%, #fffaf7 50%, #fff5ee 100%)`,
        }}
      >
        <motion.div
          className="mx-auto w-full max-w-4xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="mb-4 text-center font-serif text-[clamp(2.3rem,8vw,4.5rem)] leading-none"
            style={{ color: currentData.colors.primary }}
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('ej_schedule')}
          </motion.h2>
          <motion.div
            className="mx-auto mb-8 h-[2px] w-20 rounded-full sm:mb-10 lg:mb-14"
            style={{ background: `linear-gradient(90deg, transparent, ${currentData.colors.accent}, transparent)` }}
          />

          <div className="space-y-3 sm:space-y-4">
            {scheduleItems.map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-3 rounded-2xl p-4 backdrop-blur-sm sm:gap-5 sm:p-6"
                style={{
                  background: `linear-gradient(135deg, ${currentData.colors.accent}08, ${currentData.colors.secondary}06)`,
                  border: `1px solid ${currentData.colors.accent}12`,
                }}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={reduceMotion ? undefined : { x: 8, boxShadow: `0 4px 20px ${currentData.colors.accent}10` }}
              >
                <p
                  className="w-20 flex-shrink-0 font-serif text-base font-light sm:w-28 sm:text-xl md:w-36 md:text-2xl"
                  style={{ color: currentData.colors.accent }}
                >
                  {item.time}
                </p>
                <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: currentData.colors.accent }} />
                <p className="text-sm leading-relaxed text-gray-700 sm:text-base md:text-lg">{item.event}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── DRESS CODE SECTION ─── */}
      <section className="flex min-h-[60vh] items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        style={{
          background: `linear-gradient(180deg, #fffaf7 0%, #fef6f0 50%, #fffaf7 100%)`,
        }}
      >
        <motion.div
          className="mx-auto w-full max-w-4xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="mb-4 text-center font-serif text-[clamp(2.3rem,8vw,4.5rem)] leading-none"
            style={{ color: currentData.colors.primary }}
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('ej_dress_code')}
          </motion.h2>
          <motion.div
            className="mx-auto mb-8 h-[2px] w-20 rounded-full sm:mb-10 lg:mb-14"
            style={{ background: `linear-gradient(90deg, transparent, ${currentData.colors.accent}, transparent)` }}
          />

          <motion.div
            className="mx-auto max-w-2xl rounded-3xl p-6 shadow-lg sm:p-10 lg:p-14"
            style={{
              background: `linear-gradient(135deg, ${currentData.colors.accent}08, ${currentData.colors.secondary}06)`,
              border: `1px solid ${currentData.colors.accent}15`,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-center font-serif text-lg leading-relaxed text-gray-600 sm:text-xl lg:text-2xl">
              {t('ej_dress_code_desc')}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── RSVP SECTION ─── */}
      <section className="flex min-h-[100dvh] items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        style={{
          background: `linear-gradient(180deg, #fff5ee 0%, #fffaf7 50%, #fff5ee 100%)`,
        }}
      >
        <motion.div
          className="mx-auto w-full max-w-4xl text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="mb-6 font-serif text-[clamp(2.3rem,8vw,4.5rem)] leading-none"
            style={{ color: currentData.colors.primary }}
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('ej_join_celebration')}
          </motion.h2>
          <motion.div
            className="mx-auto mb-8 h-[2px] w-20 rounded-full sm:mb-12"
            style={{ background: `linear-gradient(90deg, transparent, ${currentData.colors.accent}, transparent)` }}
          />

          <motion.p
            className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg lg:mb-14 lg:text-xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t('ej_rsvp_desc')}
          </motion.p>

          <motion.button
            className="w-full max-w-[18rem] rounded-2xl px-6 py-4 text-[0.7rem] font-light uppercase tracking-[0.2em] shadow-xl sm:max-w-[20rem] sm:px-10 sm:text-base"
            style={{
              background: `linear-gradient(135deg, ${currentData.colors.accent}, ${currentData.colors.accent}cc)`,
              color: 'white',
              boxShadow: `0 12px 40px ${currentData.colors.accent}30`,
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.05, y: -3, boxShadow: `0 18px 50px ${currentData.colors.accent}40` }}
            whileTap={{ scale: 0.97 }}
          >
            {t('ej_rsvp_now')}
          </motion.button>

          {isAudio && currentData.musicUrl && (
            <motion.div
              className="mt-12 flex flex-col items-center justify-center gap-4 sm:mt-16 sm:flex-row"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Music
                style={{ color: currentData.colors.accent }}
                className="h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6"
              />
              <audio controls className="w-full max-w-xs rounded-full">
                <source src={currentData.musicUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="px-4 py-12 text-center sm:py-14"
        style={{
          borderTop: `1px solid ${currentData.colors.accent}15`,
          background: `linear-gradient(180deg, #fffaf7, ${currentData.colors.accent}06)`,
        }}
      >
        <motion.div
          className="mb-4 flex justify-center"
          animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.1, 1] }}
          transition={{ duration: reduceMotion ? 0 : 2, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
        >
          <Heart className="h-6 w-6" style={{ color: currentData.colors.accent, fill: currentData.colors.accent }} />
        </motion.div>
        <motion.p
          className="text-base font-light text-gray-500 sm:text-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {t('ej_thank_you')}
        </motion.p>
        <motion.p
          className="mt-3 text-xs font-light text-gray-400 sm:text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
        >
          {t('ej_with_love')} {currentData.brideName} & {currentData.groomName}
        </motion.p>
      </footer>
    </div>
  );
}

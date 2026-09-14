import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Heart,
  Send,
  ExternalLink,
  ChevronDown,
  Gift,
  Volume2,
  VolumeX,
  Share2,
  CheckCircle2,
  PartyPopper,
  X,
  Users,
  Compass,
  Crown,
  MailOpen,
} from 'lucide-react';

export interface TemplateProps {
  preview?: boolean;
  invitationData?: Record<string, unknown>;
  variant?: string;
}

interface GalleryPhoto {
  url: string;
  caption: string;
}

interface WishItem {
  id: string;
  name: string;
  message: string;
  date?: string;
}

interface GiftItem {
  title: string;
  description: string;
  link?: string;
  icon?: string;
}

// ── Default Rich French Celebration Data ──
const defaultStoryPhotos: GalleryPhoto[] = [
  {
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&auto=format&fit=crop&q=80',
    caption: 'Les premiers souvenirs ❤️',
  },
  {
    url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&auto=format&fit=crop&q=80',
    caption: 'Des moments inoubliables ✨',
  },
  {
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&auto=format&fit=crop&q=80',
    caption: 'Entouré(e) de ceux qui comptent le plus',
  },
  {
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop&q=80',
    caption: 'Et encore plein d’aventures à venir… 🚀',
  },
];

const defaultWishList: WishItem[] = [
  { id: '1', name: 'Sophie & Thomas', message: 'Joyeux anniversaire ! Que cette nouvelle décennie t’apporte bonheur, voyages et rires infinis ! 🥂✨' },
  { id: '2', name: 'Julien M.', message: 'Hâte de trinquer avec toi pour ce grand cap ! Ne change rien, tu es formidable. ❤️' },
];

const defaultGifts: GiftItem[] = [
  {
    title: 'Cagnotte Voyage de Rêve',
    description: 'Une participation libre pour m’aider à concrétiser mon prochain grand voyage sous les tropiques 🌴',
    link: 'https://lepotcommun.fr',
    icon: '✈️',
  },
  {
    title: 'Liste de Souhaits & Idées',
    description: 'Quelques inspirations de livres, déco et expériences gourmandes',
    link: '#',
    icon: '🎁',
  },
];

// ── Realistic Real-Time Countdown Hook ──
function useBirthdayCountdown(targetDateStr?: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 30,
    isToday: false,
  });

  useEffect(() => {
    let target = targetDateStr ? new Date(targetDateStr).getTime() : NaN;
    if (isNaN(target)) {
      target = Date.now() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000;
    }

    const checkTime = () => {
      const now = Date.now();
      const diff = target - now;

      const targetDate = new Date(target);
      const nowDate = new Date(now);
      const isSameDay =
        targetDate.getFullYear() === nowDate.getFullYear() &&
        targetDate.getMonth() === nowDate.getMonth() &&
        targetDate.getDate() === nowDate.getDate();

      if (diff <= 0 || isSameDay) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isToday: false });
    };

    checkTime();
    const timer = setInterval(checkTime, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  return timeLeft;
}

// ── Lightweight High-Performance Canvas Confetti System ──
function triggerCelebrationConfetti(canvas: HTMLCanvasElement | null, count = 75) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * (window.devicePixelRatio || 1);
  canvas.height = rect.height * (window.devicePixelRatio || 1);
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

  const colors = ['#f5d88a', '#e6b85c', '#ffffff', '#ff9494', '#d8b067', '#fbeec1', '#ffd700'];
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    vRot: number;
    alpha: number;
  }> = [];

  const originX = rect.width / 2;
  const originY = rect.height / 2;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.5 + Math.random() * 6;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      alpha: 1,
    });
  }

  const render = () => {
    ctx.clearRect(0, 0, rect.width, rect.height);
    let alive = false;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.vx *= 0.98;
      p.rotation += p.vRot;
      p.alpha -= 0.012;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    }

    if (alive) {
      requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
  };

  render();
}

export default function MagicBirthdayTemplate({
  preview = false,
  invitationData,
}: TemplateProps) {
  // ── Core Customization Props with French Defaults ──
  const celebrantName =
    (invitationData?.celebrantName as string) ||
    (invitationData?.name as string) ||
    'Camille';

  const celebrantAge =
    (invitationData?.age as string | number) ||
    (invitationData?.celebrantAge as string | number) ||
    '30';

  const eventDate = (invitationData?.date as string) || '2026-09-12';
  const displayDate =
    (invitationData?.dateLabel as string) || 'Samedi 12 Septembre 2026';
  const displayTime = (invitationData?.time as string) || '19:00';
  const venueName =
    (invitationData?.venue as string) || 'Le Jardin des Étoiles';
  const addressDetails =
    (invitationData?.address as string) || '14 Avenue de la Fête, 75008 Paris';
  const mapsUrl =
    (invitationData?.mapsUrl as string) ||
    `https://maps.google.com/?q=${encodeURIComponent(venueName + ' ' + addressDetails)}`;

  const mainDescription =
    (invitationData?.description as string) ||
    'Et j’aimerais beaucoup célébrer ce moment avec vous.';

  const handwrittenNote =
    (invitationData?.handwrittenMessage as string) ||
    'Cette année encore, j’ai envie de partager un moment rempli de rires, de bonheur et de beaux souvenirs avec les personnes qui comptent le plus pour moi.';

  const profilePhoto =
    (invitationData?.profilePhoto as string) ||
    (invitationData?.avatar as string) ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';

  const finalClosingMessage =
    (invitationData?.finalMessage as string) ||
    'À très bientôt pour faire la fête !';

  const rsvpWhatsappNumber =
    (invitationData?.whatsappPhone as string) ||
    (invitationData?.clientPhone as string) ||
    '33600000000';

  const musicUrl =
    (invitationData?.musicUrl as string) ||
    'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3';

  // ── Gallery Photos ──
  const galleryItems = useMemo<GalleryPhoto[]>(() => {
    if (Array.isArray(invitationData?.storyItems) && invitationData.storyItems.length > 0) {
      return invitationData.storyItems as GalleryPhoto[];
    }
    if (Array.isArray(invitationData?.gallery) && invitationData.gallery.length > 0) {
      return (invitationData.gallery as string[]).map((url, i) => ({
        url,
        caption: defaultStoryPhotos[i]?.caption || `Moment d’exception ${i + 1}`,
      }));
    }
    return defaultStoryPhotos;
  }, [invitationData]);

  // ── Wishlist Items ──
  const giftItems = useMemo<GiftItem[]>(() => {
    if (Array.isArray(invitationData?.giftOptions) && invitationData.giftOptions.length > 0) {
      return invitationData.giftOptions as GiftItem[];
    }
    return defaultGifts;
  }, [invitationData]);

  // ── Interactive State ──
  const [isOpen, setIsOpen] = useState(false);
  const [isOpeningAnim, setIsOpeningAnim] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  // Make a wish state
  const [wishes, setWishes] = useState<WishItem[]>(defaultWishList);
  const [guestWishText, setGuestWishText] = useState('');
  const [guestWishName, setGuestWishName] = useState('');
  const [wishFlameGlow, setWishFlameGlow] = useState(false);
  const [wishConfirmed, setWishConfirmed] = useState(false);

  // RSVP Form state
  const [rsvpAttendance, setRsvpAttendance] = useState<
    'yes' | 'maybe' | 'no' | null
  >(null);
  const [rsvpGuestName, setRsvpGuestName] = useState('');
  const [rsvpGuestCount, setRsvpGuestCount] = useState('1');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Canvas refs for celebration effects
  const openCanvasRef = useRef<HTMLCanvasElement>(null);
  const wishCanvasRef = useRef<HTMLCanvasElement>(null);
  const finaleCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finaleSectionRef = useRef<HTMLDivElement>(null);

  const countdown = useBirthdayCountdown(eventDate);

  // ── Handle Opening Transition ──
  const handleOpenInvitation = () => {
    if (isOpeningAnim || isOpen) return;
    setIsOpeningAnim(true);

    // Audio playback attempt
    if (audioRef.current && musicUrl) {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(false));
    }

    // Trigger opening particle burst right from envelope center
    setTimeout(() => {
      triggerCelebrationConfetti(openCanvasRef.current, 90);
    }, 400);

    // Complete reveal after realistic envelope unfolding animation
    setTimeout(() => {
      setIsOpen(true);
      setIsOpeningAnim(false);
    }, 1250);
  };

  // Toggle Music
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  // ── Handle "Make a Wish" Action ──
  const handleMakeWish = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setWishFlameGlow(true);

    triggerCelebrationConfetti(wishCanvasRef.current, 60);

    if (guestWishText.trim() || guestWishName.trim()) {
      const newEntry: WishItem = {
        id: String(Date.now()),
        name: guestWishName.trim() || 'Invité secret ✨',
        message: guestWishText.trim() || 'Un vœu plein de joie et de lumière !',
        date: "Aujourd'hui",
      };
      setWishes((prev) => [newEntry, ...prev]);
    }

    setTimeout(() => {
      setWishConfirmed(true);
      setWishFlameGlow(false);
      setGuestWishText('');
      setGuestWishName('');
    }, 1200);
  };

  // ── Handle RSVP Submission ──
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpAttendance) return;
    setRsvpSubmitted(true);

    const cleanPhone = rsvpWhatsappNumber.replace(/[^0-9]/g, '');

    const attendanceLabel =
      rsvpAttendance === 'yes'
        ? 'Oui, avec grand plaisir ! 🎉'
        : rsvpAttendance === 'maybe'
        ? 'Peut-être, à confirmer 🤔'
        : 'Je ne pourrai malheureusement pas venir 💌';

    const textPayload = encodeURIComponent(
      `Bonjour ${celebrantName} ! ✨\n\n` +
      `Réponse à ton invitation d'anniversaire :\n` +
      `• Présence : ${attendanceLabel}\n` +
      `• Nom : ${rsvpGuestName.trim() || 'Invité'}\n` +
      `• Nombre de personnes : ${rsvpGuestCount}\n` +
      (rsvpMessage.trim() ? `• Message : "${rsvpMessage.trim()}"\n` : '') +
      `\nÀ très vite !`
    );

    const whatsappDirectUrl = `https://wa.me/${cleanPhone || '33600000000'}?text=${textPayload}`;

    setTimeout(() => {
      window.open(whatsappDirectUrl, '_blank');
    }, 1300);
  };

  // ── Intersection Observer for Finale Section Confetti ──
  useEffect(() => {
    if (!isOpen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          triggerCelebrationConfetti(finaleCanvasRef.current, 75);
        }
      },
      { threshold: 0.35 }
    );

    if (finaleSectionRef.current) {
      observer.observe(finaleSectionRef.current);
    }
    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <div
      className="invitation-scope relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#1b1519] via-[#120f12] to-[#0a080a] text-[#f7e8ce] selection:bg-[#e6b85c] selection:text-black"
    >
      {/* Hidden Audio Element */}
      {musicUrl && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
          aria-hidden="true"
        />
      )}

      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes sealGlowPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(230, 184, 92, 0.5), inset 0 0 10px rgba(255, 235, 180, 0.4); }
          50% { transform: scale(1.08); box-shadow: 0 0 35px rgba(255, 215, 0, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.6); }
        }
        @keyframes envelopeAura {
          0%, 100% { opacity: 0.35; transform: scale(0.96); }
          50% { opacity: 0.75; transform: scale(1.06); }
        }
        @keyframes shimmerGold {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes candleFlameFlicker {
          0%, 100% { transform: scale(1) rotate(-1deg); opacity: 0.95; }
          25% { transform: scale(1.08, 0.95) rotate(2deg); opacity: 1; }
          50% { transform: scale(0.96, 1.05) rotate(-2deg); opacity: 0.9; }
          75% { transform: scale(1.04, 1.02) rotate(1deg); opacity: 1; }
        }
        @keyframes candleHaloPulse {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.25); opacity: 0.85; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.95; transform: scale(1.2); }
        }
        .gold-shimmer-text {
          background: linear-gradient(
            90deg,
            #d6a754 0%,
            #fff4d0 25%,
            #e7ba66 50%,
            #fff4d0 75%,
            #d6a754 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmerGold 5s linear infinite;
        }
        .gold-glow {
          text-shadow: 0 0 20px rgba(230, 184, 92, 0.45), 0 0 35px rgba(214, 167, 84, 0.2);
        }
        .glass-panel {
          background: rgba(26, 21, 24, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(230, 184, 92, 0.2);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }
        .glass-panel-light {
          background: rgba(35, 28, 33, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(230, 184, 92, 0.16);
        }
        .candle-flicker {
          animation: candleFlameFlicker 1.8s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .candle-halo {
          animation: candleHaloPulse 2.4s ease-in-out infinite;
        }
        .seal-pulse {
          animation: sealGlowPulse 2.5s ease-in-out infinite;
        }
        .envelope-floating {
          animation: floatSlow 4.5s ease-in-out infinite;
        }
        .star-particle {
          animation: starTwinkle 3s ease-in-out infinite;
        }
      `}</style>

      {/* ── Fixed Ambient Music Pill Button ── */}
      {isOpen && musicUrl && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${preview ? 'absolute right-3 top-3' : 'fixed right-4 top-4'} z-50`}
        >
          <button
            type="button"
            onClick={toggleMusic}
            aria-label={isPlayingMusic ? 'Couper la musique' : 'Activer la musique'}
            className="flex items-center gap-2 rounded-full border border-[#d6a754]/40 bg-[#141013]/85 px-3.5 py-2 text-xs font-semibold text-[#f5d88a] shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-[#d6a754]"
          >
            {isPlayingMusic ? (
              <>
                <Volume2 className="h-4 w-4 text-[#e6b85c]" />
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-1 bg-[#e6b85c] rounded-full h-full animate-pulse" />
                  <span className="w-1 bg-[#e6b85c] rounded-full h-2 animate-pulse delay-75" />
                  <span className="w-1 bg-[#e6b85c] rounded-full h-3 animate-pulse delay-150" />
                </span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-white/50" />
                <span className="text-[11px] text-white/70">Musique</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* ── Ambient Floating Stars & Shimmering Dust ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {[
          { x: '12%', y: '6%', s: 2, d: '0s' },
          { x: '86%', y: '10%', s: 3, d: '1.2s' },
          { x: '22%', y: '22%', s: 2.5, d: '0.6s' },
          { x: '76%', y: '32%', s: 2, d: '1.8s' },
          { x: '14%', y: '46%', s: 3, d: '0.3s' },
          { x: '84%', y: '58%', s: 2, d: '2.1s' },
          { x: '30%', y: '72%', s: 2.5, d: '1s' },
          { x: '82%', y: '84%', s: 3, d: '1.5s' },
          { x: '48%', y: '94%', s: 2, d: '0.8s' },
        ].map((star, idx) => (
          <span
            key={idx}
            className="star-particle absolute rounded-full bg-white"
            style={{
              left: star.x,
              top: star.y,
              width: star.s,
              height: star.s,
              boxShadow: '0 0 10px rgba(255, 235, 180, 0.95)',
              animationDelay: star.d,
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PHASE 1: LIVE 3D REALISTIC ENVELOPE (BEFORE OPENING)
      ═══════════════════════════════════════════════════════════════ */}
      {!isOpen && (
        <section className="relative z-20 flex min-h-[90vh] flex-col items-center justify-center px-4 py-8 text-center select-none">
          {/* Confetti Canvas for Opening Burst */}
          <canvas
            ref={openCanvasRef}
            className="pointer-events-none absolute inset-0 z-50 h-full w-full"
          />

          {/* Golden Ambient Glow Behind Envelope */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[340px] w-[340px] sm:h-[460px] sm:w-[460px] rounded-full blur-[80px]"
            style={{
              background: 'radial-gradient(circle, rgba(230, 184, 92, 0.3) 0%, rgba(180, 120, 45, 0.1) 50%, transparent 70%)',
              animation: 'envelopeAura 4s ease-in-out infinite',
            }}
          />

          <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
            {/* Teaser Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e6b85c]/30 bg-[#e6b85c]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#f5d88a] shadow-md backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#e6b85c]" />
              <span>Une petite surprise vous attend…</span>
            </motion.div>

            {/* ── REALISTIC 3D LIVE ENVELOPE CONTAINER ── */}
            <div
              className="envelope-floating relative my-3 cursor-pointer select-none"
              onClick={handleOpenInvitation}
              style={{ perspective: 1200 }}
            >
              {/* Envelope Dimensions: 310px × 205px */}
              <div className="relative h-[205px] w-[305px] sm:h-[220px] sm:w-[335px] rounded-[18px] border border-[#e6b85c]/45 bg-gradient-to-br from-[#2a2228] via-[#1c171b] to-[#120e11] shadow-[0_25px_60px_rgba(0,0,0,0.85),_inset_0_1px_1px_rgba(255,255,255,0.2)]">

                {/* Golden Foil Perimeter Inset Line */}
                <div className="pointer-events-none absolute inset-2.5 rounded-[12px] border border-[#d6a754]/30" />

                {/* ── CARD INSIDE (SLIDES UP ON OPEN) ── */}
                <motion.div
                  initial={{ y: 0, opacity: 0.95 }}
                  animate={
                    isOpeningAnim
                      ? { y: -115, opacity: 1, scale: 1.05 }
                      : { y: [0, -4, 0] }
                  }
                  transition={
                    isOpeningAnim
                      ? { duration: 0.85, ease: 'easeOut', delay: 0.2 }
                      : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                  }
                  className="absolute inset-x-4 top-3 z-10 flex h-[180px] flex-col items-center justify-start rounded-[14px] border border-[#ffd880]/60 bg-gradient-to-b from-[#fdfbf6] via-[#f7ecd8] to-[#eed7b0] p-4 text-center shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
                >
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#996d24]">
                    INVITATION VIP
                  </p>
                  <h3 className="gold-shimmer-text mt-2 font-serif text-2xl font-extrabold text-[#3a270f]">
                    {celebrantName}
                  </h3>
                  <p className="font-serif text-xs italic text-[#775218]">
                    fête ses {celebrantAge} ans ✨
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#8a6020]">
                    <Calendar className="h-3 w-3 text-[#b3802e]" />
                    <span>{displayDate}</span>
                  </div>
                </motion.div>

                {/* ── ENVELOPE POCKET FLAPS (BOTTOM, LEFT, RIGHT) ── */}
                {/* Left Triangular Fold */}
                <div
                  className="pointer-events-none absolute inset-0 z-20 rounded-l-[18px] bg-gradient-to-r from-[#201a1e] to-[#161214] opacity-95"
                  style={{ clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)' }}
                />

                {/* Right Triangular Fold */}
                <div
                  className="pointer-events-none absolute inset-0 z-20 rounded-r-[18px] bg-gradient-to-l from-[#201a1e] to-[#161214] opacity-95"
                  style={{ clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%)' }}
                />

                {/* Bottom Triangular Fold with Golden Crease */}
                <div
                  className="pointer-events-none absolute inset-0 z-20 rounded-b-[18px] bg-gradient-to-t from-[#261f24] via-[#1c1619] to-[#141013] shadow-[0_-5px_15px_rgba(0,0,0,0.4)]"
                  style={{ clipPath: 'polygon(0% 100%, 50% 48%, 100% 100%)' }}
                />

                {/* Delicate Gold Piping along Bottom Triangle Fold */}
                <svg
                  className="pointer-events-none absolute inset-0 z-20 h-full w-full"
                  viewBox="0 0 305 205"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <line x1="0" y1="205" x2="152.5" y2="100" stroke="#d6a754" strokeWidth="1" strokeOpacity="0.4" />
                  <line x1="305" y1="205" x2="152.5" y2="100" stroke="#d6a754" strokeWidth="1" strokeOpacity="0.4" />
                </svg>

                {/* ── 3D TOP FLAP (FLIPS UP 180° ON OPEN) ── */}
                <motion.div
                  className="absolute inset-x-0 top-0 z-30 h-full w-full origin-top rounded-t-[18px]"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  animate={
                    isOpeningAnim
                      ? { rotateX: -175, opacity: 0.1 }
                      : { rotateX: 0, opacity: 1 }
                  }
                  transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
                >
                  {/* Top Triangle Fold Shape */}
                  <div
                    className="h-full w-full rounded-t-[18px] border-t border-[#ffd880]/50 bg-gradient-to-b from-[#2e252c] via-[#211a1f] to-[#191317] shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                    style={{ clipPath: 'polygon(0% 0%, 50% 64%, 100% 0%)' }}
                  />

                  {/* Top Flap Golden Border Line */}
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 305 205"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <line x1="0" y1="0" x2="152.5" y2="130" stroke="#ffd880" strokeWidth="1.2" strokeOpacity="0.6" />
                    <line x1="305" y1="0" x2="152.5" y2="130" stroke="#ffd880" strokeWidth="1.2" strokeOpacity="0.6" />
                  </svg>

                  {/* ── WAX SEAL MEDALLION CENTERPIECE ── */}
                  <motion.div
                    animate={
                      isOpeningAnim
                        ? { scale: 1.5, opacity: 0 }
                        : { scale: 1, opacity: 1 }
                    }
                    transition={{ duration: 0.4 }}
                    className="seal-pulse absolute left-1/2 top-[128px] z-40 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#fff3cc] bg-gradient-to-br from-[#f8e09e] via-[#d6a754] to-[#996d24]"
                  >
                    <Crown className="h-6 w-6 text-[#2d200a] drop-shadow-sm" />
                  </motion.div>
                </motion.div>

              </div>
            </div>

            <p className="mt-3 text-[11px] font-medium tracking-wider text-[#d6a754]/80">
              Touchez l’enveloppe ou cliquez ci-dessous
            </p>

            {/* Large Elegant CTA Button */}
            <motion.button
              type="button"
              onClick={handleOpenInvitation}
              disabled={isOpeningAnim}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative mt-5 inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#fde49b] via-[#d6a754] to-[#e4b358] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-[#1a1208] shadow-[0_0_30px_rgba(214,167,84,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_45px_rgba(214,167,84,0.7)] active:scale-95"
            >
              <MailOpen className="h-4 w-4" />
              <span>✨ Ouvrir l’invitation</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </motion.button>

            {/* Quick Preview Link for Admins / Fast Walkthrough */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="mt-4 text-[11px] font-medium text-white/50 underline underline-offset-4 hover:text-white/80 transition"
            >
              Aperçu direct du contenu ↓
            </button>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          PHASE 2 TO 10: INVITATION CONTENT (WHEN OPEN)
      ═══════════════════════════════════════════════════════════════ */}
      {isOpen && (
        <div className="relative z-10 mx-auto flex w-full max-w-[480px] sm:max-w-xl md:max-w-2xl flex-col px-4 py-8 sm:px-6">

          {/* ═════════════════════════════════════════════════════════
              SECTION 2: HERO — THE BIG REVEAL
          ═════════════════════════════════════════════════════════ */}
          <section className="relative flex flex-col items-center justify-center py-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="glass-panel relative w-full rounded-[32px] px-5 py-10 sm:px-8 shadow-2xl"
            >
              {/* Top Celebratory Announcement Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d6a754]/30 bg-[#d6a754]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#f5d88a]">
                <PartyPopper className="h-4 w-4 text-[#e6b85c]" />
                <span>🎉 C’est mon anniversaire !</span>
              </div>

              {/* Optional Avatar / Portrait Medallion */}
              {profilePhoto && (
                <div className="mx-auto my-5 relative h-28 w-28 sm:h-32 sm:w-32">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#d6a754] via-[#fff3cc] to-[#996d24] p-[3px] shadow-[0_0_25px_rgba(230,184,92,0.4)]">
                    <img
                      src={profilePhoto}
                      alt={celebrantName}
                      className="h-full w-full rounded-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Grand Typography Name with Golden Shimmer */}
              <h1 className="gold-shimmer-text gold-glow mt-3 font-serif text-[48px] sm:text-[64px] font-bold leading-[0.95] tracking-tight">
                {celebrantName}
              </h1>

              {/* Age Sub-headline */}
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#d6a754]" />
                <p className="font-serif text-xl sm:text-2xl italic tracking-wide text-[#fde49b]">
                  fête ses <span className="font-bold text-white underline decoration-[#d6a754] decoration-2 underline-offset-4">{celebrantAge} ans</span>
                </p>
                <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#d6a754]" />
              </div>

              {/* Emotional Invitation Message */}
              <p className="mx-auto mt-5 max-w-md text-sm sm:text-base leading-relaxed text-[#f7e8ce]/90">
                {mainDescription}
              </p>

              {/* Save The Date Quick Strip */}
              <div className="mt-6 flex flex-col items-center justify-center border-t border-[#d6a754]/20 pt-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#f5d88a]">
                  <Calendar className="h-4 w-4 text-[#e6b85c]" />
                  <span>{displayDate}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-[#f7e8ce]/75">
                  <Clock className="h-3.5 w-3.5 text-[#e6b85c]" />
                  <span>Dès {displayTime}</span>
                  <span>&bull;</span>
                  <MapPin className="h-3.5 w-3.5 text-[#e6b85c]" />
                  <span>{venueName}</span>
                </div>
              </div>
            </motion.div>

            {/* Scroll Down Prompt */}
            <div className="mt-5 flex flex-col items-center gap-1 text-[#d6a754]/75">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">Découvrir la suite</span>
              <ChevronDown className="h-4 w-4 animate-bounce text-[#e6b85c]" />
            </div>
          </section>

          {/* ═════════════════════════════════════════════════════════
              SECTION 3: LIVE COUNTDOWN
          ═════════════════════════════════════════════════════════ */}
          <section className="relative my-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="glass-panel rounded-[28px] p-6 sm:p-8"
            >
              {countdown.isToday ? (
                <div className="py-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-400/20 px-5 py-2 text-sm font-extrabold text-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.5)]">
                    <PartyPopper className="h-5 w-5" />
                    <span>🎉 C’EST AUJOURD’HUI ! 🎉</span>
                  </div>
                  <p className="mt-2 text-sm text-[#f5d88a]">
                    Le grand jour est arrivé, préparez-vous pour une soirée inoubliable !
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e6b85c]">
                    Le grand jour approche…
                  </p>
                  <h2 className="mt-1 font-serif text-2xl sm:text-3xl italic text-white">
                    Compte à rebours
                  </h2>

                  {/* Countdown 4-box Grid */}
                  <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
                    {[
                      { label: 'JOURS', value: countdown.days },
                      { label: 'HEURES', value: countdown.hours },
                      { label: 'MINUTES', value: countdown.minutes },
                      { label: 'SECONDES', value: countdown.seconds },
                    ].map((unit) => (
                      <div
                        key={unit.label}
                        className="glass-panel-light flex flex-col items-center justify-center rounded-2xl py-3 px-1 sm:py-4 shadow-inner"
                      >
                        <span className="gold-shimmer-text font-serif text-2xl sm:text-3xl font-bold">
                          {String(unit.value).padStart(2, '0')}
                        </span>
                        <span className="mt-1 text-[9px] sm:text-[10px] font-semibold tracking-wider text-[#d6a754]/90">
                          {unit.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </section>

          {/* ═════════════════════════════════════════════════════════
              SECTION 4: EVENT INFORMATION (GLASS CARDS)
          ═════════════════════════════════════════════════════════ */}
          <section className="relative my-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              <div className="text-center mb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e6b85c]">
                  Informations pratiques
                </p>
                <h2 className="mt-1 font-serif text-2xl sm:text-3xl italic text-white">
                  Où & Quand ?
                </h2>
              </div>

              {/* Date & Time Glass Card */}
              <div className="glass-panel flex items-start gap-4 rounded-2xl p-4 sm:p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d6a754]/15 text-[#e6b85c] border border-[#d6a754]/25">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#e6b85c]">Date & Heure</div>
                  <div className="mt-1 font-serif text-lg font-semibold text-white">{displayDate}</div>
                  <div className="flex items-center gap-1.5 text-xs text-[#f7e8ce]/80">
                    <Clock className="h-3.5 w-3.5 text-[#e6b85c]" />
                    <span>Dès {displayTime}</span>
                  </div>
                </div>
              </div>

              {/* Venue & Location Glass Card */}
              <div className="glass-panel flex items-start gap-4 rounded-2xl p-4 sm:p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d6a754]/15 text-[#e6b85c] border border-[#d6a754]/25">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#e6b85c]">Lieu de fête</div>
                  <div className="mt-1 font-serif text-lg font-semibold text-white">{venueName}</div>
                  <div className="text-xs leading-relaxed text-[#f7e8ce]/80">{addressDetails}</div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#d6a754]/40 bg-[#d6a754]/15 px-3.5 py-1.5 text-xs font-semibold text-[#f5d88a] transition hover:bg-[#d6a754]/30"
                    >
                      <Compass className="h-3.5 w-3.5" />
                      <span>📍 Voir l’itinéraire</span>
                      <ExternalLink className="h-3 w-3 text-[#d6a754]" />
                    </a>

                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Anniversaire de ${celebrantName}`)}&details=${encodeURIComponent(mainDescription)}&location=${encodeURIComponent(venueName + ', ' + addressDetails)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Ajouter à l’agenda</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* ═════════════════════════════════════════════════════════
              SECTION 5: THE BIRTHDAY STORY ("QUELQUES SOUVENIRS…")
          ═════════════════════════════════════════════════════════ */}
          <section className="relative my-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e6b85c]">
                Rétrospective
              </p>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl italic text-white">
                Quelques souvenirs…
              </h2>

              {/* Photo Gallery Grid */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {galleryItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    onClick={() => setActivePhoto(item)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#d6a754]/25 bg-[#141113] shadow-md transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.caption}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/25 to-transparent p-3 text-left">
                      <p className="text-xs font-semibold text-white drop-shadow-md">
                        {item.caption}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ═════════════════════════════════════════════════════════
              SECTION 6: SPECIAL HANDWRITTEN MESSAGE ("UN PETIT MOT…")
          ═════════════════════════════════════════════════════════ */}
          <section className="relative my-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[28px] border border-[#e6b85c]/30 bg-gradient-to-br from-[#221b20] via-[#161214] to-[#0f0c0e] p-6 sm:p-8 shadow-2xl"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#e6b85c]">
                  <Heart className="h-3.5 w-3.5 fill-[#e6b85c] text-[#e6b85c]" />
                  <span>Un petit mot…</span>
                </div>

                <div className="mt-4 font-handwriting text-2xl sm:text-3xl leading-relaxed text-[#fde49b]">
                  &ldquo;{handwrittenNote}&rdquo;
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 text-right">
                  <span className="text-xs text-[#d6a754]/80 uppercase tracking-widest">Avec tout mon amour,</span>
                  <span className="font-serif text-lg font-bold text-white">{celebrantName} ❤️</span>
                </div>
              </div>
            </motion.div>
          </section>

          {/* ═════════════════════════════════════════════════════════
              SECTION 7: INTERACTIVE “MAKE A WISH” SECTION
          ═════════════════════════════════════════════════════════ */}
          <section className="relative my-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="glass-panel relative rounded-[32px] p-6 sm:p-8 overflow-hidden shadow-2xl"
            >
              {/* Sparkle burst canvas for Make A Wish */}
              <canvas
                ref={wishCanvasRef}
                className="pointer-events-none absolute inset-0 z-20 h-full w-full"
              />

              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e6b85c]">
                Magie & Souhaits
              </p>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl italic text-white">
                ✨ Faites un vœu pour {celebrantName}
              </h2>

              {/* Glowing 3D-effect Birthday Candle Centerpiece */}
              <div className="relative my-6 flex flex-col items-center justify-center">
                <div
                  className={`candle-halo pointer-events-none absolute -top-8 h-28 w-28 rounded-full transition-all duration-700 ${
                    wishFlameGlow
                      ? 'scale-150 bg-[radial-gradient(circle,_rgba(255,215,0,0.65)_0%,_rgba(255,140,0,0.35)_40%,_transparent_75%)]'
                      : 'bg-[radial-gradient(circle,_rgba(255,215,0,0.35)_0%,_rgba(255,140,0,0.15)_40%,_transparent_70%)]'
                  }`}
                />

                {/* Flickering Animated Flame */}
                <div className="candle-flicker relative z-10 flex flex-col items-center">
                  <div
                    className={`rounded-[50%_50%_40%_40%/60%_60%_40%_40%] shadow-[0_0_18px_rgba(255,200,50,0.9)] transition-all duration-500 ${
                      wishFlameGlow
                        ? 'h-11 w-6 bg-gradient-to-t from-[#ff5500] via-[#ffcc00] to-[#ffffff]'
                        : 'h-8 w-4 bg-gradient-to-t from-[#ff6600] via-[#ffdd33] to-[#ffffff]'
                    }`}
                  />
                  <div className="h-2.5 w-[2px] bg-[#3a2717]" />
                </div>

                {/* Candle Wax Body */}
                <div className="relative -mt-1 h-20 w-8 rounded-t-sm rounded-b-lg border-t border-[#fde49b]/40 bg-gradient-to-b from-[#f8ecd5] via-[#e2cca4] to-[#b3996d] shadow-[0_10px_20px_rgba(0,0,0,0.5),_inset_1px_0_2px_rgba(255,255,255,0.4)]">
                  <div className="absolute -left-0.5 top-2 h-4 w-1.5 rounded-full bg-[#f8ecd5]" />
                  <div className="absolute right-0 top-3 h-5 w-1 rounded-full bg-[#f8ecd5]" />
                </div>

                {/* Candle Golden Base */}
                <div className="h-3 w-16 -mt-1 rounded-full border border-[#d6a754]/60 bg-gradient-to-r from-[#ca953b] via-[#fde49b] to-[#b3802e] shadow-md" />
              </div>

              {/* Heartfelt Confirmation Message After Wish */}
              {wishConfirmed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="my-3 rounded-2xl border border-emerald-400/30 bg-emerald-950/40 p-4 text-center text-emerald-200"
                >
                  <p className="text-sm font-semibold">
                    Votre vœu est arrivé jusqu’à {celebrantName} ❤️
                  </p>
                  <p className="mt-1 text-xs text-emerald-300/80">
                    Merci d’ajouter votre étincelle à cette belle journée !
                  </p>
                  <button
                    type="button"
                    onClick={() => setWishConfirmed(false)}
                    className="mt-2.5 text-[11px] font-semibold text-[#f5d88a] underline underline-offset-4"
                  >
                    Envoyer un autre vœu
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleMakeWish} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Votre prénom (optionnel)"
                    value={guestWishName}
                    onChange={(e) => setGuestWishName(e.target.value)}
                    className="w-full rounded-xl border border-[#d6a754]/30 bg-[#120f11] px-4 py-2.5 text-xs text-[#f7e8ce] placeholder-[#a69578] outline-none focus:border-[#e6b85c]"
                  />
                  <textarea
                    rows={2}
                    placeholder="Écrivez un souhait magique pour la bougie..."
                    value={guestWishText}
                    onChange={(e) => setGuestWishText(e.target.value)}
                    className="w-full rounded-xl border border-[#d6a754]/30 bg-[#120f11] px-4 py-2.5 text-xs text-[#f7e8ce] placeholder-[#a69578] outline-none focus:border-[#e6b85c]"
                  />

                  <button
                    type="submit"
                    disabled={wishFlameGlow}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fde49b] via-[#d6a754] to-[#e4b358] py-3 text-xs font-bold uppercase tracking-widest text-[#1a1208] shadow-[0_0_25px_rgba(214,167,84,0.35)] transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Faire un vœu ✨</span>
                  </button>
                </form>
              )}

              {/* Community Wishes Stream */}
              {wishes.length > 0 && (
                <div className="mt-5 border-t border-[#d6a754]/20 pt-4 text-left">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#d6a754]/80">
                    Livre d’or des souhaits
                  </div>
                  <div className="mt-2.5 space-y-2 max-h-44 overflow-y-auto pr-1">
                    {wishes.slice(0, 4).map((w) => (
                      <div
                        key={w.id}
                        className="glass-panel-light rounded-xl p-3 text-xs text-[#f7e8ce]/90"
                      >
                        <div className="flex items-center justify-between font-semibold text-[#fde49b]">
                          <span>{w.name}</span>
                          <Heart className="h-3 w-3 fill-[#e6b85c] text-[#e6b85c]" />
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-[#f7e8ce]/80">
                          &ldquo;{w.message}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </section>

          {/* ═════════════════════════════════════════════════════════
              SECTION 8: RSVP
          ═════════════════════════════════════════════════════════ */}
          <section id="rsvp-section" className="relative my-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="glass-panel rounded-[32px] p-6 sm:p-8 shadow-2xl"
            >
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e6b85c]">
                  Confirmation
                </p>
                <h2 className="mt-1 font-serif text-2xl sm:text-3xl italic text-white">
                  Vous serez de la fête ? 🎉
                </h2>
                <p className="mt-1.5 text-xs text-[#f7e8ce]/80">
                  Merci de nous répondre pour nous aider à préparer les festivités !
                </p>
              </div>

              {rsvpSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-5 rounded-2xl border border-[#e6b85c]/40 bg-[#d6a754]/10 p-5 text-center"
                >
                  <CheckCircle2 className="mx-auto h-9 w-9 text-[#e6b85c]" />
                  <h3 className="mt-2 font-serif text-lg font-bold text-white">
                    Merci pour votre confirmation !
                  </h3>
                  <p className="mt-1 text-xs text-[#f7e8ce]/90">
                    Votre réponse a bien été prise en compte et transmise à {celebrantName}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRsvpSubmitted(false)}
                    className="mt-3 rounded-full border border-[#d6a754]/30 bg-transparent px-4 py-1 text-xs text-[#f5d88a]"
                  >
                    Modifier ma réponse
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="mt-5 space-y-3.5 text-left">
                  {/* 3 RSVP Buttons */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-[#d6a754]">
                      Votre présence
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => setRsvpAttendance('yes')}
                        className={`flex items-center justify-center rounded-2xl border p-2.5 text-xs font-bold transition ${
                          rsvpAttendance === 'yes'
                            ? 'border-[#e6b85c] bg-[#d6a754]/25 text-[#fde49b] shadow-[0_0_15px_rgba(214,167,84,0.3)]'
                            : 'border-white/10 bg-white/5 text-[#f7e8ce]/80 hover:border-white/20'
                        }`}
                      >
                        Oui, avec plaisir ! ❤️
                      </button>

                      <button
                        type="button"
                        onClick={() => setRsvpAttendance('maybe')}
                        className={`flex items-center justify-center rounded-2xl border p-2.5 text-xs font-bold transition ${
                          rsvpAttendance === 'maybe'
                            ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                            : 'border-white/10 bg-white/5 text-[#f7e8ce]/80 hover:border-white/20'
                        }`}
                      >
                        Peut-être 🤔
                      </button>

                      <button
                        type="button"
                        onClick={() => setRsvpAttendance('no')}
                        className={`flex items-center justify-center rounded-2xl border p-2.5 text-xs font-bold transition ${
                          rsvpAttendance === 'no'
                            ? 'border-rose-400 bg-rose-400/20 text-rose-200'
                            : 'border-white/10 bg-white/5 text-[#f7e8ce]/80 hover:border-white/20'
                        }`}
                      >
                        Je ne pourrai pas venir
                      </button>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-[#d6a754]">
                      Votre Nom & Prénom
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sarah Martin"
                      value={rsvpGuestName}
                      onChange={(e) => setRsvpGuestName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#d6a754]/30 bg-[#120f11] px-4 py-2.5 text-xs text-[#f7e8ce] placeholder-[#a69578] outline-none focus:border-[#e6b85c]"
                    />
                  </div>

                  {/* Guest Count */}
                  {rsvpAttendance === 'yes' && (
                    <div>
                      <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#d6a754]">
                        <Users className="h-3 w-3" />
                        Nombre de personnes
                      </label>
                      <select
                        value={rsvpGuestCount}
                        onChange={(e) => setRsvpGuestCount(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#d6a754]/30 bg-[#120f11] px-4 py-2.5 text-xs text-[#f7e8ce] outline-none focus:border-[#e6b85c]"
                      >
                        <option value="1">1 personne (Moi)</option>
                        <option value="2">2 personnes (+1 accompagnant)</option>
                        <option value="3">3 personnes</option>
                        <option value="4+">4 personnes ou plus</option>
                      </select>
                    </div>
                  )}

                  {/* Optional Message */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-[#d6a754]">
                      Message personnel (optionnel)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Un mot pour l'organisation, allergies, ou petit mot doux..."
                      value={rsvpMessage}
                      onChange={(e) => setRsvpMessage(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#d6a754]/30 bg-[#120f11] px-4 py-2.5 text-xs text-[#f7e8ce] placeholder-[#a69578] outline-none focus:border-[#e6b85c]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!rsvpAttendance}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fde49b] via-[#d6a754] to-[#e4b358] py-3 text-xs font-bold uppercase tracking-widest text-[#1a1208] shadow-[0_0_25px_rgba(214,167,84,0.35)] transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>Confirmer ma réponse via WhatsApp</span>
                  </button>
                </form>
              )}
            </motion.div>
          </section>

          {/* ═════════════════════════════════════════════════════════
              SECTION 9: GIFT / WISHLIST (OPTIONAL)
          ═════════════════════════════════════════════════════════ */}
          {giftItems.length > 0 && (
            <section className="relative my-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="glass-panel rounded-[28px] p-6 sm:p-8"
              >
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#e6b85c]">
                  <Gift className="h-4 w-4 text-[#e6b85c]" />
                  <span>Une petite attention 🎁</span>
                </div>
                <h2 className="mt-1 font-serif text-2xl sm:text-3xl italic text-white">
                  Liste & Cagnotte
                </h2>
                <p className="mt-1.5 text-xs text-[#f7e8ce]/80 max-w-md mx-auto leading-relaxed">
                  Votre présence est le plus précieux des cadeaux. Si vous souhaitez néanmoins participer :
                </p>

                <div className="mt-5 space-y-2.5 text-left">
                  {giftItems.map((gift, idx) => (
                    <div
                      key={idx}
                      className="glass-panel-light flex items-center justify-between gap-3 rounded-2xl p-3.5 transition hover:border-[#d6a754]/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d6a754]/15 text-xl border border-[#d6a754]/25">
                          {gift.icon || '🎁'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{gift.title}</h4>
                          <p className="text-[11px] text-[#f7e8ce]/75 leading-tight">{gift.description}</p>
                        </div>
                      </div>

                      {gift.link && gift.link !== '#' && (
                        <a
                          href={gift.link}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 rounded-full border border-[#d6a754]/40 bg-[#d6a754]/10 px-3.5 py-1.5 text-xs font-semibold text-[#f5d88a] transition hover:bg-[#d6a754]/25"
                        >
                          Participer
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>
          )}

          {/* ═════════════════════════════════════════════════════════
              SECTION 10: FINAL CELEBRATION
          ═════════════════════════════════════════════════════════ */}
          <section ref={finaleSectionRef} className="relative my-8 py-8 text-center">
            {/* Confetti Canvas for Finale */}
            <canvas
              ref={finaleCanvasRef}
              className="pointer-events-none absolute inset-0 z-20 h-full w-full"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center justify-center space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d6a754]/30 bg-black/50 px-4 py-1.5 text-xs font-semibold tracking-[0.35em] text-[#e6b85c] uppercase">
                <Heart className="h-3.5 w-3.5 fill-[#e6b85c]" />
                <span>Merci d’être là ❤️</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl italic text-white">
                {finalClosingMessage}
              </h3>

              {/* Big Luminous Finale Callout */}
              <div className="gold-shimmer-text gold-glow font-serif text-[42px] sm:text-[54px] font-bold leading-tight tracking-tight">
                See you there ✨
              </div>

              <p className="max-w-xs text-xs text-[#f7e8ce]/75">
                Hâte de partager ces éclats de rire et ces souvenirs inoubliables avec vous.
              </p>

              {/* Share Button */}
              <div className="pt-3 flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Anniversaire de ${celebrantName}`,
                        text: `Rejoignez-nous pour fêter les ${celebrantAge} ans de ${celebrantName} !`,
                        url: window.location.href,
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Lien d’invitation copié !');
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d6a754]/40 bg-[#d6a754]/10 px-5 py-2.5 text-xs font-semibold text-[#f5d88a] transition hover:bg-[#d6a754]/20"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Partager l’invitation</span>
                </button>
              </div>

              <div className="pt-6 text-[10px] tracking-[0.3em] text-[#d6a754]/50 uppercase">
                {celebrantName} &bull; {celebrantAge} ans &bull; Invly
              </div>
            </motion.div>
          </section>

        </div>
      )}

      {/* ── Photo Lightbox Modal ── */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            className={`${preview ? 'absolute inset-0' : 'fixed inset-0'} z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md`}
          >
            <div
              className="relative max-h-[85vh] max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-[#120f11]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={activePhoto.url}
                alt={activePhoto.caption}
                className="max-h-[70vh] w-full object-contain"
              />
              <div className="p-3.5 text-center">
                <p className="text-sm font-semibold text-white">{activePhoto.caption}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

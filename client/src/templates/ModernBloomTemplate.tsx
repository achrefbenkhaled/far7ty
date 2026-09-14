import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Sparkles,
  Heart,
  Send,
  ExternalLink,
  ChevronDown,
  Gift,
  Music,
  GlassWater,
  PartyPopper,
} from 'lucide-react';

interface TemplateProps {
  preview?: boolean;
  invitationData?: Record<string, unknown>;
  variant?: string;
}

const sparkles = [
  { left: '8%', top: '4%', size: 16, delay: '0s' },
  { left: '15%', top: '14%', size: 14, delay: '1.2s' },
  { left: '25%', top: '8%', size: 12, delay: '0.6s' },
  { left: '38%', top: '6%', size: 18, delay: '1.8s' },
  { left: '52%', top: '10%', size: 20, delay: '0.3s' },
  { left: '68%', top: '7%', size: 15, delay: '2.1s' },
  { left: '82%', top: '12%', size: 18, delay: '1s' },
  { left: '90%', top: '18%', size: 14, delay: '1.6s' },
  { left: '73%', top: '28%', size: 16, delay: '0.9s' },
  { left: '12%', top: '36%', size: 15, delay: '1.4s' },
  { left: '85%', top: '44%', size: 18, delay: '2.4s' },
  { left: '18%', top: '56%', size: 12, delay: '0.7s' },
  { left: '78%', top: '66%', size: 16, delay: '1.8s' },
  { left: '30%', top: '76%', size: 15, delay: '0.5s' },
  { left: '88%', top: '86%', size: 14, delay: '2.5s' },
  { left: '45%', top: '94%', size: 16, delay: '1.1s' },
];

const defaultGallery = [
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=600&fit=crop',
];

const defaultProgram = [
  { time: '08:00 PM', title: 'Welcome & Cocktail Toast', icon: GlassWater, description: 'Gold champagne welcome drinks and gourmet appetizers as guests arrive.' },
  { time: '09:30 PM', title: 'Cake Cutting & Wishes', icon: PartyPopper, description: 'Blowing out the candles, birthday toast, and sweet dessert bar.' },
  { time: '10:30 PM', title: 'Music & Midnight Party', icon: Music, description: 'Live DJ set, dancing, photo booth fun, and unforgettable moments.' },
];

function useCountdown(targetDateStr?: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 45, hours: 8, minutes: 24, seconds: 12 });

  useEffect(() => {
    let target = targetDateStr ? new Date(targetDateStr).getTime() : NaN;
    if (isNaN(target) || target < Date.now()) {
      target = Date.now() + 45 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateStr]);

  return timeLeft;
}

export default function ModernBloomTemplate({ preview: _preview = false, invitationData }: TemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Map scroll progress to spotlight vertical position (using GPU transform y) and light intensity
  const spotlightY = useTransform(scrollYProgress, [0, 0.25, 0.55, 0.8, 1], ['0px', '450px', '950px', '1450px', '1900px']);
  const lightOpacity = useTransform(scrollYProgress, [0, 0.35, 0.7, 0.88, 1], [0.85, 0.75, 0.4, 0.15, 0.02]);
  const finaleBlackOpacity = useTransform(scrollYProgress, [0.75, 0.92, 1], [0, 0.85, 1]);

  const celebrantName = (invitationData?.celebrantName as string) || (invitationData?.name as string) || 'Olivia Wilson';
  const eventDate = (invitationData?.date as string) || '2024-10-23';
  const displayDate = (invitationData?.dateLabel as string) || 'Monday, 23 October 2024';
  const displayTime = (invitationData?.time as string) || '08:00 PM';
  const venueName = (invitationData?.venue as string) || '123 Anywhere St., Any City';
  const addressDetails = (invitationData?.address as string) || 'ST 12345, Grand Ballroom Suite';
  const mapsUrl = (invitationData?.mapsUrl as string) || 'https://maps.google.com/?q=123+Anywhere+St';
  const description = (invitationData?.description as string) || "Let's celebrate this special day with joy, laughter, gold sparkle, and lots of cake!";
  const galleryImages = (Array.isArray(invitationData?.gallery) && invitationData.gallery.length > 0)
    ? (invitationData.gallery as string[])
    : defaultGallery;

  const countdown = useCountdown(eventDate);

  const programList = Array.isArray(invitationData?.program) && invitationData.program.length > 0
    ? (invitationData.program as Array<Record<string, string>>).map((item) => ({
        time: item.time || '',
        title: item.title || '',
        description: item.description || item.desc || '',
        icon: Sparkles,
      }))
    : defaultProgram;

  const defaultWishesList = [
    { name: 'Sarah & Alex', message: 'Happy Birthday! Can’t wait to celebrate with you under the gold lights! ✨' },
    { name: 'Marcus', message: 'Wishing you the most magical year ahead filled with love and laughter. 🥂' },
  ];

  const initialWishes = Array.isArray(invitationData?.wishes) && invitationData.wishes.length > 0
    ? (invitationData.wishes as Array<{ name: string; message: string }>).map((w) => ({
        name: w.name || '',
        message: w.message || '',
      }))
    : defaultWishesList;

  const [wishes, setWishes] = useState(initialWishes);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestWish, setNewGuestWish] = useState('');

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !newGuestWish.trim()) return;
    setWishes((prev) => [...prev, { name: newGuestName.trim(), message: newGuestWish.trim() }]);
    setNewGuestName('');
    setNewGuestWish('');
  };

  const rsvpPhone = (invitationData?.whatsappPhone as string) || (invitationData?.clientPhone as string) || '33600000000';
  const cleanPhone = rsvpPhone.replace(/[^0-9]/g, '');
  const whatsappMessage = encodeURIComponent(`Hi ${celebrantName}, I am excited to attend your Birthday Party! 🎉`);
  const whatsappUrl = `https://wa.me/${cleanPhone || '33600000000'}?text=${whatsappMessage}`;

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#070707] text-[#f4e6c7] selection:bg-[#d7b066] selection:text-black"
    >
      <style>{`
        @keyframes sparklePulse {
          0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.25; }
          50% { transform: scale(1.3) rotate(45deg); opacity: 1; }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes pulseLight {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .gold-text {
          background: linear-gradient(180deg, #fff7d2 0%, #f3d59d 22%, #d6aa5e 62%, #f8f0dc 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .gold-glow-text {
          text-shadow: 0 0 25px rgba(235, 195, 120, 0.45);
        }
        .sparkle {
          position: absolute;
          display: block;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(250, 224, 162, 0.9), rgba(189, 138, 62, 0.8), rgba(255,255,255,0) 70%);
          box-shadow: 0 0 15px rgba(250, 224, 162, 0.8);
          animation: sparklePulse 4s ease-in-out infinite;
        }
        .sparkle::before,
        .sparkle::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: 2px;
          height: 18px;
          background: linear-gradient(180deg, rgba(255, 215, 153, 0) 0%, rgba(255, 214, 140, 0.9) 35%, rgba(255, 214, 140, 0) 100%);
          transform: translate(-50%, -50%) rotate(45deg);
          border-radius: 9999px;
        }
        .sparkle::after {
          transform: translate(-50%, -50%) rotate(-45deg);
        }
        .background-arc {
          position: absolute;
          inset: 8% 6% 0% 6%;
          border: 1px solid rgba(212, 164, 87, 0.25);
          border-color: rgba(212, 164, 87, 0.35) transparent transparent transparent;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
          transform: rotate(2deg);
          box-shadow: 0 0 38px rgba(222, 174, 91, 0.08);
        }
        .balloon {
          animation: floatUp 4.8s ease-in-out infinite;
        }
        .balloon::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 100%;
          width: 2px;
          height: 56px;
          background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(166,124,70,0.9));
          transform: translateX(-50%);
        }
        .balloon::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -8px;
          width: 10px;
          height: 12px;
          transform: translateX(-50%);
          background: linear-gradient(180deg, #d8b76a, #977938);
          border-radius: 0 0 12px 12px;
        }
        .gift-box {
          animation: sway 6s ease-in-out infinite;
        }
      `}</style>

      {/* ─── DYNAMIC SCROLLING LIGHT SPOTLIGHT & AMBIENT GLOW ─── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{ opacity: lightOpacity }}
      >
        <motion.div
          className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] rounded-full blur-[110px]"
          style={{
            y: spotlightY,
            background: 'radial-gradient(circle, rgba(235, 185, 105, 0.32) 0%, rgba(175, 126, 70, 0.18) 45%, rgba(0, 0, 0, 0) 75%)',
          }}
        />
      </motion.div>

      {/* Deep black transition layer for finale section */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-1 bg-black"
        style={{ opacity: finaleBlackOpacity }}
      />

      {/* Floating Star Sparkles */}
      <div className="pointer-events-none absolute inset-0 z-2 overflow-hidden">
        {sparkles.map((sparkle, index) => (
          <span
            key={index}
            className="sparkle"
            style={{
              left: sparkle.left,
              top: sparkle.top,
              width: sparkle.size,
              height: sparkle.size,
              animationDelay: sparkle.delay,
            }}
          />
        ))}
      </div>

      {/* Main Container Wrapper */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[480px] sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex-col px-3 py-6 sm:px-6">

        {/* ═══════════════ SECTION 1: HERO ENTRANCE CARD ═══════════════ */}
        <section className="relative flex min-h-[92vh] flex-col items-center justify-center py-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative w-full overflow-hidden rounded-[28px] border border-[#d7ba7d]/40 bg-[#050505]/90 px-4 py-10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] backdrop-blur-md"
          >
            <div className="background-arc" />

            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d7ba7d]/30 bg-[#d7ba7d]/10 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.45em] text-[#d7b066]">
                <Sparkles className="h-3 w-3" />
                Digital Invitation
              </div>

              <h1 className="gold-text font-serif text-[48px] italic leading-[0.95] tracking-[-0.04em] sm:text-[54px]">
                Birthday Party
              </h1>

              <p className="mx-auto mt-4 max-w-[300px] text-[13px] leading-6 text-[#ecddbc]/90">
                {description}
              </p>

              <div className="mt-8 gold-text gold-glow-text font-serif text-[54px] leading-none tracking-[-0.04em] sm:text-[62px]">
                {celebrantName}
              </div>

              <div className="mt-8 text-center">
                <div className="text-[11px] font-medium tracking-[0.38em] text-[#f1d8a1]">SAVE THE DATE</div>

                <div className="mt-4 flex items-center justify-center gap-3 text-[#f9ebc3]">
                  <span className="text-[10px] font-medium tracking-[0.35em] text-[#d8b067]">BIRTHDAY</span>
                  <span className="gold-text font-serif text-[34px] leading-none">23</span>
                  <span className="text-[10px] font-medium tracking-[0.35em] text-[#d8b067]">OCTOBER</span>
                </div>

                <div className="mx-auto mt-3 h-px w-[190px] bg-gradient-to-r from-transparent via-[#d8b067] to-transparent" />

                <div className="mt-4 text-[18px] font-semibold tracking-[0.25em] text-[#f2d79a]">{displayTime}</div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-2 text-[14px] leading-snug text-[#f0d7ad]/90">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#d8b067]" />
                  <span className="font-medium">{venueName}</span>
                </div>
                <span className="text-xs opacity-75">{addressDetails}</span>
              </div>
            </div>

            {/* Decorative Floating Balloon */}
            <div className="pointer-events-none absolute bottom-[-14px] left-[32px] z-20 h-[170px] w-[86px] balloon">
              <div className="absolute inset-x-2 top-0 h-[96px] rounded-[46%_46%_50%_50%/52%_52%_48%_48%] border border-[#f0d4a1]/60 bg-[radial-gradient(circle_at_30%_25%,_rgba(255,255,255,0.85),_rgba(235,200,129,0.74)_25%,_rgba(166,125,72,0.7)_60%,_rgba(29,23,18,0.88)_100%)] shadow-[inset_-10px_-8px_18px_rgba(88,57,21,0.45),_0_8px_20px_rgba(0,0,0,0.38)]" />
              <div className="absolute left-1/2 top-[88px] h-[50px] w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#d3b476] to-[#8a6a38]" />
            </div>

            {/* Decorative Swaying Gift Box */}
            <div className="pointer-events-none absolute bottom-[-10px] right-[32px] z-20 flex h-[82px] w-[88px] items-end justify-center gift-box">
              <div className="relative h-[58px] w-[82px] rounded-[10px] border border-[#a67d3a] bg-[linear-gradient(135deg,_#f9e7af_0%,_#c99646_30%,_#6d4d1c_100%)] shadow-[0_12px_24px_rgba(0,0,0,0.35)]">
                <div className="absolute left-1/2 top-0 h-full w-[8px] -translate-x-1/2 bg-[#f5d88a]" />
                <div className="absolute left-0 top-1/2 h-[8px] w-full -translate-y-1/2 bg-[#f5d88a]" />
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[-26px] left-1/2 z-0 h-[180px] w-[180px] -translate-x-1/2 rounded-full border border-[#d1a969]/20 opacity-80" style={{ boxShadow: '0 0 60px rgba(214, 170, 94, 0.12)' }} />
          </motion.div>

          {/* Animated Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-6 flex flex-col items-center gap-1.5 text-center text-[#d7ba7d]/70"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">Scroll Down</span>
            <ChevronDown className="h-4 w-4 animate-bounce text-[#d7b066]" />
          </motion.div>
        </section>

        {/* ═══════════════ SECTION 2: COUNTDOWN & EVENT DETAILS ═══════════════ */}
        <section className="relative my-8 py-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-[26px] border border-[#d7ba7d]/30 bg-[#080808]/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur"
          >
            <p className="text-[10px] font-medium tracking-[0.4em] text-[#d7b066] uppercase">Counting Down To</p>
            <h2 className="mt-1 gold-text font-serif text-3xl italic">The Special Day</h2>

            {/* Countdown Grid */}
            <div className="mt-6 grid grid-cols-4 gap-2">
              {[
                { label: 'DAYS', value: countdown.days },
                { label: 'HOURS', value: countdown.hours },
                { label: 'MINS', value: countdown.minutes },
                { label: 'SECS', value: countdown.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center rounded-2xl border border-[#d7ba7d]/20 bg-gradient-to-b from-[#141210] to-[#080808] p-3 shadow-inner"
                >
                  <span className="gold-text font-serif text-2xl font-bold sm:text-3xl">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="mt-1 text-[9px] font-semibold tracking-widest text-[#d8b067]/80">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Event Time & Venue Info */}
            <div className="mt-8 space-y-4 border-t border-[#d7ba7d]/20 pt-6 text-left">
              <div className="flex items-start gap-3 rounded-xl border border-[#d7ba7d]/15 bg-[#110f0d]/60 p-3.5">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#d8b067]" />
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-[#d8b067] uppercase">Date & Time</div>
                  <div className="text-sm font-medium text-[#f4e6c7]">{displayDate}</div>
                  <div className="text-xs text-[#ecddbc]/70">{displayTime}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#d7ba7d]/15 bg-[#110f0d]/60 p-3.5">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#d8b067]" />
                <div className="flex-1">
                  <div className="text-[10px] font-semibold tracking-wider text-[#d8b067] uppercase">Venue & Location</div>
                  <div className="text-sm font-medium text-[#f4e6c7]">{venueName}</div>
                  <div className="text-xs text-[#ecddbc]/70">{addressDetails}</div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#d7ba7d]/40 bg-[#d7ba7d]/10 px-3.5 py-1.5 text-xs font-semibold text-[#f4e6c7] transition hover:bg-[#d7ba7d]/20"
                  >
                    Get Directions <ExternalLink className="h-3 w-3 text-[#d8b067]" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════ SECTION 3: PARTY PROGRAM / SCHEDULE ═══════════════ */}
        <section className="relative my-8 py-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] font-medium tracking-[0.4em] text-[#d7b066] uppercase">Night Itinerary</p>
            <h2 className="mt-1 gold-text font-serif text-3xl italic">Party Schedule</h2>

            <div className="mt-6 space-y-4 text-left">
              {programList.map((item, idx) => {
                const IconComponent = ('icon' in item && item.icon) ? (item.icon as React.ComponentType<{ className?: string }>) : Sparkles;
                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-2xl border border-[#d7ba7d]/25 bg-[#090807] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                  >
                    <div className="flex items-center justify-between border-b border-[#d7ba7d]/15 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d7ba7d]/15 text-[#d8b067]">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-[#f4e6c7]">{item.title}</span>
                      </div>
                      {item.time && (
                        <span className="rounded-full border border-[#d8b067]/30 bg-[#d8b067]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#d8b067]">
                          {item.time}
                        </span>
                      )}
                    </div>
                    {item.description && <p className="mt-2.5 text-xs leading-relaxed text-[#ecddbc]/80">{item.description}</p>}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* ═══════════════ SECTION 4: MEMORIES GALLERY ═══════════════ */}
        <section className="relative my-8 py-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] font-medium tracking-[0.4em] text-[#d7b066] uppercase">Precious Moments</p>
            <h2 className="mt-1 gold-text font-serif text-3xl italic">Birthday Gallery</h2>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {galleryImages.map((imgUrl, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-[#d7ba7d]/30 bg-[#110f0d] shadow-lg"
                >
                  <img
                    src={imgUrl}
                    alt={`Birthday memory ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-2.5">
                    <span className="text-[10px] font-medium text-[#f4e6c7] flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-[#d8b067]" /> Memories
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══════════════ SECTION 5: GUEST WISHES & RSVP ═══════════════ */}
        <section className="relative my-8 py-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-[28px] border border-[#d7ba7d]/35 bg-[#070707]/95 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
          >
            <p className="text-[10px] font-medium tracking-[0.4em] text-[#d7b066] uppercase">Guest Book</p>
            <h2 className="mt-1 gold-text font-serif text-3xl italic">Wishes & Greetings</h2>

            {/* Display Wishes */}
            <div className="mt-6 space-y-3.5 text-left">
              {wishes.map((w, idx) => (
                <div key={idx} className="rounded-2xl border border-[#d7ba7d]/20 bg-[#0f0e0c] p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#f2d79a] flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 fill-[#d8b067] text-[#d8b067]" /> {w.name}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#ecddbc]/80">&ldquo;{w.message}&rdquo;</p>
                </div>
              ))}
            </div>

            {/* Add Wish Form */}
            <form onSubmit={handleAddWish} className="mt-6 space-y-3 text-left">
              <input
                type="text"
                placeholder="Your Name"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                className="w-full rounded-xl border border-[#d7ba7d]/30 bg-[#141210] px-3.5 py-2.5 text-xs text-[#f4e6c7] placeholder-[#a69578] outline-none focus:border-[#d8b067]"
              />
              <textarea
                rows={2}
                placeholder="Write a birthday wish..."
                value={newGuestWish}
                onChange={(e) => setNewGuestWish(e.target.value)}
                className="w-full rounded-xl border border-[#d7ba7d]/30 bg-[#141210] px-3.5 py-2.5 text-xs text-[#f4e6c7] placeholder-[#a69578] outline-none focus:border-[#d8b067]"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d8b067] to-[#b0873d] py-2.5 text-xs font-bold text-black shadow-lg transition hover:brightness-110"
              >
                <Send className="h-3.5 w-3.5" /> Send Birthday Wish
              </button>
            </form>

            {/* Direct WhatsApp RSVP */}
            <div className="mt-6 border-t border-[#d7ba7d]/20 pt-5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/15 py-3 text-xs font-bold text-[#25D366] transition hover:bg-[#25D366]/25"
              >
                Confirm Attendance via WhatsApp
              </a>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════ SECTION 6: BLACK FINALE SECTION ("SEE YOU THERE") ═══════════════ */}
        <section className="relative my-12 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ba7d]/30 bg-black px-4 py-1.5 text-[10px] font-semibold tracking-[0.4em] text-[#d8b067] uppercase">
              <Gift className="h-3.5 w-3.5 text-[#d8b067]" /> Celebration Awaits
            </div>

            {/* Glowing Big Metallic Gold Text */}
            <div className="gold-text gold-glow-text font-serif text-[52px] leading-tight tracking-tight sm:text-[64px]">
              SEE YOU THERE
            </div>

            <p className="max-w-[300px] text-xs leading-relaxed text-[#ecddbc]/80">
              We can’t wait to celebrate this unforgettable night with laughter, dancing, and memories to cherish forever.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 w-full">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fff7d2] via-[#f3d59d] to-[#d6aa5e] px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest text-black shadow-[0_0_25px_rgba(214,170,94,0.4)] transition hover:scale-105"
              >
                RSVP Now
              </a>
            </div>

            <div className="pt-8 text-[10px] tracking-[0.3em] text-[#d8b067]/50 uppercase">
              {celebrantName} &bull; 2024 Birthday
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Send,
  Crown,
  Navigation,
  ChevronDown,
} from 'lucide-react';

interface TemplateProps {
  preview?: boolean;
  invitationData?: Record<string, unknown>;
}

// ── Real-time Countdown Hook ──
function useCountdown(targetDateStr: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let target = new Date(targetDateStr).getTime();
    if (isNaN(target) || target < Date.now()) {
      target = Date.now() + 45 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000;
    }

    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  return timeLeft;
}

export default function GoldenGlowTemplate({ preview: _preview = false, invitationData }: TemplateProps) {
  const { isRtl: contextIsRtl } = useLanguageTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const invitationStartRef = useRef<HTMLDivElement>(null);

  const [doorsOpen, setDoorsOpen] = useState(false);

  // ── Dynamic Props from Manage Form / invitationData ──
  const groomName = (invitationData?.groomName as string) || 'يوسف';
  const brideName = (invitationData?.brideName as string) || 'سارة';
  const eventDate = (invitationData?.date as string) || '2025-10-18';
  const dayName = (invitationData?.dayName as string) || 'يوم السبت';
  const dayNumber = (invitationData?.dayNumber as string) || '18';
  const yearNumber = (invitationData?.yearNumber as string) || '2025';
  const eventTime = (invitationData?.time as string) || '07:00 مساءً';
  const venueName = (invitationData?.venue as string) || 'قصر الرياض الملكي - القاعة الكبرى';
  const venueAddress = (invitationData?.address as string) || 'طريق الملك فهد، حي النخيل، الرياض';
  const mapsUrl = (invitationData?.mapsUrl as string) || 'https://maps.google.com/?q=royal+palace';
  const customDescription = (invitationData?.description as string) ||
    'بكل فخر واعتزاز، وبمشاعر تفيض سروراً وابتهاجاً، ندعوكم لمشاركتنا فرحة العمر في حفل زفافنا الميمون، لتكتمل سعادتنا بحضوركم الكريم.';

  const rsvpPhone = (invitationData?.whatsappPhone as string) || (invitationData?.clientPhone as string) || '33600000000';
  const cleanPhone = rsvpPhone.replace(/[^0-9]/g, '');

  const isArabic = useMemo(() => {
    return /[\u0600-\u06FF]/.test(brideName + groomName + customDescription) || contextIsRtl;
  }, [brideName, groomName, customDescription, contextIsRtl]);

  const countdown = useCountdown(eventDate);

  // ── Dynamic Schedule ──
  const defaultProgram = [
    { time: '07:00 م', title: 'استقبال الضيوف والشاي الملكي', desc: 'الترحيب بالأهل والأصدقاء وتناول القهوة العربية والحلويات المغربية الفاخرة' },
    { time: '08:30 م', title: 'الزفة الملكية ومراسم الخواتم', desc: 'دخول العروسين في أجواء ملكية مهيبة وتلبيس دبل الزواج المبارك' },
    { time: '10:00 م', title: 'مأدبة العشاء السلطانية', desc: 'بوفيه عشاء ملكي فاخر احتفالاً بهذه الليلة الاستثنائية' },
    { time: '11:30 م', title: 'السهرة الطربية والفرحة الكبرى', desc: 'أجمل الأغاني والموسيقى والتقاط الصور التذكارية مع العروسين' },
  ];

  const programList = Array.isArray(invitationData?.program) && invitationData.program.length > 0
    ? (invitationData.program as Array<Record<string, string>>).map((item) => ({
        time: item.time || '',
        title: item.title || '',
        desc: item.desc || item.description || '',
      }))
    : defaultProgram;

  // ── Dynamic Wishes ──
  const defaultWishes = [
    { name: 'عائلة العريس', message: 'بارك الله لكما وبارك عليكما وجمع بينكما في خير وسعادة وهناء دائم 🤍✨' },
    { name: 'صديقات العروس', message: 'ألف ألف مبروك لأجمل عروسين في الدنيا! ليلتكم ملكية بامتياز 👑💍' },
    { name: 'المهندس كريم', message: 'جعله الله زواج الدهر وبالرفاه والبنين يا رب العالمين 🌸🥂' },
  ];

  const initialWishes = Array.isArray(invitationData?.wishes) && invitationData.wishes.length > 0
    ? (invitationData.wishes as Array<{ name: string; message: string }>).map((w) => ({
        name: w.name || '',
        message: w.message || '',
      }))
    : defaultWishes;

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

  const handleOpenDoors = () => {
    setDoorsOpen(true);
    setTimeout(() => {
      invitationStartRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 1200);
  };

  const whatsappMessage = encodeURIComponent(`السلام عليكم، نبارك لـ ${groomName} و ${brideName} ويسعدنا تأكيد حضورنا في حفل الزفاف الملكي! 💍👑`);
  const whatsappUrl = `https://wa.me/${cleanPhone || '33600000000'}?text=${whatsappMessage}`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const ambientGlow = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 0.85, 0.35]);

  return (
    <div
      ref={containerRef}
      dir={isArabic ? 'rtl' : 'ltr'}
      className="relative min-h-screen w-full overflow-hidden text-[#F3E5AB] selection:bg-[#D4AF37] selection:text-black font-sans"
      style={{
        backgroundColor: '#070E1C',
        backgroundImage: `
          radial-gradient(ellipse at 50% 25%, rgba(8, 16, 32, 0.75) 0%, rgba(4, 8, 16, 0.94) 80%),
          url('/templates/zellige-pattern.png')
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: 'cover, 340px auto',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ── Ambient Reactive Glow ── */}
      <motion.div
        style={{ opacity: ambientGlow }}
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_25%,rgba(212,175,55,0.25),transparent_70%)]"
      />
      {/* ── Global Styles & Moroccan Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa:wght@400;700&family=Cinzel:wght@400;600;700;900&family=Playfair+Display:ital,wght@0,500;0,700;1,600&family=Tajawal:wght@300;400;500;700;800&display=swap');

        .font-ruqaa { font-family: 'Aref Ruqaa', 'Amiri', serif; }
        .font-amiri { font-family: 'Amiri', serif; }
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-tajawal { font-family: 'Tajawal', sans-serif; }

        /* Metallic Gold Gradient Text */
        .gold-shimmer-text {
          background: linear-gradient(135deg, #FFF6D1 0%, #F5D77F 25%, #D4AF37 50%, #AA771C 75%, #FDE08B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* 3D Door Hinge Transforms */
        .door-3d-perspective {
          perspective: 1800px;
          perspective-origin: 50% 45%;
        }

        .door-leaf-left {
          transform-origin: left center;
          transition: transform 1.8s cubic-bezier(0.22, 1, 0.36, 1);
          transform-style: preserve-3d;
        }

        .door-leaf-right {
          transform-origin: right center;
          transition: transform 1.8s cubic-bezier(0.22, 1, 0.36, 1);
          transform-style: preserve-3d;
        }

        /* Pulsing gold ray animation */
        @keyframes rayShimmer {
          0%, 100% { opacity: 0.3; transform: scale(0.98) rotate(0deg); }
          50% { opacity: 0.8; transform: scale(1.04) rotate(2deg); }
        }

        .ray-anim {
          animation: rayShimmer 4s ease-in-out infinite;
        }

        /* Floating gold dust particle */
        @keyframes goldDust {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
          100% { transform: translateY(0px) rotate(360deg); opacity: 0.1; }
        }

        .dust-particle {
          animation: goldDust 6s ease-in-out infinite;
        }
      `}</style>

      {/* ── Ambient Background Gold Particles ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="dust-particle absolute rounded-full bg-[#E5C158]"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${(i * 0.4) % 6}s`,
              boxShadow: '0 0 8px rgba(229,193,88,0.8)',
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 1: THE REALISTIC MOROCCAN ROYAL PALACE BRASS ENTRANCE GATE (REAL PHOTO)
         ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center px-3 py-6 sm:px-6 sm:py-10 z-10">
        
        {/* ─── THE PHOTOREALISTIC DOOR & 3D OPENING WRAPPER ─── */}
        <div className="door-3d-perspective relative mx-auto w-full max-w-[360px] sm:max-w-[420px] md:max-w-[460px]">
          
          {/* Main Door Outer Frame Container */}
          <div
            className="relative h-[540px] sm:h-[620px] md:h-[680px] w-full overflow-hidden rounded-t-[180px] sm:rounded-t-[210px] md:rounded-t-[230px] rounded-b-2xl border-4 border-[#D4AF37]/90 bg-[#040810] shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_70px_rgba(212,175,55,0.35)]"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* ── INTERIOR PALACE VIEW (REVEALED BEHIND REAL DOORS WHEN OPEN) ── */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-all duration-1000"
              style={{
                opacity: doorsOpen ? 1 : 0.05,
                background: 'radial-gradient(circle at 50% 35%, rgba(212,175,55,0.35) 0%, rgba(18,33,61,0.95) 60%, #060B17 100%)',
                transform: doorsOpen ? 'scale(1)' : 'scale(0.92)',
              }}
            >
              {/* Golden Light Beam Burst */}
              <div className="ray-anim pointer-events-none absolute h-80 w-80 rounded-full bg-[#FFE58F]/30 blur-3xl" />

              <div className="relative z-10 flex flex-col items-center space-y-3.5">
                <div className="rounded-full border border-[#D4AF37] bg-[#D4AF37]/25 p-3 shadow-[0_0_30px_rgba(212,175,55,0.6)]">
                  <Crown className="h-7 w-7 text-[#FFF6D1]" />
                </div>
                
                <span className="font-tajawal text-xs font-bold tracking-[0.3em] uppercase text-[#D4AF37]">
                  {isArabic ? 'مرحباً بكم في ليلتنا الملكية' : 'Welcome to Our Royal Celebration'}
                </span>

                <h2 className="font-ruqaa text-3xl sm:text-4xl md:text-5xl text-[#FFF6D1] drop-shadow-[0_4px_15px_rgba(212,175,55,0.5)]">
                  {groomName} &amp; {brideName}
                </h2>

                <p className="max-w-[280px] text-xs sm:text-sm leading-relaxed text-[#F3E5AB] font-tajawal">
                  {dayName} · {dayNumber} {yearNumber}
                </p>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => invitationStartRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#AA771C] px-6 py-3 text-xs font-black uppercase tracking-wider text-[#1A1104] shadow-[0_0_30px_rgba(212,175,55,0.7)] transition hover:scale-105"
                  >
                    <span>{isArabic ? 'تصفح تفاصيل الحفل' : 'Explore Invitation'}</span>
                    <ChevronDown className="h-4 w-4 animate-bounce" />
                  </button>
                </div>
              </div>
            </div>

            {/* ═════════ THE REAL PHOTOGRAPHIC DOUBLE DOORS ═════════ */}
            
            {/* LEFT DOOR LEAF (SLICED FROM REAL PHOTO) */}
            <div
              onClick={!doorsOpen ? handleOpenDoors : undefined}
              className={`door-leaf-left absolute top-0 bottom-0 left-0 w-1/2 overflow-hidden z-20 cursor-pointer shadow-2xl ${
                doorsOpen ? 'pointer-events-none' : ''
              }`}
              style={{
                transform: doorsOpen ? 'rotateY(-118deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Real Photo Image (Left Half) */}
              <img
                src="/templates/moroccan-palace-door.png"
                alt="Moroccan Royal Palace Brass Door Left Leaf"
                className="absolute top-0 left-0 h-full w-[200%] max-w-none object-cover pointer-events-none select-none"
                style={{
                  filter: 'contrast(1.06) brightness(1.03)',
                }}
              />
              {/* Golden 3D Bevel & Light Sheen Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FFEAA7] via-[#C59B27] to-[#734A06] opacity-80" />
            </div>

            {/* RIGHT DOOR LEAF (SLICED FROM REAL PHOTO) */}
            <div
              onClick={!doorsOpen ? handleOpenDoors : undefined}
              className={`door-leaf-right absolute top-0 bottom-0 right-0 w-1/2 overflow-hidden z-20 cursor-pointer shadow-2xl ${
                doorsOpen ? 'pointer-events-none' : ''
              }`}
              style={{
                transform: doorsOpen ? 'rotateY(118deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Real Photo Image (Right Half) */}
              <img
                src="/templates/moroccan-palace-door.png"
                alt="Moroccan Royal Palace Brass Door Right Leaf"
                className="absolute top-0 right-0 h-full w-[200%] max-w-none object-cover pointer-events-none select-none"
                style={{
                  left: '-100%',
                  filter: 'contrast(1.06) brightness(1.03)',
                }}
              />
              {/* Golden 3D Bevel & Light Sheen Overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/30 pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FFEAA7] via-[#C59B27] to-[#734A06] opacity-80" />
            </div>

            {/* ── INTERACTIVE TAP MEDALLION (CENTER SEAL) ── */}
            {!doorsOpen && (
              <div
                onClick={handleOpenDoors}
                className="group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 cursor-pointer text-center"
              >
                {/* Glowing Aura Ring */}
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77F] opacity-75 blur-xl group-hover:opacity-100 transition duration-300 animate-pulse" />

                <div className="relative flex flex-col items-center justify-center rounded-full border-2 border-[#FFEAA7] bg-gradient-to-br from-[#8A5A00] via-[#5A3A04] to-[#1A0F02] p-4 sm:p-5 shadow-[0_0_35px_rgba(212,175,55,0.9)] transition-transform duration-300 group-hover:scale-110">
                  <Crown className="h-7 w-7 text-[#FFEAA7] animate-bounce" />
                  <span className="mt-1 text-[11px] font-black uppercase tracking-wider text-[#FFF6D1] font-tajawal drop-shadow">
                    {isArabic ? 'انقر لفتح الباب' : 'Tap to Open'}
                  </span>
                  <span className="text-[9px] text-[#F5D77F] font-semibold">
                    {isArabic ? 'الدعوة الملكية' : 'Royal Palace'}
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 2: REVEALED ROYAL PALACE INVITATION CONTENT (SCROLLABLE & SMOOTH)
         ═══════════════════════════════════════════════════════════════════════════ */}
      <div
        ref={invitationStartRef}
        className="relative mx-auto w-full max-w-[460px] sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-4 py-8 sm:px-6 z-10"
      >
        
        {/* ─── CARD 1: ROYAL BISMILLAH & COUPLE HERO ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative my-6 rounded-[28px] border-2 border-[#D4AF37]/50 bg-gradient-to-b from-[#0F1A30] via-[#091122] to-[#060B17] p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(212,175,55,0.15)]"
        >
          {/* Moroccan Polylobed Top Crest */}
          <div className="flex flex-col items-center space-y-2">
            <span className="font-amiri text-lg sm:text-xl text-[#F5D77F]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-1" />
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              {isArabic ? 'دعوة لحضور حفل الزفاف المبارك' : 'Royal Wedding Celebration'}
            </p>
          </div>

          {/* Couple Names in Gilded Arabic / Serif Typography */}
          <div className="my-6">
            <h1 className="font-ruqaa text-4xl sm:text-6xl text-[#FFF6D1] drop-shadow-[0_4px_15px_rgba(212,175,55,0.4)]">
              {groomName}
            </h1>
            <div className="my-2 flex items-center justify-center gap-4">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <Heart className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <h1 className="font-ruqaa text-4xl sm:text-6xl text-[#FFF6D1] drop-shadow-[0_4px_15px_rgba(212,175,55,0.4)]">
              {brideName}
            </h1>
          </div>

          {/* Poetic Invitation Verse */}
          <p className="mx-auto max-w-lg text-xs sm:text-sm leading-relaxed text-[#F3E5AB]/90 font-tajawal">
            {customDescription}
          </p>

          {/* Key Event Badges */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#142340]/60 p-3.5 text-center">
              <Calendar className="mx-auto h-5 w-5 text-[#F5D77F]" />
              <p className="mt-1 text-[11px] font-bold text-[#FFF6D1] font-tajawal">{dayName}</p>
              <p className="text-[10px] text-[#D4AF37]">{dayNumber} / {yearNumber}</p>
            </div>
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#142340]/60 p-3.5 text-center">
              <Clock className="mx-auto h-5 w-5 text-[#F5D77F]" />
              <p className="mt-1 text-[11px] font-bold text-[#FFF6D1] font-tajawal">{eventTime}</p>
              <p className="text-[10px] text-[#D4AF37]">{isArabic ? 'مساءً' : 'Evening'}</p>
            </div>
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#142340]/60 p-3.5 text-center">
              <MapPin className="mx-auto h-5 w-5 text-[#F5D77F]" />
              <p className="mt-1 text-[11px] font-bold text-[#FFF6D1] font-tajawal line-clamp-1">{venueName}</p>
              <p className="text-[10px] text-[#D4AF37] line-clamp-1">{venueAddress}</p>
            </div>
          </div>
        </motion.section>

        {/* ─── CARD 2: GILDED COUNTDOWN TIMER ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative my-8 rounded-[28px] border border-[#D4AF37]/40 bg-[#0B1324]/90 p-6 text-center shadow-xl backdrop-blur-md"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            {isArabic ? 'العد التنازلي لليلتنا الكبرى' : 'Countdown to Forever'}
          </span>
          <h3 className="mt-1 font-ruqaa text-2xl sm:text-3xl text-[#FFF6D1]">
            {isArabic ? 'موعد الفرح الملكي' : 'The Royal Grand Date'}
          </h3>

          <div className="mt-5 grid grid-cols-4 gap-2.5 sm:gap-4">
            {[
              { val: countdown.days, label: isArabic ? 'أيام' : 'Days' },
              { val: countdown.hours, label: isArabic ? 'ساعات' : 'Hours' },
              { val: countdown.minutes, label: isArabic ? 'دقائق' : 'Mins' },
              { val: countdown.seconds, label: isArabic ? 'ثواني' : 'Secs' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#192B4F] to-[#0D182E] p-3 sm:p-4 shadow-md"
              >
                <span className="font-cinzel text-xl sm:text-3xl font-black text-[#FFF6D1]">
                  {String(item.val).padStart(2, '0')}
                </span>
                <span className="mt-1 text-[10px] font-bold text-[#D4AF37] font-tajawal">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─── CARD 3: ROYAL CELEBRATION SCHEDULE ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative my-8 rounded-[28px] border border-[#D4AF37]/40 bg-[#0B1324]/90 p-6 text-center shadow-xl backdrop-blur-md"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            {isArabic ? 'برنامج الحفل الملكي' : 'Celebration Schedule'}
          </span>
          <h3 className="mt-1 font-ruqaa text-2xl sm:text-3xl text-[#FFF6D1]">
            {isArabic ? 'فقرات الأمسية السعيدة' : 'Evening Programme'}
          </h3>

          <div className="mt-6 space-y-3.5 text-right">
            {programList.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#D4AF37]/25 bg-[#0F1C36] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-2">
                  <span className="font-bold text-sm sm:text-base text-[#FFF6D1] font-tajawal">
                    {item.title}
                  </span>
                  {item.time && (
                    <span className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-3 py-0.5 text-xs font-bold text-[#F5D77F]">
                      {item.time}
                    </span>
                  )}
                </div>
                {item.desc && (
                  <p className="mt-2 text-xs leading-relaxed text-[#F3E5AB]/80 font-tajawal">
                    {item.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─── CARD 4: VENUE & GOOGLE MAPS NAVIGATION ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative my-8 rounded-[28px] border border-[#D4AF37]/40 bg-[#0B1324]/90 p-6 text-center shadow-xl backdrop-blur-md"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            {isArabic ? 'موقع الحفل والتوجيهات' : 'Venue & Directions'}
          </span>
          <h3 className="mt-1 font-ruqaa text-2xl sm:text-3xl text-[#FFF6D1]">
            {venueName}
          </h3>
          <p className="mt-1 text-xs text-[#F3E5AB]/80 font-tajawal">
            {venueAddress}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#AA771C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#1A1104] shadow-lg transition hover:scale-105"
            >
              <Navigation className="h-4 w-4" />
              <span>{isArabic ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}</span>
            </a>
          </div>
        </motion.section>

        {/* ─── CARD 5: GUEST WISHES & LIVE GUESTBOOK ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative my-8 rounded-[28px] border border-[#D4AF37]/40 bg-[#0B1324]/90 p-6 text-center shadow-xl backdrop-blur-md"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            {isArabic ? 'دفتر التهاني والتبريكات' : 'Guestbook Wishes'}
          </span>
          <h3 className="mt-1 font-ruqaa text-2xl sm:text-3xl text-[#FFF6D1]">
            {isArabic ? 'كلمات المحبة من الأهل والأصدقاء' : 'Warm Wishes from Loved Ones'}
          </h3>

          {/* List of Wishes */}
          <div className="mt-6 space-y-3.5 text-right">
            {wishes.map((w, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#D4AF37]/20 bg-[#0F1C36] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F5D77F] flex items-center gap-1.5 font-tajawal">
                    <Heart className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" /> {w.name}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[#F3E5AB]/90 leading-relaxed font-tajawal">
                  &ldquo;{w.message}&rdquo;
                </p>
              </div>
            ))}
          </div>

          {/* Add Wish Form */}
          <form onSubmit={handleAddWish} className="mt-6 space-y-3 text-right">
            <input
              type="text"
              placeholder={isArabic ? 'اسم المهنئ الكريم' : 'Your Name'}
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              className="w-full rounded-xl border border-[#D4AF37]/30 bg-[#080D1A] px-3.5 py-2.5 text-xs text-[#FFF6D1] placeholder-[#A69578] outline-none focus:border-[#F5D77F]"
            />
            <textarea
              rows={2}
              placeholder={isArabic ? 'اكتب كلمة تهنئة للعروسين...' : 'Write your warm wish for the couple...'}
              value={newGuestWish}
              onChange={(e) => setNewGuestWish(e.target.value)}
              className="w-full rounded-xl border border-[#D4AF37]/30 bg-[#080D1A] px-3.5 py-2.5 text-xs text-[#FFF6D1] placeholder-[#A69578] outline-none focus:border-[#F5D77F]"
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA771C] py-2.5 text-xs font-bold text-[#1A1104] shadow-md transition hover:brightness-110"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isArabic ? 'إرسال التهنئة' : 'Send Wish'}</span>
            </button>
          </form>

          {/* Direct WhatsApp RSVP */}
          <div className="mt-6 border-t border-[#D4AF37]/20 pt-5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366]/50 bg-[#25D366]/15 py-3 text-xs font-bold text-[#25D366] transition hover:bg-[#25D366]/25 shadow-lg"
            >
              <span>{isArabic ? 'تأكيد الحضور عبر الواتساب (WhatsApp RSVP)' : 'Confirm Attendance via WhatsApp'}</span>
            </a>
          </div>
        </motion.section>

        {/* ─── CARD 6: GRAND ROYAL PALACE FINALE ("نراكم في ليلتنا الملكية") ─── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8 }}
          className="relative my-10 rounded-[32px] border-2 border-[#D4AF37] bg-gradient-to-b from-[#132342] via-[#0B1529] to-[#040812] p-8 text-center shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(212,175,55,0.2)]"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#0E1729] px-4 py-1.5 text-[11px] font-bold text-[#F5D77F]">
            <Crown className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>{isArabic ? 'فرحتنا تكتمل بوجودكم' : 'Joy is Complete With Your Presence'}</span>
          </div>

          <div className="my-5 font-ruqaa text-5xl sm:text-6xl text-[#FFF6D1] drop-shadow-[0_4px_20px_rgba(212,175,55,0.5)]">
            {isArabic ? 'نراكم هناك' : 'See You There'}
          </div>

          <p className="mx-auto max-w-sm text-xs sm:text-sm leading-relaxed text-[#F3E5AB]/90 font-tajawal">
            {isArabic
              ? 'حضوركم شرف عظيم يزيد من بهجة ليلتنا الملكية السعيدة، دامت أيامكم عامرة بالأفراح والمسرات.'
              : 'Your presence is a true honor that makes our royal night complete and unforgettable.'}
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#AA771C] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-[#1A1104] shadow-[0_0_35px_rgba(212,175,55,0.6)] transition hover:scale-105"
            >
              {isArabic ? 'تأكيد الحضور الآن 🤍' : 'Confirm RSVP Now 🤍'}
            </a>
          </div>

          <div className="mt-8 text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]/50 font-tajawal">
            {groomName} &amp; {brideName} · {yearNumber}
          </div>
        </motion.section>

      </div>
    </div>
  );
}

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import {
  GraduationCap,
  Award,
  Trophy,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Send,
  Sparkles,
  Navigation,
  ChevronDown,
  Scroll,
} from 'lucide-react';

interface TemplateProps {
  preview?: boolean;
  invitationData?: Record<string, unknown>;
}

interface TossedCap {
  id: number;
  x: number;
  startY: number;
  rotation: number;
  scale: number;
  speed: number;
}

// ── Realistic SVG Graduation Mortarboard Component ──
function MortarboardSVG({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="currentColor"
      className={`select-none ${className}`}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cap Diamond Top (Mortarboard) */}
      <polygon points="50,5 95,25 50,45 5,25" />
      {/* Cap Skull Skullcap Base */}
      <path d="M22,33 L22,50 C22,62 78,62 78,50 L78,33 C68,40 58,42 50,42 C42,42 32,40 22,33 Z" />
      {/* Central Button / Stud */}
      <circle cx="50" cy="25" r="3" fill="#D4AF37" />
      {/* Golden / Black Tassel Cord */}
      <path
        d="M50,25 Q35,32 30,48 Q28,58 32,70"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Tassel Fringe / Ribbon */}
      <polygon points="28,68 36,68 34,78 30,78" fill="#D4AF37" />
    </svg>
  );
}

// ── Real-time Countdown Hook ──
function useCountdown(targetDateStr: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let target = new Date(targetDateStr).getTime();
    if (isNaN(target) || target < Date.now()) {
      target = Date.now() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000;
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

export default function CorporateLuxeTemplate({ preview = false, invitationData }: TemplateProps) {
  const { isRtl: contextIsRtl } = useLanguageTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // ── Dynamic Props from Manage Form / invitationData ──
  const graduateName = (invitationData?.graduateName as string) ||
    (invitationData?.celebrantName as string) ||
    (invitationData?.brideName as string) ||
    (invitationData?.title as string) ||
    'المهندس أحمد المنصور';

  const degree = (invitationData?.degree as string) ||
    (invitationData?.subtitle as string) ||
    'بكالوريوس هندسة الذكاء الاصطناعي';

  const university = (invitationData?.university as string) ||
    (invitationData?.companyName as string) ||
    'جامعة الملك فهد للبترول والمعادن';

  const honors = (invitationData?.honors as string) || 'مرتبة الشرف الأولى';
  const classYear = (invitationData?.classYear as string) || 'Class of 2025';

  const eventDate = (invitationData?.date as string) || '2025-07-20';
  const dayName = (invitationData?.dayName as string) || 'يوم الأحد';
  const dayNumber = (invitationData?.dayNumber as string) || '20';
  const yearNumber = (invitationData?.yearNumber as string) || '2025';
  const eventTime = (invitationData?.time as string) || '07:30 مساءً';
  const venueName = (invitationData?.venue as string) || 'قاعة القصر الكبرى للاحتفالات والمؤتمرات';
  const venueAddress = (invitationData?.address as string) || 'طريق التميز الأكاديمي، حي النخيل، الرياض';
  const mapsUrl = (invitationData?.mapsUrl as string) || 'https://maps.google.com/?q=graduation+hall';

  const customDescription = (invitationData?.description as string) ||
    'بمشاعر الفخر والاعتزاز وبتوفيق من الله العلي القدير، يسرنا دعوتكم لمشاركتنا فرحة تخرج نجلنا واحتفالنا بنيله درجة البكالوريوس مع مرتبة الشرف، لتكتمل سعادتنا وتتوج جهودنا بحضوركم ومشاركتكم الكريمة.';

  const rsvpPhone = (invitationData?.whatsappPhone as string) || (invitationData?.clientPhone as string) || '33600000000';
  const cleanPhone = rsvpPhone.replace(/[^0-9]/g, '');

  const isArabic = useMemo(() => {
    return /[\u0600-\u06FF]/.test(graduateName + degree + customDescription) || contextIsRtl;
  }, [graduateName, degree, customDescription, contextIsRtl]);

  const countdown = useCountdown(eventDate);

  // ── Cap Toss Interactive State ──
  const [tossedCaps, setTossedCaps] = useState<TossedCap[]>([]);
  const [tossCount, setTossCount] = useState(0);

  const handleTossCap = () => {
    setTossCount((prev) => prev + 1);
    const newCaps: TossedCap[] = [];

    for (let i = 0; i < 28; i++) {
      newCaps.push({
        id: Date.now() + i + Math.random(),
        x: Math.random() * 92 + 4, // percentage
        startY: Math.random() * 15 + 85,
        rotation: (Math.random() - 0.5) * 480,
        scale: Math.random() * 0.7 + 0.6,
        speed: Math.random() * 1.5 + 3.2,
      });
    }

    setTossedCaps((prev) => [...prev, ...newCaps]);
    setTimeout(() => {
      setTossedCaps((prev) => prev.filter((c) => !newCaps.some((n) => n.id === c.id)));
    }, 4500);
  };

  // ── Dynamic Schedule ──
  const defaultProgram = [
    { time: '07:30 م', title: 'استقبال الضيوف الكرام والترحيب', desc: 'الترحيب بالأهل والأساتذة والأصدقاء وتقديم القهوة العربية والضيافة الفاخرة' },
    { time: '08:30 م', title: 'المسيرة الأكاديمية وموكب الخريج', desc: 'دخول موكب الخريج واستلام شهادة التخرج ووسام التفوق الأكاديمي' },
    { time: '09:30 م', title: 'كلمة الخريج ومراسم رمي القبعات', desc: 'كلمة امتنان وشكر للأهل ولحظة رمي قبعات التخرج الاحتفالية 🎓' },
    { time: '10:15 م', title: 'مأدبة العشاء الفاخرة', desc: 'بوفيه عشاء ملكي فاخر احتفاءً بهذا الإنجاز العلمي الكبير' },
    { time: '11:15 م', title: 'السهرة الاحتفالية والتقاط الصور التذكارية', desc: 'أجمل الأغاني والموسيقى والتقاط الصور التذكارية مع الخريج' },
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
    { name: 'عائلة الخريج', message: 'ألف ألف مبروك التخرج والتفوق يا فخرنا وسندنا! من نجاح لنجاح دائم يا رب العالمين 🎓🌟' },
    { name: 'د. خالد العمري', message: 'مبارك التخرج مع مرتبة الشرف الأولى، كنت طالباً متميزاً ومثابراً ومستقبلك مشرق بإذن الله 👑📚' },
    { name: 'أصدقاء الدفعة', message: 'مبروك يا مهندسنا الغالي! ليلة استثنائية وتتويج مستحق لسنوات الجد والاجتهاد 🥂🎉' },
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

  const whatsappMessage = encodeURIComponent(`السلام عليكم، ألف مبروك تخرج ${graduateName}! يسعدنا تأكيد حضورنا في حفل التخرج البهيج 🎓✨`);
  const whatsappUrl = `https://wa.me/${cleanPhone || '33600000000'}?text=${whatsappMessage}`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Parallax transforms for flying background caps on scroll
  const capY1 = useTransform(scrollYProgress, [0, 1], [0, -320]);
  const capY2 = useTransform(scrollYProgress, [0, 1], [0, -450]);
  const capY3 = useTransform(scrollYProgress, [0, 1], [0, -280]);
  const capRotate1 = useTransform(scrollYProgress, [0, 1], [-15, 35]);
  const capRotate2 = useTransform(scrollYProgress, [0, 1], [25, -40]);

  return (
    <div
      ref={containerRef}
      dir={isArabic ? 'rtl' : 'ltr'}
      className="relative min-h-screen w-full overflow-hidden bg-[#FFFFFF] text-[#111111] selection:bg-[#D4AF37] selection:text-black font-sans"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% 10%, rgba(212, 175, 55, 0.08) 0%, transparent 60%),
          linear-gradient(to bottom, #FFFFFF 0%, #FAFAFA 50%, #F5F5F5 100%)
        `,
      }}
    >
      {/* ── Global Styles & Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa:wght@400;700&family=Cinzel:wght@400;600;700;900&family=Playfair+Display:ital,wght@0,500;0,700;1,600&family=Tajawal:wght@300;400;500;700;800;900&display=swap');

        .font-ruqaa { font-family: 'Aref Ruqaa', 'Amiri', serif; }
        .font-amiri { font-family: 'Amiri', serif; }
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-tajawal { font-family: 'Tajawal', sans-serif; }

        /* Crisp Black Text with Subtle Depth */
        .black-title {
          color: #0A0A0A;
          text-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }

        /* Metallic Gold Gradient Text */
        .gold-shimmer-text {
          background: linear-gradient(135deg, #B8860B 0%, #D4AF37 35%, #AA771C 70%, #8A5A00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Subtle Gold Foil Card Border */
        .luxury-white-card {
          background: #FFFFFF;
          border: 1px solid rgba(212, 175, 55, 0.35);
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.06), 0 2px 10px rgba(212, 175, 55, 0.1);
        }

        /* Tossed cap animation */
        @keyframes tossFlight {
          0% {
            transform: translateY(0vh) rotate(0deg) scale(0.7);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(-125vh) rotate(480deg) scale(1.15);
            opacity: 0;
          }
        }

        .flying-cap-item {
          animation: tossFlight 4.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* Gentle floating animation for background caps */
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(6deg); }
        }

        .ambient-cap-1 { animation: floatGentle 6s ease-in-out infinite; }
        .ambient-cap-2 { animation: floatGentle 7.5s ease-in-out infinite 1s; }
        .ambient-cap-3 { animation: floatGentle 8.5s ease-in-out infinite 2s; }
      `}</style>

      {/* ── PARALLAX AMBIENT BACKGROUND GRADUATION CAPS (SCATTERED SILHOUETTES) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        
        {/* Top Left Floating Cap */}
        <motion.div
          style={{ y: capY1, rotate: capRotate1 }}
          className="ambient-cap-1 absolute -top-4 -left-6 sm:left-6 opacity-15 text-black w-24 sm:w-36"
        >
          <MortarboardSVG />
        </motion.div>

        {/* Top Right Floating Cap */}
        <motion.div
          style={{ y: capY2, rotate: capRotate2 }}
          className="ambient-cap-2 absolute top-16 -right-6 sm:right-10 opacity-20 text-black w-28 sm:w-44"
        >
          <MortarboardSVG />
        </motion.div>

        {/* Mid Left Floating Cap */}
        <motion.div
          style={{ y: capY3 }}
          className="ambient-cap-3 absolute top-[38%] left-2 sm:left-12 opacity-15 text-black w-20 sm:w-32"
        >
          <MortarboardSVG />
        </motion.div>

        {/* Mid Right Floating Cap */}
        <motion.div
          style={{ y: capY1 }}
          className="ambient-cap-1 absolute top-[55%] right-3 sm:right-16 opacity-15 text-black w-24 sm:w-36"
        >
          <MortarboardSVG />
        </motion.div>

        {/* Bottom Floating Cap */}
        <motion.div
          style={{ y: capY2 }}
          className="ambient-cap-2 absolute top-[75%] left-6 sm:left-24 opacity-15 text-black w-28 sm:w-40"
        >
          <MortarboardSVG />
        </motion.div>

        {/* Floating Gold Sparkles in Background */}
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#D4AF37]"
            style={{
              width: `${(i % 3) + 3}px`,
              height: `${(i % 3) + 3}px`,
              left: `${(i * 19) % 96 + 2}%`,
              top: `${(i * 27) % 96 + 2}%`,
              opacity: 0.35,
              boxShadow: '0 0 6px rgba(212,175,55,0.8)',
            }}
          />
        ))}
      </div>

      {/* ── LIVE INTERACTIVE FLYING CAP BURST ON TOSS ── */}
      <div className={`pointer-events-none ${preview ? 'absolute' : 'fixed'} inset-0 z-50 overflow-hidden`}>
        {tossedCaps.map((c) => (
          <div
            key={c.id}
            className="flying-cap-item absolute w-16 sm:w-24 text-black drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]"
            style={{
              left: `${c.x}%`,
              bottom: '0%',
              transform: `scale(${c.scale})`,
            }}
          >
            <MortarboardSVG />
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 1: HERO & GRAND GRADUATION COMMENCEMENT CARD (WHITE & BLACK & GOLD)
         ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 sm:px-6 z-10">
        
        {/* Main Card Frame */}
        <div className="luxury-white-card relative mx-auto w-full max-w-[440px] sm:max-w-xl md:max-w-2xl rounded-[36px] p-6 sm:p-10 text-center">
          
          {/* Top Graduation Mortarboard Badge & Class of 2025 Crest */}
          <div className="flex flex-col items-center space-y-3">
            
            {/* Giant Crown Mortarboard Icon Over Name */}
            <div className="relative mb-1 flex items-center justify-center">
              <div className="w-16 h-14 sm:w-20 sm:h-16 text-black drop-shadow-md transition-transform duration-300 hover:scale-110">
                <MortarboardSVG />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#FBF8F0] px-5 py-2 text-xs font-black tracking-widest text-[#B8860B] shadow-sm">
              <GraduationCap className="h-4 w-4 text-[#B8860B]" />
              <span className="font-tajawal uppercase tracking-[0.25em]">{classYear} · حفل التخرج</span>
            </div>

            {/* Bismillah / Academic Motto */}
            <span className="font-amiri text-base sm:text-lg text-[#333333] pt-1">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>

            <div className="h-px w-28 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-1" />
            
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#B8860B] font-tajawal">
              {isArabic ? 'دعوة لحضور حفل التخرج البهيج' : 'Graduation Gala Commencement'}
            </p>
          </div>

          {/* Graduate Name & Title (Crisp Deep Black) */}
          <div className="my-7">
            <h1 className="font-ruqaa text-4xl sm:text-6xl font-black black-title">
              {graduateName}
            </h1>
            
            {/* Degree & Major */}
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <Award className="h-5 w-5 text-[#B8860B]" />
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>

            <p className="mt-2 text-base sm:text-xl font-black text-[#111111] font-tajawal">
              {degree}
            </p>

            {/* University & Honors */}
            <p className="mt-1 text-xs sm:text-sm text-[#444444] font-medium font-tajawal">
              {university} · <span className="font-bold text-[#B8860B]">{honors}</span>
            </p>
          </div>

          {/* Poetic Invitation Verse (Black on White) */}
          <p className="mx-auto max-w-lg text-xs sm:text-sm leading-relaxed text-[#333333] font-tajawal">
            {customDescription}
          </p>

          {/* Key Event Badges (White, Black & Gold) */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF8F2] p-4 text-center shadow-sm">
              <Calendar className="mx-auto h-5 w-5 text-[#B8860B]" />
              <p className="mt-1.5 text-xs font-bold text-[#111111] font-tajawal">{dayName}</p>
              <p className="text-[11px] text-[#8A5A00] font-semibold">{dayNumber} / {yearNumber}</p>
            </div>
            <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF8F2] p-4 text-center shadow-sm">
              <Clock className="mx-auto h-5 w-5 text-[#B8860B]" />
              <p className="mt-1.5 text-xs font-bold text-[#111111] font-tajawal">{eventTime}</p>
              <p className="text-[11px] text-[#8A5A00] font-semibold">{isArabic ? 'مساءً' : 'Evening'}</p>
            </div>
            <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF8F2] p-4 text-center shadow-sm">
              <MapPin className="mx-auto h-5 w-5 text-[#B8860B]" />
              <p className="mt-1.5 text-xs font-bold text-[#111111] font-tajawal line-clamp-1">{venueName}</p>
              <p className="text-[10px] text-[#8A5A00] line-clamp-1">{venueAddress}</p>
            </div>
          </div>

          {/* ─── CREATIVE INTERACTIVE CAP TOSS CELEBRATION BUTTON ─── */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleTossCap}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#111111] text-white hover:bg-black px-8 py-3.5 text-xs font-black uppercase tracking-widest shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition hover:scale-105 active:scale-95"
            >
              <GraduationCap className="h-4 w-4 text-[#D4AF37] animate-bounce" />
              <span>{isArabic ? 'ارمي قبعة التخرج 🎓' : 'Toss Graduation Cap 🎓'}</span>
              {tossCount > 0 && (
                <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[10px] font-black text-black">
                  +{tossCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => detailsRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#D4AF37]/60 bg-[#FAF8F2] px-6 py-3.5 text-xs font-bold text-[#111111] hover:bg-[#F3EEDD] transition shadow-sm"
            >
              <span>{isArabic ? 'تفاصيل الحفل والبرنامج' : 'Ceremony Details'}</span>
              <ChevronDown className="h-4 w-4 text-[#8A5A00]" />
            </button>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 2: DETAILS, COUNTDOWN, PROGRAMME, HONORS & RSVP (WHITE & BLACK)
         ═══════════════════════════════════════════════════════════════════════════ */}
      <div
        ref={detailsRef}
        className="relative mx-auto w-full max-w-[460px] sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-4 py-8 sm:px-6 z-10 space-y-8"
      >
        
        {/* ─── CARD 1: ACADEMIC HONORS & STATS ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="luxury-white-card relative rounded-[28px] p-6 sm:p-8 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#FBF8F0] px-4 py-1.5 text-[11px] font-bold text-[#B8860B]">
            <Trophy className="h-3.5 w-3.5 text-[#B8860B]" />
            <span>{isArabic ? 'مسيرة الجد والتفوق الأكاديمي' : 'Academic Excellence & Honors'}</span>
          </div>

          <h3 className="mt-2 font-ruqaa text-2xl sm:text-3xl font-black black-title">
            {isArabic ? 'وسام التميز ودرع التخرج' : 'Honors of Distinction'}
          </h3>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#FAF8F2] p-3.5 text-center">
              <Trophy className="mx-auto h-5 w-5 text-[#B8860B]" />
              <p className="mt-1 text-sm font-bold text-[#111111] font-tajawal">{honors}</p>
              <p className="text-[10px] text-[#8A5A00]">{isArabic ? 'المرتبة' : 'Honors'}</p>
            </div>
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#FAF8F2] p-3.5 text-center">
              <BookOpen className="mx-auto h-5 w-5 text-[#B8860B]" />
              <p className="mt-1 text-sm font-bold text-[#111111] font-tajawal">{classYear}</p>
              <p className="text-[10px] text-[#8A5A00]">{isArabic ? 'الدفعة' : 'Class'}</p>
            </div>
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#FAF8F2] p-3.5 text-center">
              <Award className="mx-auto h-5 w-5 text-[#B8860B]" />
              <p className="mt-1 text-sm font-bold text-[#111111] font-tajawal line-clamp-1">{degree}</p>
              <p className="text-[10px] text-[#8A5A00]">{isArabic ? 'التخصص' : 'Major'}</p>
            </div>
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#FAF8F2] p-3.5 text-center">
              <Scroll className="mx-auto h-5 w-5 text-[#B8860B]" />
              <p className="mt-1 text-sm font-bold text-[#111111] font-tajawal line-clamp-1">{university}</p>
              <p className="text-[10px] text-[#8A5A00]">{isArabic ? 'الصرح الأكاديمي' : 'Academy'}</p>
            </div>
          </div>
        </motion.section>

        {/* ─── CARD 2: REAL-TIME GRADUATION COUNTDOWN ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="luxury-white-card relative rounded-[28px] p-6 sm:p-8 text-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#B8860B]">
            {isArabic ? 'العد التنازلي ليوم التكريم' : 'Countdown to Commencement'}
          </span>
          <h3 className="mt-1 font-ruqaa text-2xl sm:text-3xl font-black black-title">
            {isArabic ? 'موعد حفل التخرج الكبير' : 'The Grand Graduation Date'}
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
                className="relative flex flex-col items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-[#FAF8F2] p-3 sm:p-4 shadow-sm"
              >
                <span className="font-cinzel text-xl sm:text-3xl font-black text-[#111111]">
                  {String(item.val).padStart(2, '0')}
                </span>
                <span className="mt-1 text-[10px] font-bold text-[#8A5A00] font-tajawal">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─── CARD 3: CEREMONY & BANQUET PROGRAMME ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="luxury-white-card relative rounded-[28px] p-6 sm:p-8 text-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#B8860B]">
            {isArabic ? 'برنامج الحفل ومسيرة الشرف' : 'Commencement Schedule'}
          </span>
          <h3 className="mt-1 font-ruqaa text-2xl sm:text-3xl font-black black-title">
            {isArabic ? 'فقرات الأمسية الاحتفالية' : 'Evening Program'}
          </h3>

          <div className="mt-6 space-y-3.5 text-right">
            {programList.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#D4AF37]/30 bg-[#FAF8F2] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
                  <span className="font-bold text-sm sm:text-base text-[#111111] font-tajawal">
                    {item.title}
                  </span>
                  {item.time && (
                    <span className="rounded-full border border-[#D4AF37]/50 bg-[#F4ECD5] px-3 py-0.5 text-xs font-black text-[#8A5A00]">
                      {item.time}
                    </span>
                  )}
                </div>
                {item.desc && (
                  <p className="mt-2 text-xs leading-relaxed text-[#444444] font-tajawal">
                    {item.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─── CARD 4: VENUE & GOOGLE MAPS LOCATION ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="luxury-white-card relative rounded-[28px] p-6 sm:p-8 text-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#B8860B]">
            {isArabic ? 'موقع الحفل والتوجيهات' : 'Venue & Directions'}
          </span>
          <h3 className="mt-1 font-ruqaa text-2xl sm:text-3xl font-black black-title">
            {venueName}
          </h3>
          <p className="mt-1 text-xs text-[#555555] font-tajawal">
            {venueAddress}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#111111] text-white hover:bg-black px-7 py-3 text-xs font-black uppercase tracking-wider shadow-md transition hover:scale-105"
            >
              <Navigation className="h-4 w-4 text-[#D4AF37]" />
              <span>{isArabic ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}</span>
            </a>
          </div>
        </motion.section>

        {/* ─── CARD 5: LIVE GUESTBOOK & CONGRATULATIONS ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="luxury-white-card relative rounded-[28px] p-6 sm:p-8 text-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#B8860B]">
            {isArabic ? 'دفتر التهاني والتبريكات' : 'Commencement Guestbook'}
          </span>
          <h3 className="mt-1 font-ruqaa text-2xl sm:text-3xl font-black black-title">
            {isArabic ? 'كلمات الفخر والاعتزاز من الأحبة' : 'Heartfelt Congratulations'}
          </h3>

          {/* List of Wishes */}
          <div className="mt-6 space-y-3.5 text-right">
            {wishes.map((w, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#D4AF37]/25 bg-[#FAF8F2] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8A5A00] flex items-center gap-1.5 font-tajawal">
                    <GraduationCap className="h-3.5 w-3.5 text-[#B8860B]" /> {w.name}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[#222222] leading-relaxed font-tajawal">
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
              className="w-full rounded-xl border border-[#D4AF37]/40 bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#111111] placeholder-[#888888] outline-none focus:border-[#B8860B] shadow-inner"
            />
            <textarea
              rows={2}
              placeholder={isArabic ? 'اكتب رسالة تهنئة للخريج...' : 'Write your warm congratulatory message...'}
              value={newGuestWish}
              onChange={(e) => setNewGuestWish(e.target.value)}
              className="w-full rounded-xl border border-[#D4AF37]/40 bg-[#FFFFFF] px-3.5 py-2.5 text-xs text-[#111111] placeholder-[#888888] outline-none focus:border-[#B8860B] shadow-inner"
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] text-white hover:bg-black py-2.5 text-xs font-bold shadow-md transition hover:scale-[1.01]"
            >
              <Send className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>{isArabic ? 'إرسال التهنئة' : 'Send Congratulations'}</span>
            </button>
          </form>

          {/* Direct WhatsApp RSVP */}
          <div className="mt-6 border-t border-[#D4AF37]/20 pt-5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366] bg-[#25D366]/10 py-3 text-xs font-bold text-[#1E7E34] transition hover:bg-[#25D366]/20 shadow-sm"
            >
              <span>{isArabic ? 'تأكيد الحضور والمباركة عبر الواتساب (WhatsApp RSVP)' : 'Confirm Attendance via WhatsApp'}</span>
            </a>
          </div>
        </motion.section>

        {/* ─── CARD 6: GRAND FINALE WITH FLYING GRADUATION HATS ("مبارك التخرج") ─── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8 }}
          className="luxury-white-card relative rounded-[32px] p-8 text-center overflow-hidden"
        >
          {/* Subtle Flying Hats Background Motif */}
          <div className="pointer-events-none absolute -bottom-6 -right-6 w-32 opacity-10 text-black">
            <MortarboardSVG />
          </div>
          <div className="pointer-events-none absolute -top-6 -left-6 w-28 opacity-10 text-black">
            <MortarboardSVG />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#FBF8F0] px-4 py-1.5 text-[11px] font-bold text-[#B8860B]">
            <Sparkles className="h-3.5 w-3.5 text-[#B8860B]" />
            <span>{isArabic ? 'فرحتنا تكتمل بوجودكم' : 'Honored by Your Presence'}</span>
          </div>

          <div className="my-5 font-ruqaa text-5xl sm:text-6xl font-black black-title">
            {isArabic ? 'مبارك التخرج 🎓' : 'Congratulations!'}
          </div>

          <p className="mx-auto max-w-sm text-xs sm:text-sm leading-relaxed text-[#444444] font-tajawal">
            {isArabic
              ? 'حضوركم ومشاركتكم وسام فخر يزيد من بهجة هذا الإنجاز الكبير، دامت أيامكم عامرة بالأفراح والنجاحات المستمرة.'
              : 'Your presence is a true honor that celebrates this momentous academic milestone.'}
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111111] text-white hover:bg-black px-8 py-3.5 text-xs font-black uppercase tracking-widest shadow-lg transition hover:scale-105"
            >
              {isArabic ? 'تأكيد الحضور والمباركة 🎓' : 'Confirm Attendance 🎓'}
            </a>
          </div>

          <div className="mt-8 text-[10px] tracking-[0.3em] uppercase text-[#8A5A00] font-tajawal font-bold">
            {graduateName} · {classYear} · {yearNumber}
          </div>
        </motion.section>

      </div>
    </div>
  );
}

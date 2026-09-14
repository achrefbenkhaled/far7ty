import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import GtaMapViewer from '../components/GtaMapViewer';
import {
  Calendar,
  MapPin,
  Sparkles,
  Heart,
  Send,
  ExternalLink,
  ChevronDown,
  Clock,
  Navigation,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';

interface TemplateProps {
  preview?: boolean;
  invitationData?: Record<string, unknown>;
  variant?: string;
}

const floatingPetals = [
  { left: '10%', top: '6%', size: 14, delay: '0s', duration: '6s' },
  { left: '22%', top: '16%', size: 18, delay: '1.5s', duration: '7.5s' },
  { left: '35%', top: '10%', size: 12, delay: '0.8s', duration: '5.5s' },
  { left: '48%', top: '5%', size: 16, delay: '2.2s', duration: '6.8s' },
  { left: '62%', top: '14%', size: 13, delay: '0.3s', duration: '7.2s' },
  { left: '78%', top: '8%', size: 17, delay: '1.9s', duration: '6.2s' },
  { left: '88%', top: '20%', size: 15, delay: '1.1s', duration: '8s' },
  { left: '15%', top: '34%', size: 16, delay: '2.8s', duration: '7s' },
  { left: '82%', top: '46%', size: 14, delay: '0.5s', duration: '6.5s' },
  { left: '25%', top: '58%', size: 18, delay: '1.7s', duration: '7.8s' },
  { left: '75%', top: '70%', size: 12, delay: '2.4s', duration: '6s' },
  { left: '38%', top: '82%', size: 15, delay: '0.9s', duration: '7.2s' },
  { left: '85%', top: '88%', size: 16, delay: '1.3s', duration: '8.2s' },
];

function useCountdown(targetDateStr?: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 120, hours: 14, minutes: 35, seconds: 40 });

  useEffect(() => {
    let target = targetDateStr ? new Date(targetDateStr).getTime() : NaN;
    if (isNaN(target) || target < Date.now()) {
      target = Date.now() + 120 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000;
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

export default function EmmaJamesWeddingTemplate({ preview = false, invitationData }: TemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth scroll animations: Groom moves from right towards center, Bride moves from left towards center
  const groomMoveX = useTransform(scrollYProgress, [0, 0.4, 0.75, 1], [65, 40, 15, 0]);
  const brideMoveX = useTransform(scrollYProgress, [0, 0.4, 0.75, 1], [-65, -40, -15, 0]);
  const coupleHeartOpacity = useTransform(scrollYProgress, [0.65, 0.9, 1], [0, 0.7, 1]);
  const coupleScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1.05]);

  // Data props with Arabic defaults matching the user's reference image
  const groomName = (invitationData?.groomName as string) || 'أيمن';
  const brideName = (invitationData?.brideName as string) || 'سالي';
  const eventDate = (invitationData?.date as string) || '2028-05-24';
  const dayNumber = (invitationData?.dayNumber as string) || '24';
  const dayName = (invitationData?.dayName as string) || 'يوم الأحد';
  const yearNumber = (invitationData?.yearNumber as string) || '2028';
  const eventTime = (invitationData?.time as string) || '06 مساءً';
  const venueName = (invitationData?.venue as string) || 'قصر الأفراح الملكي - القاعة الكبرى';
  const venueAddress = (invitationData?.address as string) || 'شارع النرجس، المدينة المنورة';
  const mapsUrl = (invitationData?.mapsUrl as string) || 'https://maps.google.com/?q=wedding+venue';
  const customDescription = (invitationData?.description as string) || 
    'لفرحنا اليوم ندعوكم، بالطيب والورد نلاقيكم،\nوبالحب والخير نشكر تهانيكم';

  const countdown = useCountdown(eventDate);

  const defaultProgramList = [
    {
      time: '06:00 م',
      title: 'استقبال الضيوف الكرام',
      desc: 'الترحيب بالأهل والأصدقاء وتناول القهوة والمشروبات الترحيبية وتجاذب أطراف الحديث',
      location: 'بهو الاستقبال الملكي',
      address: venueAddress || 'شارع النرجس، المدينة المنورة',
      mapQuery: venueAddress ? `${venueName}, ${venueAddress}` : 'قصر الأفراح الملكي، المدينة المنورة',
    },
    {
      time: '08:00 م',
      title: 'دخول العروسين ومراسم الزفة',
      desc: 'مراسم الزفة السعيدة وتلبيس دبل الزواج والتقاط الصور التذكارية مع الأهل والأحباب',
      location: 'القاعة الكبرى - منصة الزفاف',
      address: venueAddress || 'شارع النرجس، المدينة المنورة',
      mapQuery: venueAddress ? `${venueName}, ${venueAddress}` : 'قصر الأفراح الملكي، المدينة المنورة',
    },
    {
      time: '09:30 م',
      title: 'مأدبة العشاء الفاخرة',
      desc: 'بوفيه عشاء ملكي فاخر احتفالاً بهذه الليلة الاستثنائية الغالية',
      location: 'صالة الطعام والضيافة الملكية',
      address: venueAddress || 'شارع النرجس، المدينة المنورة',
      mapQuery: venueAddress ? `${venueName}, ${venueAddress}` : 'قصر الأفراح الملكي، المدينة المنورة',
    },
  ];

  const programList = Array.isArray(invitationData?.program) && invitationData.program.length > 0
    ? (invitationData.program as Array<Record<string, string>>).map((item, idx) => ({
        time: item.time || '',
        title: item.title || '',
        desc: item.desc || item.description || '',
        location: item.location || (idx === 0 ? 'بهو الاستقبال' : idx === 1 ? 'القاعة الكبرى' : 'صالة الطعام الملكية'),
        address: item.address || venueAddress,
        mapQuery: item.mapQuery || item.address || item.location || `${venueName}, ${venueAddress}`,
      }))
    : defaultProgramList;

  const [selectedProgramIndex, setSelectedProgramIndex] = useState(0);
  const [showAllProgramsMobile, setShowAllProgramsMobile] = useState(false);
  const selectedProgram = programList[selectedProgramIndex] ?? programList[0];

  const [isMobileLocked, setIsMobileLocked] = useState(false);
  const [mobileProgress, setMobileProgress] = useState(0);

  // Auto-change program items every 7 seconds on mobile unless locked by user click
  useEffect(() => {
    if (isMobileLocked || programList.length <= 1) return;

    const intervalMs = 100;
    const step = (intervalMs / 7000) * 100; // 7 seconds total

    const timer = setInterval(() => {
      setMobileProgress((prev) => {
        if (prev + step >= 100) {
          setSelectedProgramIndex((curr) => (curr + 1) % programList.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isMobileLocked, programList.length]);

  const handleSelectProgram = (index: number, manual = true) => {
    setSelectedProgramIndex(index);
    if (manual) {
      setIsMobileLocked(true);
      setMobileProgress(100);
    }
  };

  const handleResumeAutoPlay = () => {
    setIsMobileLocked(false);
    setMobileProgress(0);
  };

  const defaultWishesList = [
    { name: 'عائلة العريس', message: 'بارك الله لكما وبارك عليكما وجمع بينكما في خير وسعادة دائمة يا رب 🤍✨' },
    { name: 'صديقة العروس مريم', message: 'ألف مبروك لأجمل عروسين! ننتظر هذا اليوم بكل حب وفرحة 💍🌸' },
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
  const whatsappMessage = encodeURIComponent(`السلام عليكم، نبارك لـ ${groomName} و ${brideName} ونؤكد حضورنا بكل فرح وسرور! 💍🎉`);
  const whatsappUrl = `https://wa.me/${cleanPhone || '33600000000'}?text=${whatsappMessage}`;

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className="relative min-h-screen w-full overflow-hidden bg-[#FAF3F0] text-[#2C3E50] selection:bg-[#9E4A5A] selection:text-white font-sans"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, #FFFFFF 0%, #FAF3F0 50%, #F5EAE6 100%)',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@300;400;500;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap');

        .font-ruqaa {
          font-family: 'Aref Ruqaa', 'Amiri', serif;
        }
        .font-tajawal {
          font-family: 'Tajawal', sans-serif;
        }
        .font-amiri {
          font-family: 'Amiri', serif;
        }

        @keyframes petalFloat {
          0% { transform: translateY(0px) rotate(0deg) scale(0.9); opacity: 0.2; }
          50% { transform: translateY(-15px) rotate(18deg) scale(1.1); opacity: 0.7; }
          100% { transform: translateY(0px) rotate(0deg) scale(0.9); opacity: 0.2; }
        }

        .petal-anim {
          animation: petalFloat 6s ease-in-out infinite;
        }

        .burgundy-gradient-text {
          background: linear-gradient(135deg, #853648 0%, #9E4A5A 45%, #6A2434 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      {/* ─── BACKGROUND DECORATIVE WATERCOLOR FLORALS ─── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Top-left floral corner */}
        <div className="absolute -top-10 -left-10 w-72 h-72 opacity-90 transition-transform duration-700">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <radialGradient id="roseGradTop" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#F9D2DA" />
                <stop offset="45%" stopColor="#EAA4B3" />
                <stop offset="85%" stopColor="#C96B80" />
                <stop offset="100%" stopColor="#9E4A5A" />
              </radialGradient>
              <radialGradient id="leafGradTop" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#B4C9BE" />
                <stop offset="70%" stopColor="#7E9E8E" />
                <stop offset="100%" stopColor="#537062" />
              </radialGradient>
            </defs>
            <path d="M20,60 C40,20 80,30 90,60 C70,80 40,80 20,60 Z" fill="url(#leafGradTop)" opacity="0.6" />
            <path d="M60,10 C100,0 120,40 100,70 C80,60 60,40 60,10 Z" fill="url(#leafGradTop)" opacity="0.5" />
            <circle cx="55" cy="55" r="45" fill="url(#roseGradTop)" opacity="0.85" />
            <circle cx="70" cy="45" r="32" fill="#FCE4EC" opacity="0.75" />
            <circle cx="45" cy="65" r="28" fill="#F8BBD0" opacity="0.8" />
            <circle cx="58" cy="52" r="18" fill="#AD1457" opacity="0.35" />
          </svg>
        </div>

        {/* Bottom floral bouquet */}
        <div className="absolute -bottom-16 -right-16 w-80 h-80 opacity-90 pointer-events-none">
          <svg viewBox="0 0 220 220" className="w-full h-full">
            <defs>
              <radialGradient id="roseGradBot" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FDE8ED" />
                <stop offset="50%" stopColor="#E89EB0" />
                <stop offset="100%" stopColor="#9E4A5A" />
              </radialGradient>
              <radialGradient id="leafGradBot" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#C9DBD2" />
                <stop offset="70%" stopColor="#8BA99B" />
                <stop offset="100%" stopColor="#597A6C" />
              </radialGradient>
            </defs>
            <path d="M140,160 C180,120 210,150 190,190 C160,190 140,180 140,160 Z" fill="url(#leafGradBot)" opacity="0.65" />
            <path d="M100,180 C120,130 170,140 160,190 C130,200 110,195 100,180 Z" fill="url(#leafGradBot)" opacity="0.5" />
            <circle cx="150" cy="150" r="50" fill="url(#roseGradBot)" opacity="0.85" />
            <circle cx="135" cy="135" r="35" fill="#FCE4EC" opacity="0.8" />
            <circle cx="160" cy="160" r="28" fill="#F48FB1" opacity="0.7" />
          </svg>
        </div>

        {/* Floating Petals */}
        {floatingPetals.map((petal, i) => (
          <div
            key={i}
            className="petal-anim absolute rounded-full bg-gradient-to-tr from-[#F8BBD0] to-[#FCE4EC] opacity-30 shadow-sm"
            style={{
              left: petal.left,
              top: petal.top,
              width: petal.size,
              height: petal.size * 1.3,
              borderRadius: '60% 40% 70% 30% / 60% 30% 70% 40%',
              animationDelay: petal.delay,
              animationDuration: petal.duration,
            }}
          />
        ))}
      </div>

      {/* Main Container Wrapper */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[460px] sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl flex-col px-3.5 py-6 sm:px-6 font-tajawal">

        {/* ═══════════════ SECTION 1: HERO INVITATION CARD (MATCHING REFERENCE IMAGE) ═══════════════ */}
        <section className="relative flex min-h-[92vh] flex-col items-center justify-center py-4">
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="relative w-full overflow-hidden rounded-[26px] border border-[#EAC9D1] bg-white/95 px-5 py-9 shadow-[0_20px_60px_rgba(158,74,90,0.12)] backdrop-blur-md text-center"
          >
            {/* Top Right Architectural Geometric Accent (From Reference Image) */}
            <div className="pointer-events-none absolute top-3 right-3 w-28 h-28 overflow-hidden z-0">
              <div className="absolute top-0 right-0 h-1.5 w-24 bg-[#C5924E] rounded-full" />
              <div className="absolute top-0 right-0 w-1.5 h-24 bg-[#C5924E] rounded-full" />
              <div className="absolute top-2.5 right-2.5 h-1.5 w-16 bg-[#C5924E]/80 rounded-full" />
              <div className="absolute top-2.5 right-2.5 w-1.5 h-16 bg-[#C5924E]/80 rounded-full" />
              <div className="absolute top-4 right-4 h-10 w-10 rounded-bl-[100%] bg-[#9E4A5A] opacity-95" />
            </div>

            {/* Corner Decorative Floral Accent Top Left */}
            <div className="pointer-events-none absolute -top-4 -left-4 w-28 h-28 opacity-85 z-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="30" cy="30" r="26" fill="#F8BBD0" opacity="0.8" />
                <circle cx="45" cy="20" r="18" fill="#FCE4EC" opacity="0.9" />
                <path d="M10,40 C25,20 50,30 50,55 C30,60 15,55 10,40 Z" fill="#A4C2B4" opacity="0.6" />
              </svg>
            </div>

            <div className="relative z-10 space-y-4">
              {/* Header Title */}
              <div className="pt-2">
                <h3 className="font-tajawal text-xl font-bold tracking-wide text-[#23384D] sm:text-2xl">
                  نتشرف بدعوتكم لحضور
                </h3>
                <h2 className="font-tajawal text-2xl font-extrabold tracking-wider text-[#23384D] sm:text-3xl mt-1">
                  حفل زفافنا
                </h2>
              </div>

              {/* Romantic Couple Names in Elegant Arabic Calligraphy */}
              <div className="my-6 py-2">
                <div className="font-ruqaa text-5xl sm:text-6xl text-[#9E4A5A] leading-tight burgundy-gradient-text drop-shadow-[0_2px_8px_rgba(158,74,90,0.15)] flex items-center justify-center gap-3">
                  <span>{groomName}</span>
                  <span className="text-3xl sm:text-4xl text-[#C5924E] font-amiri font-bold">&amp;</span>
                  <span>{brideName}</span>
                </div>
              </div>

              {/* Date Box / Details Layout (Exact Style from Reference) */}
              <div className="mx-auto my-6 max-w-[320px] rounded-2xl border border-[#F2D6DC] bg-[#FFFBFB] p-4 shadow-sm">
                <div className="flex items-center justify-between text-[#23384D]">
                  <div className="flex-1 text-center">
                    <span className="block text-xs font-semibold text-[#667085]">{dayName}</span>
                    <div className="mx-auto mt-2 h-0.5 w-12 bg-[#23384D]/30" />
                  </div>

                  <div className="px-4 text-center">
                    <span className="block font-tajawal text-4xl sm:text-5xl font-black text-[#23384D] tracking-tight">
                      {dayNumber}
                    </span>
                    <span className="block text-xs font-bold text-[#667085] mt-1">{yearNumber}</span>
                  </div>

                  <div className="flex-1 text-center">
                    <span className="block text-xs font-semibold text-[#667085]">{eventTime}</span>
                    <div className="mx-auto mt-2 h-0.5 w-12 bg-[#23384D]/30" />
                  </div>
                </div>
              </div>

              {/* Poetic Verse (Arabic Verse from Reference) */}
              <div className="mx-auto max-w-[290px] pt-1">
                <p className="font-tajawal text-xs sm:text-sm font-medium leading-relaxed text-[#475467] whitespace-pre-line">
                  {customDescription}
                </p>
              </div>

              {/* ─── COUPLE ILLUSTRATION (MAN ON RIGHT, BRIDE ON LEFT AT START) ─── */}
              <div className="relative mx-auto mt-6 flex justify-center items-end h-[190px] w-full overflow-hidden">
                <div className="relative flex items-end justify-center w-[280px] h-[180px]">
                  
                  {/* Groom Figure (Starting on the right side) */}
                  <motion.div
                    className="absolute right-12 z-20"
                    style={{ x: groomMoveX }}
                  >
                    <svg width="100" height="175" viewBox="0 0 100 175" fill="none">
                      <defs>
                        <linearGradient id="suitGradHero" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1E293B" />
                          <stop offset="100%" stopColor="#0F172A" />
                        </linearGradient>
                        <linearGradient id="skinGradHero" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FDEDE8" />
                          <stop offset="100%" stopColor="#F7D3C8" />
                        </linearGradient>
                      </defs>
                      {/* Groom Head & Hair */}
                      <path d="M45,16 C38,10 58,4 68,14 C72,20 66,28 58,28 C48,28 42,20 45,16 Z" fill="#221C1A" />
                      <circle cx="56" cy="22" r="10" fill="url(#skinGradHero)" stroke="#1E293B" strokeWidth="0.8" />
                      {/* Suit & Tuxedo */}
                      <path d="M38,32 L74,32 L78,115 L34,115 Z" fill="url(#suitGradHero)" />
                      {/* White Shirt & Gold Bowtie */}
                      <path d="M50,32 L62,32 L59,54 L53,54 Z" fill="#FFFFFF" />
                      <path d="M52,36 L58,40 L52,44 Z M58,36 L52,40 L58,44 Z" fill="#C5924E" />
                      {/* Lapels */}
                      <path d="M38,32 L52,54 L44,62 Z" fill="#334155" />
                      <path d="M74,32 L60,54 L68,62 Z" fill="#334155" />
                      {/* Boutonniere rose pin */}
                      <circle cx="45" cy="45" r="2.5" fill="#E91E63" />
                      {/* Trousers */}
                      <rect x="40" y="115" width="12" height="55" fill="#0F172A" />
                      <rect x="58" y="115" width="12" height="55" fill="#0F172A" />
                    </svg>
                  </motion.div>

                  {/* Bride Figure (Starting on the left side) */}
                  <motion.div
                    className="absolute left-12 z-10"
                    style={{ x: brideMoveX }}
                  >
                    <svg width="125" height="175" viewBox="0 0 125 175" fill="none">
                      <defs>
                        <linearGradient id="dressGradHero" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FFFFFF" />
                          <stop offset="60%" stopColor="#F8FAFC" />
                          <stop offset="100%" stopColor="#F1F5F9" />
                        </linearGradient>
                      </defs>
                      {/* Bride Hair & Golden Tiara */}
                      <path d="M55,14 C48,8 68,4 78,12 C82,20 74,26 66,26 C55,26 50,18 55,14 Z" fill="#3E2723" />
                      <path d="M60,12 L63,7 L66,10 L69,7 L72,12 Z" fill="#D4A574" stroke="#B8860B" strokeWidth="0.5" />
                      <circle cx="66" cy="22" r="9" fill="url(#skinGradHero)" stroke="#1E293B" strokeWidth="0.8" />
                      {/* Bridal Bodice */}
                      <path d="M55,31 C60,30 72,30 77,31 L80,56 L52,56 Z" fill="url(#dressGradHero)" stroke="#E2E8F0" strokeWidth="0.8" />
                      {/* Flowing Wedding Gown */}
                      <path d="M52,56 C42,95 10,155 -5,168 C35,172 90,172 125,168 C110,155 85,95 80,56 Z" fill="url(#dressGradHero)" stroke="#CBD5E1" strokeWidth="0.8" />
                      {/* Rose Bouquet */}
                      <g transform="translate(48, 50)">
                        <circle cx="10" cy="10" r="10" fill="#F8BBD0" stroke="#9E4A5A" strokeWidth="0.6" />
                        <circle cx="6" cy="7" r="4" fill="#C2185B" opacity="0.65" />
                        <circle cx="13" cy="11" r="4" fill="#E91E63" opacity="0.65" />
                      </g>
                    </svg>
                  </motion.div>

                </div>
              </div>

              {/* Bottom Flourish */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF3F0] px-4 py-1 text-[11px] font-semibold text-[#9E4A5A]">
                  <Sparkles className="h-3.5 w-3.5 text-[#C5924E]" />
                  دعوة زفاف إلكترونية خاصة
                </span>
              </div>
            </div>
          </motion.div>

          {/* Scroll Down Prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-5 flex flex-col items-center gap-1 text-[#9E4A5A]/80"
          >
            <span className="text-[11px] font-bold tracking-widest font-tajawal">اسحب للأسفل للاطلاع على تفاصيل الحفل</span>
            <ChevronDown className="h-4 w-4 animate-bounce text-[#C5924E]" />
          </motion.div>
        </section>

        {/* ═══════════════ SECTION 2: COUNTDOWN TO THE BIG DAY ═══════════════ */}
        <section className="relative my-6 py-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full max-w-2xl rounded-[24px] border border-[#EAC9D1] bg-white/95 p-5 shadow-[0_12px_35px_rgba(158,74,90,0.06)]"
          >
            <span className="text-[11px] font-bold tracking-widest text-[#C5924E] uppercase">العد التنازلي لليوم المنتظر</span>
            <h2 className="mt-1 font-ruqaa text-3xl text-[#9E4A5A]">نعد الأيام واللحظات</h2>

            {/* Countdown Grid */}
            <div className="mt-5 grid grid-cols-4 gap-2.5">
              {[
                { label: 'أيام', value: countdown.days },
                { label: 'ساعات', value: countdown.hours },
                { label: 'دقائق', value: countdown.minutes },
                { label: 'ثواني', value: countdown.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center rounded-2xl border border-[#F5DFE4] bg-gradient-to-b from-[#FFFDFD] to-[#FAF3F0] p-3 shadow-inner"
                >
                  <span className="font-tajawal text-2xl sm:text-3xl font-black text-[#9E4A5A]">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="mt-1 text-[10px] font-bold text-[#667085]">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Time & Venue Cards */}
            <div className="mt-6 space-y-3 text-right">
              <div className="flex items-start gap-3 rounded-xl border border-[#F2D6DC] bg-[#FFFBFB] p-3.5">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#C5924E]" />
                <div>
                  <div className="text-[11px] font-bold text-[#9E4A5A]">موعد الحفل</div>
                  <div className="text-sm font-semibold text-[#23384D]">{dayName}، {dayNumber} مايو {yearNumber}</div>
                  <div className="text-xs text-[#667085]">{eventTime}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#F2D6DC] bg-[#FFFBFB] p-3.5">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#C5924E]" />
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-[#9E4A5A]">مكان الزفاف</div>
                  <div className="text-sm font-semibold text-[#23384D]">{venueName}</div>
                  <div className="text-xs text-[#667085]">{venueAddress}</div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#C5924E]/40 bg-[#C5924E]/10 px-4 py-1.5 text-xs font-bold text-[#9E4A5A] transition hover:bg-[#C5924E]/20"
                  >
                    موقع القاعة على الخريطة <ExternalLink className="h-3 w-3 text-[#C5924E]" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════ SECTION 3: WEDDING SCHEDULE / PROGRAM & GTA INTERACTIVE MAP ═══════════════ */}
        <section className="relative my-8 py-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#C5924E] uppercase">
              <Sparkles className="h-3.5 w-3.5" /> فقرات الأمسية ومسار الوصول
            </span>
            <h2 className="mt-1 font-ruqaa text-3xl sm:text-4xl text-[#9E4A5A]">برنامج الحفل السعيد</h2>
            <p className="mt-2 text-xs sm:text-sm text-[#667085] max-w-lg mx-auto">
              اضغط على أي فقرة لتفعيل كاميرا المسار الفضائي وعرض موقعها على الخريطة التفاعلية والوصول إليها مباشرة
            </p>
          </motion.div>

          {/* ─── MOBILE LUXURY AUTO-PLAYING TIMELINE (NO SCROLLBAR, 7S AUTO-ADVANCE) ─── */}
          <div className={`mt-6 ${preview ? 'block' : 'block lg:hidden'}`} dir="rtl">
            {/* Segmented Story Progress Tabs Container */}
            <div className="rounded-3xl bg-gradient-to-br from-[#FFFDFD] via-[#FAF3F0] to-[#F7E7EC]/80 p-3 sm:p-4 border border-[#F2D6DC] shadow-[0_4px_20px_rgba(158,74,90,0.06)]">
              {/* Top Status Row: Auto-play indicator + Lock/Resume button */}
              <div className="flex items-center justify-between pb-2.5 text-[11px] font-bold text-[#9E4A5A]">
                <div className="flex items-center gap-1.5 font-tajawal">
                  <span className="uppercase tracking-[0.2em]">برنامج الحفل</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[#C5924E]">
                    0{selectedProgramIndex + 1} / 0{programList.length}
                  </span>
                </div>

                {/* Auto-Play status & Lock toggle */}
                {isMobileLocked ? (
                  <button
                    type="button"
                    onClick={handleResumeAutoPlay}
                    className="inline-flex items-center gap-1 rounded-full bg-[#FAF0F3] border border-[#E8BAC5] px-2.5 py-0.5 text-[10px] font-bold text-[#9E4A5A] shadow-xs active:scale-95 transition cursor-pointer font-tajawal"
                  >
                    <Play className="h-2.5 w-2.5 fill-[#9E4A5A] text-[#9E4A5A]" />
                    <span>استئناف العرض (7ث)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectProgram(selectedProgramIndex, true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-[#F2D6DC] px-2.5 py-0.5 text-[10px] font-bold text-[#9E4A5A] shadow-xs cursor-pointer hover:bg-white active:scale-95 transition font-tajawal"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C5924E] animate-pulse" />
                    <span>تغيير تلقائي (7ث)</span>
                    <Pause className="h-2.5 w-2.5 text-[#9E4A5A]" />
                  </button>
                )}
              </div>

              {/* Clean Segmented Progress Bars (NO HORIZONTAL SCROLLBAR!) */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {programList.map((item, idx) => {
                  const isSelected = selectedProgramIndex === idx;
                  const isPast = idx < selectedProgramIndex;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectProgram(idx, true)}
                      className="group flex flex-col text-right cursor-pointer p-1 rounded-xl transition hover:bg-white/60"
                    >
                      {/* Segment Progress Bar */}
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#F5E1E6]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isPast
                              ? 'w-full bg-[#9E4A5A]'
                              : isSelected
                              ? 'bg-gradient-to-l from-[#C5924E] to-[#9E4A5A]'
                              : 'w-0'
                          }`}
                          style={{
                            width: isSelected
                              ? isMobileLocked
                                ? '100%'
                                : `${mobileProgress}%`
                              : isPast
                              ? '100%'
                              : '0%',
                            transition: isSelected && !isMobileLocked ? 'width 100ms linear' : 'width 0.3s ease',
                          }}
                        />
                      </div>

                      {/* Segment Label */}
                      <div className="mt-1.5 flex items-center justify-between font-tajawal">
                        <span
                          className={`text-[10px] font-bold ${
                            isSelected ? 'text-[#9E4A5A]' : 'text-[#C5924E]'
                          }`}
                        >
                          0{idx + 1}
                        </span>
                        <span
                          className={`text-[10px] font-medium truncate max-w-[85px] ${
                            isSelected ? 'text-[#23384D] font-bold' : 'text-[#667085]'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Selected Event Card on Mobile */}
            <div className="mt-3 rounded-2xl border border-[#9E4A5A]/30 bg-gradient-to-br from-white via-[#FFFDFD] to-[#FAF3F0] p-4 shadow-md text-right">
              <div className="flex items-center justify-between border-b border-[#F5E1E6] pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#9E4A5A] text-white text-xs font-bold shadow-xs">
                    {selectedProgramIndex + 1}
                  </span>
                  <h4 className="font-bold text-sm text-[#23384D] truncate">{selectedProgram.title}</h4>
                </div>
                {selectedProgram.time && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF3F0] px-2.5 py-0.5 text-xs font-bold text-[#9E4A5A] border border-[#F2D6DC] shadow-2xs">
                    <Clock className="h-3 w-3 text-[#C5924E]" />
                    {selectedProgram.time}
                  </span>
                )}
              </div>

              {(selectedProgram.location || venueName) && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-[#9E4A5A]">
                  <MapPin className="h-3.5 w-3.5 text-[#C5924E] shrink-0" />
                  <span>{selectedProgram.location || venueName}</span>
                </div>
              )}

              {selectedProgram.desc && (
                <p className="mt-2 text-xs leading-relaxed text-[#667085] font-tajawal">
                  {selectedProgram.desc}
                </p>
              )}

              {/* Navigation Prev / Next Quick Buttons */}
              <div className="mt-3.5 flex items-center justify-between border-t border-[#F5E1E6] pt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const prevIdx = (selectedProgramIndex - 1 + programList.length) % programList.length;
                    handleSelectProgram(prevIdx, true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9E4A5A] hover:text-[#7A3644] transition cursor-pointer font-tajawal"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span>الفقرة السابقة</span>
                </button>

                {isMobileLocked && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C5924E] bg-[#FFF8EE] px-2 py-0.5 rounded-full border border-[#F0D5AA]">
                    <Lock className="h-2.5 w-2.5" />
                    <span>محدد</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = (selectedProgramIndex + 1) % programList.length;
                    handleSelectProgram(nextIdx, true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9E4A5A] hover:text-[#7A3644] transition cursor-pointer font-tajawal"
                >
                  <span>الفقرة التالية</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* GTA V Interactive Map on Mobile */}
            <div className="mt-4">
              <GtaMapViewer
                locationQuery={selectedProgram.mapQuery || selectedProgram.address || selectedProgram.location || `${venueName}, ${venueAddress}`}
                title={selectedProgram.title}
                locationName={selectedProgram.location || venueName}
                address={selectedProgram.address || venueAddress}
                theme="burgundy"
                isRtl={true}
                heightClass="h-[240px] sm:h-[280px]"
              />
            </div>

            {/* Optional Full Program List Toggle Button for Mobile */}
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setShowAllProgramsMobile((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9E4A5A] hover:underline"
              >
                {showAllProgramsMobile ? '▲ إخفاء القائمة المفصلة' : '▼ عرض تفاصيل جميع الفقرات بالتفصيل'}
              </button>
            </div>

            {/* Collapsible Full Program List on Mobile */}
            <AnimatePresence>
              {showAllProgramsMobile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2.5 overflow-hidden"
                >
                  {programList.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        handleSelectProgram(idx, true);
                        setShowAllProgramsMobile(false);
                      }}
                      className="rounded-xl border border-[#F2D6DC] bg-white p-3.5 shadow-sm text-right cursor-pointer hover:border-[#9E4A5A]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#23384D]">
                          {idx + 1}. {item.title}
                        </span>
                        <span className="text-[11px] text-[#9E4A5A] font-semibold">{item.time}</span>
                      </div>
                      {item.desc && <p className="mt-1 text-[11px] text-[#667085]">{item.desc}</p>}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── DESKTOP 2-COLUMN SIDE-BY-SIDE LAYOUT (hidden on mobile and preview, visible on lg) ─── */}
          <div dir="ltr" className={`mt-8 ${preview ? 'hidden' : 'hidden lg:grid'} grid-cols-12 gap-8 items-start min-w-0`}>
            {/* Left Column: Events List */}
            <div className="col-span-7 space-y-4 min-w-0" dir="rtl">
              {programList.map((item, idx) => {
                const isSelected = selectedProgramIndex === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    onClick={() => handleSelectProgram(idx, true)}
                    className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                      isSelected
                        ? 'border-[#9E4A5A] bg-gradient-to-br from-white via-[#FFFDFD] to-[#FAF0F2] shadow-lg ring-2 ring-[#9E4A5A]/30 scale-[1.01]'
                        : 'border-[#F2D6DC] bg-white/90 hover:border-[#9E4A5A]/50 hover:bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[#F5E1E6] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                            isSelected
                              ? 'bg-[#9E4A5A] text-white'
                              : 'bg-[#FAF3F0] text-[#9E4A5A] group-hover:bg-[#9E4A5A]/10'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-bold text-base text-[#23384D]">{item.title}</span>
                      </div>
                      {item.time && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF3F0] px-3 py-1 text-xs font-bold text-[#9E4A5A] border border-[#F2D6DC]">
                          <Clock className="h-3 w-3 text-[#C5924E]" />
                          {item.time}
                        </span>
                      )}
                    </div>

                    {item.desc && (
                      <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-[#667085]">
                        {item.desc}
                      </p>
                    )}

                    {/* Location tag & Map Status */}
                    <div className="mt-3 flex items-center justify-between border-t border-[#F5E1E6]/70 pt-2.5 text-xs">
                      <div className="flex items-center gap-1.5 text-[#9E4A5A] font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-[#C5924E] shrink-0" />
                        <span className="truncate max-w-xs">{item.location || venueName}</span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          isSelected ? 'text-[#9E4A5A]' : 'text-[#8C5E69]/70 group-hover:text-[#9E4A5A]'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-[#9E4A5A] animate-ping" />
                            محدد على خريطة GTA
                          </>
                        ) : (
                          <>
                            <Navigation className="h-3 w-3" />
                            تحديد على الخريطة
                          </>
                        )}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Column: Sticky GTA V Interactive Map */}
            <div className="col-span-5 sticky top-24 min-w-0" dir="rtl">
              <GtaMapViewer
                locationQuery={selectedProgram.mapQuery || selectedProgram.address || selectedProgram.location || `${venueName}, ${venueAddress}`}
                title={selectedProgram.title}
                locationName={selectedProgram.location || venueName}
                address={selectedProgram.address || venueAddress}
                theme="burgundy"
                isRtl={true}
                heightClass="h-[300px]"
              />
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 4: GUEST WISHES & RSVP ═══════════════ */}
        <section className="relative my-6 py-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full max-w-2xl rounded-[24px] border border-[#EAC9D1] bg-white p-5 shadow-[0_12px_35px_rgba(158,74,90,0.06)]"
          >
            <span className="text-[11px] font-bold tracking-widest text-[#C5924E] uppercase">تهاني وتبريكات</span>
            <h2 className="mt-1 font-ruqaa text-3xl text-[#9E4A5A]">دفتر التبريكات وتأكيد الحضور</h2>

            {/* Display Wishes */}
            <div className="mt-5 space-y-3 text-right">
              {wishes.map((w, idx) => (
                <div key={idx} className="rounded-xl border border-[#F5E1E6] bg-[#FAF8F8] p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#9E4A5A] flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 fill-[#9E4A5A]" /> {w.name}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#475467] leading-relaxed">&ldquo;{w.message}&rdquo;</p>
                </div>
              ))}
            </div>

            {/* Add Wish Form */}
            <form onSubmit={handleAddWish} className="mt-5 space-y-2.5 text-right">
              <input
                type="text"
                placeholder="اسم المهنئ الكريم"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                className="w-full rounded-xl border border-[#E8CCD3] bg-[#FFFDFD] px-3.5 py-2.5 text-xs text-[#23384D] placeholder-[#98A2B3] outline-none focus:border-[#9E4A5A]"
              />
              <textarea
                rows={2}
                placeholder="اكتب كلمة تهنئة للعروسين..."
                value={newGuestWish}
                onChange={(e) => setNewGuestWish(e.target.value)}
                className="w-full rounded-xl border border-[#E8CCD3] bg-[#FFFDFD] px-3.5 py-2.5 text-xs text-[#23384D] placeholder-[#98A2B3] outline-none focus:border-[#9E4A5A]"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9E4A5A] to-[#853648] py-2.5 text-xs font-bold text-white shadow-md transition hover:brightness-110"
              >
                <Send className="h-3.5 w-3.5" /> إرسال التهنئة
              </button>
            </form>

            {/* Direct WhatsApp RSVP */}
            <div className="mt-6 border-t border-[#F5E1E6] pt-5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 py-3 text-xs font-bold text-[#1E7E34] transition hover:bg-[#25D366]/20"
              >
                تأكيد الحضور عبر الواتساب (WhatsApp)
              </a>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════ SECTION 5: THE GRAND FINALE ("نراكم هناك" - UNITED COUPLE POSE) ═══════════════ */}
        <section className="relative my-10 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.85 }}
            className="mx-auto w-full max-w-2xl relative flex flex-col items-center justify-center space-y-6 overflow-hidden rounded-[26px] border border-[#EAC9D1] bg-white/95 p-6 shadow-[0_20px_50px_rgba(158,74,90,0.1)]"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C5924E]/40 bg-[#FFF9F5] px-4 py-1.5 text-[11px] font-bold text-[#C5924E]">
              <Sparkles className="h-3.5 w-3.5" /> فرحتنا تكتمل بوجودكم
            </div>

            {/* Grand Golden Arabic Text */}
            <div className="font-ruqaa text-5xl sm:text-6xl text-[#9E4A5A] burgundy-gradient-text drop-shadow-sm">
              نراكم هناك
            </div>

            <p className="max-w-[310px] text-xs sm:text-sm leading-relaxed text-[#667085] font-tajawal">
              حضوركم شرف لنا ويزيد من بهجة ليلتنا السعيدة، دامت أيامكم عامرة بالأفراح والمسرات.
            </p>

            {/* ─── THE UNITED COUPLE (ARM IN ARM - EXACT PHOTO POSE) ─── */}
            <motion.div
              style={{ scale: coupleScale }}
              className="relative mx-auto my-2 flex justify-center items-end h-[210px] w-full"
            >
              {/* Golden Ambient Aura Behind United Couple */}
              <div className="pointer-events-none absolute h-32 w-32 rounded-full bg-[#FCE8B2]/40 blur-2xl -top-2" />

              <svg viewBox="0 0 240 200" className="h-full w-auto drop-shadow-md">
                <defs>
                  <linearGradient id="suitGradFinal" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                  <linearGradient id="dressGradFinal" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor="#F8FAFC" />
                    <stop offset="100%" stopColor="#F1F5F9" />
                  </linearGradient>
                  <linearGradient id="skinGradFinal" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FDEDE8" />
                    <stop offset="100%" stopColor="#F7D3C8" />
                  </linearGradient>
                </defs>

                {/* Groom Figure (Standing on the Right in RTL / side by side) */}
                <g transform="translate(68, 18)">
                  {/* Hair & Head */}
                  <path d="M25,18 C18,12 35,5 45,15 C48,22 42,28 35,28 C26,28 22,22 25,18 Z" fill="#221C1A" />
                  <circle cx="35" cy="24" r="10" fill="url(#skinGradFinal)" stroke="#1E293B" strokeWidth="0.8" />
                  {/* Suit Body */}
                  <path d="M20,34 L50,34 L54,120 L16,120 Z" fill="url(#suitGradFinal)" />
                  {/* White Shirt & Gold Bow Tie */}
                  <path d="M30,34 L40,34 L38,58 L32,58 Z" fill="#FFFFFF" />
                  <path d="M32,38 L38,42 L32,46 Z M38,38 L32,42 L38,46 Z" fill="#C5924E" />
                  {/* Tux Lapels */}
                  <path d="M20,34 L32,58 L24,65 Z" fill="#334155" />
                  <path d="M50,34 L38,58 L46,65 Z" fill="#334155" />
                  {/* Boutonniere */}
                  <circle cx="26" cy="45" r="2" fill="#E91E63" />
                  {/* Groom Arm linked with bride */}
                  <path d="M48,45 C58,55 58,75 52,85" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
                  {/* Trousers */}
                  <rect x="22" y="120" width="11" height="55" fill="#0F172A" />
                  <rect x="37" y="120" width="11" height="55" fill="#0F172A" />
                </g>

                {/* Bride Figure (Arm in arm with groom) */}
                <g transform="translate(108, 22)">
                  {/* Tiara & Hair */}
                  <path d="M35,16 C30,10 48,6 55,14 C58,22 52,28 45,28 C36,28 32,22 35,16 Z" fill="#3E2723" />
                  <path d="M40,14 L42,10 L45,13 L48,10 L50,14 Z" fill="#D4A574" stroke="#B8860B" strokeWidth="0.5" />
                  <circle cx="45" cy="24" r="9" fill="url(#skinGradFinal)" stroke="#1E293B" strokeWidth="0.8" />
                  {/* Wedding Dress Bodice */}
                  <path d="M36,33 C40,32 50,32 54,33 L57,58 L33,58 Z" fill="url(#dressGradFinal)" stroke="#E2E8F0" strokeWidth="0.8" />
                  {/* Wedding Dress Flared Skirt */}
                  <path d="M33,58 C25,100 0,165 -15,175 C30,178 85,178 115,175 C100,165 65,100 57,58 Z" fill="url(#dressGradFinal)" stroke="#CBD5E1" strokeWidth="0.8" />
                  {/* Bride Arm holding Bouquet */}
                  <path d="M34,42 C24,52 24,70 30,80" stroke="#F7D3C8" strokeWidth="4" strokeLinecap="round" />
                  {/* Rose Bouquet with golden highlights */}
                  <g transform="translate(24, 52)">
                    <circle cx="8" cy="8" r="10" fill="#F8BBD0" stroke="#9E4A5A" strokeWidth="0.6" />
                    <circle cx="5" cy="6" r="4" fill="#C2185B" opacity="0.75" />
                    <circle cx="11" cy="9" r="4" fill="#E91E63" opacity="0.75" />
                  </g>
                </g>
              </svg>
            </motion.div>

            {/* Glowing Hearts Bursting upon arrival */}
            <motion.div
              style={{ opacity: coupleHeartOpacity }}
              className="flex items-center justify-center gap-2 text-xs font-bold text-[#9E4A5A]"
            >
              <Heart className="h-4 w-4 fill-[#9E4A5A] text-[#9E4A5A]" />
              <span>معاً إلى الأبد بإذن الله</span>
              <Heart className="h-4 w-4 fill-[#9E4A5A] text-[#9E4A5A]" />
            </motion.div>

            <div className="pt-2 w-full flex justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#9E4A5A] via-[#B8576A] to-[#853648] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_8px_25px_rgba(158,74,90,0.25)] transition hover:scale-105"
              >
                تأكيد الحضور الآن 🤍
              </a>
            </div>

            <div className="pt-4 text-[11px] font-semibold text-[#9E4A5A]/60">
              {groomName} &amp; {brideName} &bull; {yearNumber}
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}

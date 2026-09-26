import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  Clock,
  Gift,
  GlassWater,
  Heart,
  MapPin,
  Music,
  PartyPopper,
  Send,
  Sparkles,
} from 'lucide-react';
import GtaMapViewer from '../components/GtaMapViewer';
import { invitationCoordinates } from '../lib/mapsLocation';
import { useLanguageTheme } from '../context/LanguageThemeContext';

interface TemplateProps {
  preview?: boolean;
  invitationData?: Record<string, unknown>;
  variant?: string;
}

/**
 * Single realistic pink peony artwork shipped with the project (1200 x 1200 PNG).
 * It is always rendered as ONE image at the artwork's original 1:1 proportions:
 * never cropped, never stretched and never split into two halves.
 */
const FLOWER_IMAGE = '/peony-bloom.png';

/** Custom petal variables (CSS custom properties) used by the petal stylesheet. */
type PetalStyle = React.CSSProperties & Record<string, string>;

interface PetalField {
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;
  duration: number;
  delay: number;
  sway: number;
  blur: number;
}

/** Deterministic pseudo-random so the petal field stays stable between renders. */
const seeded = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const petalStyle = (petal: PetalField, burst = false): PetalStyle => {
  const style: PetalStyle = {
    '--start-x': `${petal.left.toFixed(2)}%`,
    '--start-y': `${petal.top.toFixed(2)}%`,
    '--petal-w': `${petal.width.toFixed(1)}px`,
    '--petal-h': `${petal.height.toFixed(1)}px`,
    '--fall-time': `${petal.duration.toFixed(2)}s`,
    '--sway': `${petal.sway.toFixed(0)}px`,
    '--petal-blur': `${petal.blur.toFixed(1)}px`,
  };
  if (burst) {
    style['--burst-delay'] = `${petal.delay.toFixed(2)}s`;
    style['--top'] = `${petal.top.toFixed(2)}%`;
  } else {
    style['--fall-delay'] = `${petal.delay.toFixed(2)}s`;
  }
  return style;
};

/**
 * A light sprinkle: just 18 petals spread down the whole invitation (their
 * --start-y is % of the entire page, so they truly live in the page, not on
 * the screen). Negative delays mean a few are already drifting on arrival.
 */
const RAIN_PETALS: PetalField[] = Array.from({ length: 18 }, (_, index) => {
  const s = index + 13;
  return {
    id: index,
    left: 4 + seeded(s * 1.7) * 90,
    top: 2 + seeded(s * 2.3) * 94,
    width: 9 + seeded(s * 3.1) * 8,
    height: 15 + seeded(s * 4.7) * 11,
    duration: 11 + seeded(s * 5.9) * 8,
    delay: -seeded(s * 7.3) * 12,
    sway: 16 + seeded(s * 8.9) * 34,
    blur: seeded(s * 11.3) > 0.72 ? 1.2 : 0,
  };
});

/** 12 fast petals released around the flower itself when it is clicked. */
const BURST_PETALS: PetalField[] = Array.from({ length: 12 }, (_, index) => {
  const s = index + 907;
  const angle = seeded(s * 1.9) * Math.PI * 2;
  return {
    id: index,
    left: 50 + Math.cos(angle) * (5 + seeded(s * 2.9) * 9),
    top: 50 + Math.sin(angle) * (5 + seeded(s * 3.7) * 9) * 0.8,
    width: 9 + seeded(s * 3.3) * 8,
    height: 15 + seeded(s * 4.1) * 11,
    duration: 2 + seeded(s * 5.3) * 1.4,
    delay: seeded(s * 6.7) * 0.25,
    sway: (seeded(s * 7.9) - 0.5) * 160,
    blur: 0,
  };
});

const fallbackGallery = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&auto=format&fit=crop&q=80',
];

const fallbackProgram = [
  { time: '16:30', title: 'Guest arrival', description: 'Welcome drinks in the rose garden.' },
  { time: '17:30', title: 'The ceremony', description: 'Exchange of vows under the peony arch.' },
  { time: '19:00', title: 'Dinner & celebration', description: 'Feast, speeches and dancing until late.' },
];

const fallbackWishes = [
  { name: 'Family & Friends', message: 'Wishing you a lifetime of love, laughter and endless happiness.' },
];

const fallbackStory = [
  { year: '2019', title: 'Where it began', description: 'A quiet summer evening that changed everything.' },
  { year: '2023', title: 'The proposal', description: 'One question asked under a sky full of stars.' },
];

const programIcons = [GlassWater, Heart, PartyPopper, Music, Sparkles, Gift];

function useCountdown(targetDateStr?: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = targetDateStr ? new Date(targetDateStr).getTime() : NaN;
    if (Number.isNaN(target)) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const tick = () => {
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

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [targetDateStr]);

  return timeLeft;
}

type ScrollTarget = HTMLElement | Window;

/**
 * Admin previews scroll inside a div while public pages scroll the window,
 * so the bloom is wired to the nearest scrollable ancestor.
 */
function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current) {
    const { overflowY } = window.getComputedStyle(current);
    const scrollable = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
    if (scrollable && current.scrollHeight > current.clientHeight + 4) return current;
    current = current.parentElement;
  }
  return null;
}

const readScrollOffset = (target: ScrollTarget) =>
  target instanceof HTMLElement ? target.scrollTop : window.scrollY;

const readScrollMax = (target: ScrollTarget) =>
  target instanceof HTMLElement
    ? Math.max(0, target.scrollHeight - target.clientHeight)
    : Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

const pad = (value: number) => String(value).padStart(2, '0');

export default function PetalBloomWeddingTemplate({ preview = false, invitationData }: TemplateProps) {
  const { isRtl } = useLanguageTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  /** 0 = closed bud, 1 = fully bloomed at the artwork's original size */
  const [bloom, setBloom] = useState(0);
  const [tappedOpen, setTappedOpen] = useState(false);
  /** Petal burst released by clicking the flower */
  const [bursting, setBursting] = useState(false);
  /** Where the click burst starts, measured in % of the invitation (set when the flower is clicked) */
  const [burstOrigin, setBurstOrigin] = useState<{ x: number; y: number } | null>(null);
  const scrollTargetRef = useRef<ScrollTarget | null>(null);
  const burstTimerRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);

  // ── Owner data coming from the manage form / backend invitation record ──
  const brideName = (invitationData?.brideName as string) || (invitationData?.celebrantName as string) || 'Claire';
  const groomName = (invitationData?.groomName as string) || (invitationData?.name as string) || 'Julian';
  const eventDate = (invitationData?.date as string) || '2025-10-18';
  const eventTime = (invitationData?.time as string) || '';
  const venueName = (invitationData?.venue as string) || 'The Glasshouse';
  const venueAddress = (invitationData?.address as string) || 'Brooklyn, New York';
  const mapsUrl = (invitationData?.mapsUrl as string) || '';
  const destination = invitationCoordinates(invitationData);
  const description =
    (invitationData?.description as string) ||
    'Together with their families\ninvite you to celebrate their wedding';

  const parsedDate = useMemo(() => {
    const parsed = new Date(eventDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [eventDate]);

  const dayName =
    (invitationData?.dayName as string) ||
    (parsedDate ? parsedDate.toLocaleDateString('en-US', { weekday: 'long' }) : '');
  const dayNumber = (invitationData?.dayNumber as string) || (parsedDate ? pad(parsedDate.getDate()) : '');
  const monthName =
    (invitationData?.monthName as string) ||
    (parsedDate ? parsedDate.toLocaleDateString('en-US', { month: 'long' }).toUpperCase() : '');
  const yearNumber = (invitationData?.yearNumber as string) || (parsedDate ? String(parsedDate.getFullYear()) : '');
  const displayDate =
    (invitationData?.dateLabel as string) ||
    (invitationData?.dateDisplayFull as string) ||
    (parsedDate
      ? parsedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : eventDate);
  const displayTime = eventTime;

  const countdownTarget = useMemo(() => {
    const clock = displayTime.match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0];
    return clock ? `${eventDate}T${clock}` : eventDate;
  }, [eventDate, displayTime]);
  const countdown = useCountdown(countdownTarget);

  const galleryImages =
    Array.isArray(invitationData?.gallery) && invitationData.gallery.length > 0
      ? (invitationData.gallery as string[])
      : fallbackGallery;

  const programList =
    Array.isArray(invitationData?.program) && invitationData.program.length > 0
      ? (invitationData.program as Array<Record<string, string>>).map((item, index) => ({
          time: item.time || '',
          title: item.title || '',
          description: item.description || item.desc || '',
          location: item.location || '',
          icon: programIcons[index % programIcons.length],
        }))
      : fallbackProgram.map((item, index) => ({
          ...item,
          location: '',
          icon: programIcons[index % programIcons.length],
        }));

  const storyList =
    Array.isArray(invitationData?.storyEvents) && invitationData.storyEvents.length > 0
      ? (invitationData.storyEvents as Array<Record<string, string>>).map((item) => ({
          year: item.year || '',
          title: item.title || '',
          description: item.description || '',
        }))
      : fallbackStory;

  const [wishes, setWishes] = useState<Array<{ name: string; message: string }>>(() =>
    Array.isArray(invitationData?.wishes) && invitationData.wishes.length > 0
      ? (invitationData.wishes as Array<{ name?: string; message?: string }>).map((wish) => ({
          name: wish.name || '',
          message: wish.message || '',
        }))
      : fallbackWishes
  );
  const [guestName, setGuestName] = useState('');
  const [guestWish, setGuestWish] = useState('');

  const handleAddWish = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!guestName.trim() || !guestWish.trim()) return;
    setWishes((prev) => [...prev, { name: guestName.trim(), message: guestWish.trim() }]);
    setGuestName('');
    setGuestWish('');
  };

  const rsvpPhone = (invitationData?.whatsappPhone as string) || (invitationData?.clientPhone as string) || '';
  const cleanPhone = rsvpPhone.replace(/[^0-9]/g, '');
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hi ${brideName} & ${groomName}, we would be delighted to celebrate your wedding with you!`
      )}`
    : '';
  const mapQuery = venueAddress || venueName;

  // ── Scroll behaviour: scrolling DOWN blooms the flower open at its original
  //    size, scrolling UP closes it back into a bud. ──
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const target: ScrollTarget = findScrollParent(node) ?? window;
    scrollTargetRef.current = target;
    let previous = readScrollOffset(target);
    let frame = 0;

    const update = () => {
      const offset = readScrollOffset(target);
      const max = readScrollMax(target);
      const viewport = target instanceof HTMLElement ? target.clientHeight : window.innerHeight;
      const delta = offset - previous;

      if (Math.abs(delta) > 1) {
        // Scrolling up → close the bloom again.
        if (delta < 0) setTappedOpen(false);
        previous = offset;
      }

      // Progressive bloom while the page is being scrolled down: the flower is
      // fully open once the guest has scrolled roughly one extra screen.
      const span = Math.min(max > 0 ? max * 0.55 : viewport, Math.max(1, viewport * 1.2));
      const next = span > 0 ? Math.min(1, Math.max(0, offset / span)) : 0;
      setBloom((previousBloom) => (Math.abs(next - previousBloom) < 0.008 ? previousBloom : next));
    };

    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    update();
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [preview]);

  // Clear any pending burst / auto-scroll timers when the invitation unmounts.
  useEffect(
    () => () => {
      if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    },
    []
  );

  /** Smoothly scrolls the current scroll host down by roughly one screen. */
  const scrollDownOneScreen = useCallback(() => {
    const target = scrollTargetRef.current ?? window;
    const viewport = target instanceof HTMLElement ? target.clientHeight : window.innerHeight;
    const distance = Math.max(160, Math.round(viewport * 0.92));

    if (target instanceof HTMLElement) {
      target.scrollTo({ top: readScrollOffset(target) + distance, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.scrollY + distance, behavior: 'smooth' });
    }
  }, []);

  /**
   * Clicking the flower: full bloom + a petal burst falling from the blossom,
   * then the page automatically glides down to the invitation details while the
   * petals keep raining over every following section.
   */
  const toggleBloom = useCallback(() => {
    const next = !tappedOpen;
    setTappedOpen(next);
    setBloom(next ? 1 : 0);

    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);

    if (!next) {
      setBursting(false);
      return;
    }

    // Measure where the flower sits inside the invitation so the burst can
    // start exactly there (percentages of the whole page).
    const root = rootRef.current;
    const stage = stageRef.current;
    if (root && stage) {
      const page = root.getBoundingClientRect();
      const spot = stage.getBoundingClientRect();
      if (page.height > 0) {
        setBurstOrigin({
          x: ((spot.left + spot.width / 2 - page.left) / page.width) * 100,
          y: ((spot.top + spot.height * 0.42 - page.top) / page.height) * 100,
        });
      }
    }

    setBursting(true);
    burstTimerRef.current = window.setTimeout(() => setBursting(false), 3200);
    scrollTimerRef.current = window.setTimeout(() => scrollDownOneScreen(), 620);
  }, [scrollDownOneScreen, tappedOpen]);

  const open = tappedOpen || bloom > 0.28;
  const flowerScale = 0.72 + 0.28 * bloom;
  const flowerRotate = -8 + 8 * bloom;
  const flowerFilter = `saturate(${(0.82 + 0.2 * bloom).toFixed(3)}) brightness(${(
    0.9 + 0.12 * bloom
  ).toFixed(3)}) contrast(${(0.96 + 0.06 * bloom).toFixed(3)})`;
  const haloStyle = {
    transform: `scale(${(0.8 + 0.35 * bloom).toFixed(3)})`,
    opacity: Number((0.22 + 0.5 * bloom).toFixed(3)),
  };
  const countdownItems = [
    { label: 'Days', value: countdown.days },
    { label: 'Hours', value: countdown.hours },
    { label: 'Minutes', value: countdown.minutes },
    { label: 'Seconds', value: countdown.seconds },
  ];

  // Petals live inside the invitation (in page flow): a faint sprinkle drifts
  // down the whole page, and the click burst starts exactly at the flower.
  const rainLayer = (
    <div
      className={`pb-petal-rain ${open ? 'is-rain-open' : ''} ${bursting ? 'is-bursting' : ''}`}
      aria-hidden="true"
    >
      <span className="pb-petal-fall">
        {RAIN_PETALS.map((petal) => (
          <i key={petal.id} style={petalStyle(petal)} />
        ))}
      </span>
      {bursting && (
        <span
          className="pb-petal-burst"
          style={
            burstOrigin
              ? ({
                  '--burst-x': `${burstOrigin.x.toFixed(2)}%`,
                  '--burst-y': `${burstOrigin.y.toFixed(2)}%`,
                  '--burst-pad': `${Math.max(0, burstOrigin.y + 2).toFixed(2)}%`,
                } as PetalStyle)
              : undefined
          }
        >
          {BURST_PETALS.map((petal) => (
            <i key={petal.id} style={petalStyle(petal, true)} />
          ))}
        </span>
      )}
    </div>
  );

  return (
    <div
      ref={rootRef}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`petal-bloom-invitation invitation-scope ${open ? 'is-open' : 'is-closed'}`}
    >
      <style>{`
        .petal-bloom-invitation { --ink: #534b47; --rose: #c18b8e; position: relative; isolation: isolate; color: var(--ink); background: #eee9e1; font-family: Georgia, 'Times New Roman', serif; }
        .petal-bloom-invitation::before, .petal-bloom-invitation::after { position: absolute; z-index: -1; content: ''; pointer-events: none; border: 1px solid rgba(193,139,142,.23); border-radius: 50%; }
        .petal-bloom-invitation::before { width: min(75vw, 820px); height: min(75vw, 820px); top: 14%; }
        .petal-bloom-invitation::after { width: min(92vw, 1020px); height: min(92vw, 1020px); top: 6%; border-color: rgba(193,139,142,.1); }
        .petal-bloom-invitation .pb-cover, .petal-bloom-invitation .pb-details { position: relative; isolation: isolate; display: flex; min-height: 100svh; flex-direction: column; align-items: center; overflow: hidden; padding: clamp(32px, 7vh, 78px) 20px 28px; color: var(--ink); background: radial-gradient(circle at 50% 42%, #fffdf9 0%, #faf7f0 47%, #eee9e1 100%); font-family: Georgia, 'Times New Roman', serif; }
        .pb-grain { position: absolute; inset: 0; z-index: -1; opacity: .17; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.12'/%3E%3C/svg%3E"); }
        .pb-eyebrow { margin: 0; color: var(--rose); font-size: 10px; letter-spacing: .38em; text-transform: uppercase; }
        .pb-hero { position: relative; display: grid; width: 100%; min-height: min(68vh, 720px); grid-template-columns: 1fr; align-items: center; justify-items: center; margin: clamp(24px, 4vh, 48px) auto 0; }
        .pb-name { display: flex; flex-direction: column; gap: 9px; color: var(--ink); font-size: clamp(28px, 4.1vw, 54px); font-style: italic; letter-spacing: -.055em; line-height: .9; white-space: nowrap; }
        .pb-name small { color: #a99e96; font-family: Arial, sans-serif; font-size: 8px; font-style: normal; letter-spacing: .24em; text-transform: uppercase; }
        .pb-name-left { position: absolute; left: 13%; top: 16%; z-index: 4; align-items: flex-end; text-align: right; transform: rotate(-8deg); }
        .pb-name-right { position: absolute; right: 13%; bottom: 16%; z-index: 4; align-items: flex-start; transform: rotate(-8deg); }
      .pb-flower-stage { position: relative; z-index: 2; display: grid; place-items: center; width: min(92vw, 460px); aspect-ratio: 1 / 1; }
        .pb-flower-halo { position: absolute; width: 76%; aspect-ratio: 1; border-radius: 50%; background: rgba(226,171,169,.24); filter: blur(34px); pointer-events: none; transition: transform .55s ease, opacity .55s ease; }
        .pb-flower-button { position: relative; z-index: 1; display: grid; place-items: center; width: 100%; height: 100%; padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer; }
        /* ONE realistic pink flower, rendered at the artwork's original 1:1 proportions */
        .pb-flower { display: block; width: 100%; height: 100%; max-width: 100%; object-fit: contain; transform-origin: 50% 62%; will-change: transform, filter; transition: transform .6s cubic-bezier(.16,1,.3,1), filter .6s ease; }
        /* ── Petal rain: an in-flow layer covering the whole invitation, so the
              petals truly live in the page (never a screen overlay). Faint
              sprinkle that blooms stronger once the flower opens. ── */
        .pb-petal-rain { position: absolute; inset: 0; z-index: 1; overflow: hidden; pointer-events: none; opacity: .45; transition: opacity .8s ease; }
        .pb-petal-rain .pb-petal-fall { position: absolute; inset: 0; display: block; }
        .pb-petal-rain.is-rain-open { opacity: .9; }
        .pb-petal-rain.is-bursting { animation: pb-rain-swell 1.2s ease; }
        .pb-petal-fall i, .pb-petal-burst i { position: absolute; top: var(--start-y, 4%); left: var(--start-x, 50%); width: var(--petal-w, 13px); height: var(--petal-h, 21px); border-radius: 76% 24% 68% 32%; background: radial-gradient(ellipse at 28% 22%, rgba(255,255,255,.62), transparent 24%), linear-gradient(135deg, #f5c7c5 0%, #d98f9b 54%, #b96778 100%); box-shadow: inset -2px -3px 3px rgba(112,48,65,.2), 1px 3px 4px rgba(100,61,64,.12); opacity: 0; transform-origin: 48% 10%; filter: blur(var(--petal-blur, 0px)); will-change: transform, opacity; }
        .pb-petal-fall i { animation: pb-petal-drop var(--fall-time, 15s) linear infinite; animation-delay: var(--fall-delay, 0s); }
        .pb-petal-burst i { --start-x: var(--burst-x, 50%); --start-y: var(--burst-y, 7%); animation: pb-petal-burst var(--fall-time, 3.2s) cubic-bezier(.22,.61,.36,1) forwards; animation-delay: var(--burst-delay, 0s); }
        .pb-petal-rain.is-bursting .pb-petal-fall i { animation-duration: calc(var(--fall-time, 15s) / 2.2); }
        /* Rain lives inside the invitation (in-flow), so the drop distance is a
           share of the whole page — the petals drift gently down their own patch
           instead of racing past the screen. */
        .pb-petal-fall { --band: 9%; }
        @keyframes pb-petal-drop {
          0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg) scale(.55); }
          9% { opacity: .95; }
          32% { transform: translate3d(calc(var(--sway, 26px) * .75), calc(var(--band) * .3), 0) rotate(150deg) scale(.95); }
          58% { opacity: .88; transform: translate3d(calc(var(--sway, 26px) * -1), calc(var(--band) * .6), 0) rotate(320deg) scale(.82); }
          82% { opacity: .78; transform: translate3d(calc(var(--sway, 26px) * .55), calc(var(--band) * .85), 0) rotate(500deg) scale(.94); }
          100% { opacity: 0; transform: translate3d(calc(var(--sway, 26px) * -.45), var(--band), 0) rotate(680deg) scale(.7); }
        }
        /* Burst layer: absolutely placed at the clicked flower inside the
           invitation (in-flow), so the petals start at the blossom and rain
           down a share of the page beneath it. */
        .pb-petal-burst { position: absolute; left: 0; right: 0; top: 0; display: block; pointer-events: none; padding-top: var(--burst-pad, 0); }
        @keyframes pb-petal-burst {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(0deg) scale(.45); }
          12% { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--sway, 40px)), calc(-50% + var(--band, 22%))) rotate(720deg) scale(.9); }
        }
        .pb-petal-burst { --band: 22%; }
        @keyframes pb-rain-swell { 0% { transform: scale(1); } 26% { transform: scale(1.045); } 100% { transform: scale(1); } }
        .pb-bloom-hint { position: absolute; z-index: 4; bottom: 1%; display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px; border: 1px solid rgba(193,139,142,.4); background: rgba(255,253,249,.85); color: #786e68; font-family: Arial, sans-serif; font-size: 8px; letter-spacing: .2em; text-transform: uppercase; animation: pb-pulse 2.4s infinite; }
      .pb-date-block { display: flex; align-items: center; gap: 17px; margin-top: clamp(12px, 2vh, 22px); }
        .pb-date-line { width: clamp(36px, 8vw, 90px); height: 1px; background: #d5b0b0; }
        .pb-date-copy { display: flex; align-items: center; gap: 9px; color: #786e68; }
        .pb-date-copy strong { font-size: 38px; font-weight: 400; line-height: 1; }
        .pb-date-copy span { font-family: Arial, sans-serif; font-size: 8px; letter-spacing: .18em; line-height: 1.55; }
        .pb-date-copy em { color: var(--rose); font-style: normal; }
        .pb-invitation-note { margin: 25px 0 0; max-width: 32rem; color: #897d75; font-size: 12px; font-style: italic; line-height: 1.7; text-align: center; white-space: pre-line; }
        .pb-location { margin: 15px 0 0; color: #a39992; font-family: Arial, sans-serif; font-size: 8px; letter-spacing: .18em; text-transform: uppercase; }
        .pb-scroll-note { position: absolute; bottom: 26px; margin: 0; color: #b2a6a0; font-family: Arial, sans-serif; font-size: 8px; letter-spacing: .24em; text-transform: uppercase; }
        .pb-details { justify-content: center; min-height: 100svh; padding: 80px 24px; text-align: center; background: #f4eee7; }
        .pb-details h1 { margin: 22px 0 28px; color: var(--ink); font-size: clamp(42px, 7.4vw, 96px); font-style: italic; font-weight: 400; letter-spacing: -.07em; }
        .pb-details h1 span { color: var(--rose); font-size: .7em; }
        .pb-details-date, .pb-details-copy { color: #897d75; font-size: 16px; font-style: italic; line-height: 1.8; white-space: pre-line; }
        .pb-details-date strong { color: var(--rose); font-size: 11px; font-family: Arial, sans-serif; letter-spacing: .22em; text-transform: uppercase; }
        .pb-details-rule { width: 80px; height: 1px; margin: 28px auto; background: #d5b0b0; }
        .pb-details-place { margin-top: 36px; color: var(--ink); font-size: 18px; line-height: 1.7; }
        .pb-details-place span { color: #a39992; font-family: Arial, sans-serif; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; }
        .pb-map-wrap { margin-top: 32px; width: 100%; max-width: 420px; }
        /* Revealed while the flower is blooming (opened by scrolling down) */
        .pb-reveal { opacity: .4; transform: translateY(26px); transition: opacity .9s ease, transform .9s cubic-bezier(.16,1,.3,1); }
        .is-open .pb-reveal { opacity: 1; transform: none; }
        @keyframes pb-pulse { 0%,100% { opacity: .35; } 50% { opacity: .95; } }
        @media (max-width: 620px) {
          .pb-cover { padding-top: 34px; }
          .pb-hero { width: 100%; min-height: 66vh; margin-top: 38px; }
          .pb-name-left { left: 6%; top: 14%; transform: rotate(-7deg); }
          .pb-name-right { right: 6%; bottom: 14%; transform: rotate(-7deg); }
          .pb-name { font-size: clamp(20px, 6.4vw, 30px); }
          .pb-flower-stage { width: min(94vw, 360px); }
          .pb-name small { font-size: 6px; letter-spacing: .16em; }
          .pb-location { letter-spacing: .1em; }
        }
      `}</style>

      {/* ══════ PETAL RAIN — a faint sprinkle living inside the page, all the way down ══════ */}
      {rainLayer}

      {/* ══════════ COVER — the single pink peony blooms when scrolling down ══════════ */}
      <section className="pb-cover" aria-label="Wedding invitation cover">
        <div className="pb-grain" aria-hidden="true" />
        <p className="pb-eyebrow">{dayName ? `${dayName} · A celebration of love` : 'A celebration of love'}</p>

        <div className="pb-hero">
          <div className="pb-name pb-name-left">
            <span>{brideName}</span>
            <small>the bride</small>
          </div>

          <div className="pb-flower-stage" ref={stageRef}>
            <span className="pb-flower-halo" style={haloStyle} aria-hidden="true" />
            <button
              type="button"
              className="pb-flower-button"
              aria-label={`${brideName} and ${groomName} wedding invitation`}
              aria-pressed={open}
              onClick={toggleBloom}
            >
              <img
                className="pb-flower"
                src={FLOWER_IMAGE}
                alt={`Pink peony for the wedding of ${brideName} and ${groomName}`}
                width={1200}
                height={1200}
                style={{
                  transform: `rotate(${flowerRotate.toFixed(2)}deg) scale(${flowerScale.toFixed(3)})`,
                  filter: flowerFilter,
                }}
              />
            </button>
            <AnimatePresence>
              {!open && (
                <motion.span
                  key="bloom-hint"
                  className="pb-bloom-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ChevronDown className="h-3 w-3" /> Click the flower — petals fall
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="pb-name pb-name-right">
            <span>{groomName}</span>
            <small>the groom</small>
          </div>
        </div>

        <div className="pb-date-block">
          <span className="pb-date-line" />
          <div className="pb-date-copy">
            <strong>{dayNumber}</strong>
            <span>
              {monthName}
              <br />
              <em>{yearNumber}</em>
            </span>
          </div>
          <span className="pb-date-line" />
        </div>
        {displayTime && <p className="pb-location">{displayTime}</p>}
        <p className="pb-invitation-note">{description}</p>
        <p className="pb-location">
          {venueName} &nbsp;&middot;&nbsp; {venueAddress}
        </p>
        <p className="pb-scroll-note">
          {open ? 'The bloom is open — scroll up to close it' : 'Scroll down to open the bloom'}
        </p>
      </section>

      {/* ══════════ DETAILS — revealed while the bloom is open ══════════ */}
      <section id="petal-bloom-details" className="pb-details pb-reveal" aria-label="Wedding details">
        <p className="pb-eyebrow">{dayName ? `${dayName} · Please join us` : 'Please join us'}</p>
        <h1>
          {brideName} <span>&amp;</span> {groomName}
        </h1>
        <p className="pb-details-date">
          {displayDate}
          {displayTime ? (
            <>
              <br />
              <strong>{displayTime}</strong>
            </>
          ) : null}
        </p>
        <div className="pb-details-rule" />
        <p className="pb-details-copy">{description}</p>
        <p className="pb-details-place">
          {venueName}
          <br />
          <span>{venueAddress}</span>
        </p>

        {!preview && (
          <div className="pb-map-wrap">
            <GtaMapViewer
              locationQuery={mapQuery}
              title={venueName}
              locationName={venueName}
              address={venueAddress}
              theme="rose"
              isRtl={isRtl}
              googleMapsUrl={mapsUrl}
              latitude={destination?.latitude ?? null}
              longitude={destination?.longitude ?? null}
            />
          </div>
        )}
      </section>

      {/* ══════════ COUNTDOWN ═════════ */}
      <section className="bg-[#f4eee7] px-5 py-16 text-center" aria-label="Countdown">
        <p className="pb-eyebrow">Counting the moments</p>
        <h2 className="mt-3 font-serif text-3xl italic text-[#534b47]">Until we say “I do”</h2>
        <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
          {countdownItems.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#e7d6d2] bg-white/85 px-3 py-4 shadow-[0_12px_30px_rgba(193,139,142,0.08)]"
            >
              <div className="font-serif text-3xl text-[#c18b8e]">{pad(item.value)}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a99e96]">
                {item.label}
              </div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-sm text-sm text-[#8a7f78]">
          {displayDate}
          {displayTime ? ` · ${displayTime}` : ''}
        </p>
      </section>

      {/* ═════════ OUR STORY ══════════ */}
      <section className="bg-[#fffdf9] px-5 py-16" aria-label="Our story">
        <div className="mx-auto max-w-xl text-center">
          <p className="pb-eyebrow">Our story</p>
          <h2 className="mt-3 font-serif text-3xl italic text-[#534b47]">The road to forever</h2>
        </div>
        <div className="mx-auto mt-10 max-w-xl space-y-5">
          {storyList.map((item, index) => (
            <motion.article
              key={`${item.year}-${index}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="rounded-2xl border border-[#ecdcd8] bg-white/85 p-5 shadow-[0_14px_36px_rgba(193,139,142,0.08)]"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e5c7c4] bg-[#faf3f0] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c18b8e]">
                <Heart className="h-3 w-3" />
                {item.year}
              </span>
              <h3 className="mt-3 font-serif text-xl italic text-[#534b47]">{item.title}</h3>
              {item.description && <p className="mt-2 text-sm leading-relaxed text-[#8a7f78]">{item.description}</p>}
            </motion.article>
          ))}
        </div>
      </section>

      {/* ══════════ PROGRAMME ═════════ */}
      <section className="bg-[#f4eee7] px-5 py-16" aria-label="Wedding programme">
        <div className="mx-auto max-w-xl text-center">
          <p className="pb-eyebrow">The day</p>
          <h2 className="mt-3 font-serif text-3xl italic text-[#534b47]">Wedding programme</h2>
        </div>
        <div className="mx-auto mt-10 max-w-xl space-y-4">
          {programList.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={`${item.time}-${index}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="rounded-2xl border border-[#ecdcd8] bg-white/90 p-4 shadow-[0_14px_36px_rgba(193,139,142,0.08)]"
              >
                <div className="flex items-center justify-between gap-3 border-b border-[#f3e3df] pb-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e5c7c4] bg-[#faf3f0] text-[#c18b8e]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate font-serif text-lg italic text-[#534b47]">{item.title}</span>
                  </div>
                  {item.time && (
                    <span className="shrink-0 rounded-full border border-[#e5c7c4] bg-[#faf3f0] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#c18b8e]">
                      {item.time}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-3 text-sm leading-relaxed text-[#8a7f78]">{item.description}</p>
                )}
                {item.location && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[#a99e96]">
                    <MapPin className="h-3 w-3" /> {item.location}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══════════ GALLERY ═════════ */}
      <section className="bg-[#fffdf9] px-5 py-16" aria-label="Gallery">
        <div className="mx-auto max-w-xl text-center">
          <p className="pb-eyebrow">Our moments</p>
          <h2 className="mt-3 font-serif text-3xl italic text-[#534b47]">A few of our favourite memories</h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-3">
          {galleryImages.slice(0, 8).map((image, index) => (
            <motion.div
              key={`${image}-${index}`}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#ecdcd8] bg-[#faf3f0] shadow-[0_14px_36px_rgba(193,139,142,0.08)]"
            >
              <img
                src={image}
                alt={`${brideName} and ${groomName} memory ${index + 1}`}
                loading="lazy"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═════════ GUESTBOOK WISHES ═════════ */}
      <section className="bg-[#f4eee7] px-5 py-16" aria-label="Guest wishes">
        <div className="mx-auto max-w-xl text-center">
          <p className="pb-eyebrow">Guestbook</p>
          <h2 className="mt-3 font-serif text-3xl italic text-[#534b47]">Wishes for the newlyweds</h2>
        </div>

        <div className="mx-auto mt-10 max-w-xl space-y-4">
          <AnimatePresence initial={false}>
            {wishes.map((wish, index) => (
              <motion.blockquote
                key={`${wish.name}-${index}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-[#ecdcd8] bg-white/90 p-4 shadow-[0_14px_36px_rgba(193,139,142,0.08)]"
              >
                <p className="font-serif text-base italic leading-relaxed text-[#6f645e]">“{wish.message}”</p>
                <footer className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c18b8e]">
                  <Heart className="h-3 w-3" /> {wish.name}
                </footer>
              </motion.blockquote>
            ))}
          </AnimatePresence>

          <form
            onSubmit={handleAddWish}
            className="rounded-2xl border border-[#e5c7c4] bg-white/90 p-4 shadow-[0_14px_36px_rgba(193,139,142,0.08)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a99e96]">Leave your wish</p>
            <input
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder="Your name"
              className="mt-3 w-full rounded-xl border border-[#ecdcd8] bg-[#fffdf9] px-3.5 py-2.5 text-sm text-[#534b47] outline-none focus:border-[#c18b8e]"
            />
            <textarea
              value={guestWish}
              onChange={(event) => setGuestWish(event.target.value)}
              rows={3}
              placeholder="Write a message for the couple…"
              className="mt-2 w-full rounded-xl border border-[#ecdcd8] bg-[#fffdf9] px-3.5 py-2.5 text-sm text-[#534b47] outline-none focus:border-[#c18b8e]"
            />
            <button
              type="submit"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#c18b8e] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#ad787c]"
            >
              <Send className="h-3.5 w-3.5" /> Send your wish
            </button>
          </form>
        </div>
      </section>

      {/* ═════════ WHEN & WHERE ═════════ */}
      <section className="bg-[#fffdf9] px-5 py-16" aria-label="When and where">
        <div className="mx-auto max-w-xl text-center">
          <p className="pb-eyebrow">When &amp; where</p>
          <h2 className="mt-3 font-serif text-3xl italic text-[#534b47]">Save the date</h2>
        </div>

        <div className="mx-auto mt-10 max-w-xl space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-[#ecdcd8] bg-white/90 p-4 shadow-[0_14px_36px_rgba(193,139,142,0.08)]">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#c18b8e]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a99e96]">Date</p>
              <p className="mt-1 text-sm font-medium text-[#534b47]">{displayDate}</p>
            </div>
          </div>

          {displayTime && (
            <div className="flex items-start gap-3 rounded-2xl border border-[#ecdcd8] bg-white/90 p-4 shadow-[0_14px_36px_rgba(193,139,142,0.08)]">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#c18b8e]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a99e96]">Time</p>
                <p className="mt-1 text-sm font-medium text-[#534b47]">{displayTime}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-[#ecdcd8] bg-white/90 p-4 shadow-[0_14px_36px_rgba(193,139,142,0.08)]">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#c18b8e]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a99e96]">Venue</p>
              <p className="mt-1 text-sm font-medium text-[#534b47]">{venueName}</p>
              <p className="text-xs text-[#8a7f78]">{venueAddress}</p>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c18b8e] underline-offset-4 hover:underline"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ RSVP ═════════ */}
      <section className="bg-[#f4eee7] px-5 py-16 text-center" aria-label="RSVP">
        <div className="mx-auto max-w-xl">
          <p className="pb-eyebrow">RSVP</p>
          <h2 className="mt-3 font-serif text-3xl italic text-[#534b47]">Will you celebrate with us?</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#8a7f78]">
            Your presence means the world to us — please confirm your attendance so we can keep a seat with your name
            on it.
          </p>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_rgba(37,211,102,0.28)] transition hover:brightness-105"
            >
              <Send className="h-4 w-4" /> Confirm on WhatsApp
            </a>
          ) : (
            <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-[#a99e96]">
              RSVP contact will appear here once added by the hosts
            </p>
          )}
          {cleanPhone && <p className="mt-4 text-xs tracking-[0.2em] text-[#a99e96]">{rsvpPhone}</p>}
        </div>
      </section>

      {/* ═════════ FOOTER ═════════ */}
      <footer className="relative overflow-hidden bg-[#eee9e1] px-5 py-16 text-center">
        <div className="pb-grain" aria-hidden="true" />
        <img
          src={FLOWER_IMAGE}
          alt=""
          width={1200}
          height={1200}
          aria-hidden="true"
          style={{ objectFit: 'contain', width: '84px', height: '84px', margin: '0 auto' }}
        />
        <p className="mt-5 font-serif text-3xl italic text-[#534b47]">
          {brideName} <span className="text-[#c18b8e]">&amp;</span> {groomName}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.32em] text-[#a99e96]">
          {displayDate}
          {displayTime ? ` · ${displayTime}` : ''}
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.32em] text-[#a99e96]">
          {venueName}
          {venueAddress ? ` · ${venueAddress}` : ''}
        </p>
        <a
          href="#petal-bloom-details"
          className="mt-8 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c18b8e]"
        >
          <ChevronDown className="h-3.5 w-3.5" /> Back to the bloom
        </a>
      </footer>
    </div>
  );
}
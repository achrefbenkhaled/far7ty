import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Clock, Calendar, Play, Pause, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import GtaMapViewer from '../components/GtaMapViewer';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { Header } from '../components/Header';
import { ShareModal } from '../components/ShareModal';
import { loadTemplateState, saveTemplateState } from '../lib/templateShareState';
import {
  defaultInvitationContent,
  type InvitationContent,
} from '../data/templates';

interface TemplateProps {
  preview?: boolean;
  invitationData?: Record<string, unknown>;
}

export default function TwainLoveWeddingTemplate({ preview = false, invitationData }: TemplateProps) {
  const { t, isRtl } = useLanguageTheme();
  const getText = (key: string, fallback: string) => typeof invitationData?.[key] === 'string' ? invitationData[key] as string : fallback;
  const [isOpen, setIsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedMapIndex, setSelectedMapIndex] = useState(0);
  const [showAllEventsMobile, setShowAllEventsMobile] = useState(false);
  const [content, setContent] = useState<InvitationContent>(() => {
    const fallback = loadTemplateState('twain-love-wedding', defaultInvitationContent);
    const custom = invitationData?.customization;
    const baseContent = {
      ...defaultInvitationContent,
      ...fallback,
      ...(custom && typeof custom === 'object' ? custom as Partial<InvitationContent> : {}),
    };
    const cleanedCards = (baseContent.eventCards || defaultInvitationContent.eventCards).map((card, idx) => {
      if (!card.address || card.address.includes('Romance City') || card.mapQuery?.includes('Romance City') || card.location?.includes('Romance City')) {
        return defaultInvitationContent.eventCards[idx] || defaultInvitationContent.eventCards[0];
      }
      return card;
    });
    return {
      ...baseContent,
      coupleNames: [getText('brideName', fallback.coupleNames[0]), getText('groomName', fallback.coupleNames[1])],
      dateLabel: `${getText('date', fallback.dateLabel)}${invitationData?.time ? ` · ${getText('time', '')}` : ''}`,
      description: getText('description', fallback.description),
      eventCards: cleanedCards.map((event, index) => index === 0 ? { ...event, date: getText('date', event.date), time: getText('time', event.time), location: getText('venue', event.location), address: getText('address', event.address), mapQuery: getText('mapsUrl', event.mapQuery ?? '') } : event),
    };
  });

  const canEditTemplate = false;

  useEffect(() => {
    if (!invitationData) saveTemplateState('twain-love-wedding', content);
  }, [content, invitationData]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const updateStoryItem = (index: number, field: 'year' | 'title' | 'description', value: string) => {
    setContent((current) => ({
      ...current,
      storyEvents: current.storyEvents.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateEventItem = (
    index: number,
    field: 'date' | 'title' | 'time' | 'location' | 'address' | 'description' | 'mapQuery',
    value: string
  ) => {
    setContent((current) => ({
      ...current,
      eventCards: current.eventCards.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addEventItem = () => {
    setContent((current) => ({
      ...current,
      eventCards: [
        ...current.eventCards,
        { date: '', title: 'New Event', time: '', location: '', address: '', description: '', mapQuery: '' },
      ],
    }));
  };

  const removeEventItem = (index: number) => {
    setContent((current) => ({
      ...current,
      eventCards: current.eventCards.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateWishItem = (index: number, field: 'name' | 'message', value: string) => {
    setContent((current) => ({
      ...current,
      wishes: current.wishes.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addWishItem = () => {
    setContent((current) => ({
      ...current,
      wishes: [...current.wishes, { name: 'New Guest', message: 'Wishing you joy and love.' }],
    }));
  };

  const removeWishItem = (index: number) => {
    setContent((current) => ({
      ...current,
      wishes: current.wishes.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateColor = (
    field:
      | 'pageBackground'
      | 'envelopeTop'
      | 'envelopeMiddle'
      | 'envelopeBottom'
      | 'envelopeBorder'
      | 'envelopeTextPrimary'
      | 'envelopeTextSecondary'
      | 'envelopeLabelText'
      | 'accentColor',
    value: string
  ) => {
    setContent((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const sortedEventCards = [...content.eventCards].sort((a, b) => {
    const aTime = Date.parse(a.date || '2099-01-01');
    const bTime = Date.parse(b.date || '2099-01-01');
    return aTime - bTime;
  });

  const selectedMapEvent = sortedEventCards[selectedMapIndex] ?? sortedEventCards[0] ?? null;

  const [isMobileLocked, setIsMobileLocked] = useState(false);
  const [mobileProgress, setMobileProgress] = useState(0);

  // Auto-change events every 7 seconds on mobile unless locked by user click
  useEffect(() => {
    if (isMobileLocked || sortedEventCards.length <= 1) return;

    const intervalMs = 100;
    const step = (intervalMs / 7000) * 100; // 7 seconds total duration

    const timer = setInterval(() => {
      setMobileProgress((prev) => {
        if (prev + step >= 100) {
          setSelectedMapIndex((curr) => (curr + 1) % sortedEventCards.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isMobileLocked, sortedEventCards.length]);

  const handleSelectEvent = (index: number, manual = true) => {
    setSelectedMapIndex(index);
    if (manual) {
      setIsMobileLocked(true);
      setMobileProgress(100);
    }
  };

  const handleResumeAutoPlay = () => {
    setIsMobileLocked(false);
    setMobileProgress(0);
  };

  return (
    <div className={`min-h-screen text-[#3d3933] ${isRtl ? 'rtl' : 'ltr'}`} style={{ backgroundColor: content.pageBackground }}>
      {!preview && (
        <Header
        />
      )}

      {canEditTemplate && !preview && (
        <div className="sticky top-4 z-30 flex justify-end gap-2 px-4 pt-4">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="rounded-full border border-pink-400/30 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 px-4 py-2 text-sm font-semibold text-pink-200 shadow-lg backdrop-blur transition hover:from-pink-500/30 hover:to-fuchsia-500/30 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" /> Generate Link
          </button>
          <button
            type="button"
            onClick={() => setIsEditorOpen((prev) => !prev)}
            className="rounded-full border border-pink-400/30 bg-pink-500/15 px-4 py-2 text-sm font-semibold text-pink-200 shadow-lg backdrop-blur transition hover:bg-pink-500/25"
          >
            {isEditorOpen ? 'Hide Editor' : 'Edit Content'}
          </button>
        </div>
      )}

      {canEditTemplate && isEditorOpen ? (
        <div className={`fixed top-16 z-40 max-h-[calc(100vh-5rem)] w-[min(92vw,420px)] overflow-auto rounded-3xl border border-slate-200/20 bg-slate-950/95 p-4 shadow-2xl backdrop-blur ${isRtl ? 'left-4 text-right' : 'right-4 text-left'}`}>
          <div className={`flex items-center justify-between gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <p className="text-[10px] uppercase tracking-[0.35em] text-pink-300">{t('invitation_builder')}</p>
              <h3 className="text-lg font-semibold text-white">{t('edit_the_invitation')}</h3>
            </div>
            <button
              type="button"
              onClick={() => setContent(defaultInvitationContent)}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/20 transition-colors"
            >
              {t('reset')}
            </button>
          </div>

          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-pink-400/20 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-slate-900/60 p-3 text-left">
              <p className="text-[10px] uppercase tracking-[0.35em] text-pink-300">{t('live_preview')}</p>
              <p className="mt-2 font-playfair text-lg text-white">
                {content.coupleNames[0]} & {content.coupleNames[1]}
              </p>
              <p className="mt-1 text-sm text-slate-300">{content.introLabel}</p>
              <p className="mt-2 text-sm text-slate-400">{content.dateLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{content.description}</p>
            </div>

            {/* Generate Shareable URL Button */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-amber-500 py-3 px-4 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t('generate_shareable_url') || 'Generate Shareable URL'}</span>
            </button>

            {/* Story Timeline Toggle */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <label className={`flex items-center justify-between cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="text-xs uppercase tracking-[0.25em] text-pink-300 font-semibold">
                  {t('show_story_timeline') || 'Show Story Timeline'}
                </span>
                <input
                  type="checkbox"
                  checked={content.showStoryTimeline !== false}
                  onChange={(e) => setContent((current) => ({ ...current, showStoryTimeline: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/10 bg-white/5 accent-pink-500 cursor-pointer"
                />
              </label>
            </div>

            <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
              <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('primary_names')}</span>
              <div className="grid gap-2 md:grid-cols-2">
                <input value={content.coupleNames[0]} onChange={(event) => setContent((current) => ({ ...current, coupleNames: [event.target.value, current.coupleNames[1]] }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
                <input value={content.coupleNames[1]} onChange={(event) => setContent((current) => ({ ...current, coupleNames: [current.coupleNames[0], event.target.value] }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
              </div>
            </label>

            <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
              <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('intro_label')}</span>
              <input value={content.introLabel} onChange={(event) => setContent((current) => ({ ...current, introLabel: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
            </label>

            <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
              <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('subtitle')}</span>
              <input value={content.subtitle} onChange={(event) => setContent((current) => ({ ...current, subtitle: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
            </label>

            <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
              <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('date_time')}</span>
              <input value={content.dateLabel} onChange={(event) => setContent((current) => ({ ...current, dateLabel: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
            </label>

            <label className={`block ${isRtl ? 'text-right' : 'text-left'}`}>
              <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{t('main_desc')}</span>
              <textarea value={content.description} onChange={(event) => setContent((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
            </label>

            <div>
              <p className={`mb-2 text-xs uppercase tracking-[0.3em] text-slate-500 ${isRtl ? 'text-right' : 'text-left'}`}>{t('page_colors')}</p>
              <div className="grid gap-2 md:grid-cols-2">
                <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span className="mb-2 block">{t('bg_page')}</span>
                  <input type="color" value={content.pageBackground} onChange={(event) => updateColor('pageBackground', event.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
                </label>
                <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span className="mb-2 block">{t('env_top')}</span>
                  <input type="color" value={content.envelopeTop} onChange={(event) => updateColor('envelopeTop', event.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
                </label>
                <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span className="mb-2 block">{t('env_mid')}</span>
                  <input type="color" value={content.envelopeMiddle} onChange={(event) => updateColor('envelopeMiddle', event.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
                </label>
                <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span className="mb-2 block">{t('env_bot')}</span>
                  <input type="color" value={content.envelopeBottom} onChange={(event) => updateColor('envelopeBottom', event.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
                </label>
                <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span className="mb-2 block">{t('border')}</span>
                  <input type="color" value={content.envelopeBorder} onChange={(event) => updateColor('envelopeBorder', event.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
                </label>
                <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span className="mb-2 block">{t('accent')}</span>
                  <input type="color" value={content.accentColor} onChange={(event) => updateColor('accentColor', event.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
                </label>
                <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span className="mb-2 block">{t('text_primary')}</span>
                  <input type="color" value={content.envelopeTextPrimary} onChange={(event) => updateColor('envelopeTextPrimary', event.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
                </label>
                <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span className="mb-2 block">{t('text_secondary')}</span>
                  <input type="color" value={content.envelopeTextSecondary} onChange={(event) => updateColor('envelopeTextSecondary', event.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
                </label>
                <label className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs uppercase tracking-[0.3em] text-slate-400 md:col-span-2">
                  <span className="mb-2 block">{t('lbl_text')}</span>
                  <input type="color" value={content.envelopeLabelText} onChange={(event) => updateColor('envelopeLabelText', event.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0" />
                </label>
              </div>
            </div>

            <div>
              <p className={`mb-2 text-xs uppercase tracking-[0.3em] text-slate-500 ${isRtl ? 'text-right' : 'text-left'}`}>{t('story_tl')}</p>
              {content.storyEvents.map((item, index) => (
                <div key={`${item.title}-${index}`} className="mb-3 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <input value={item.year} onChange={(event) => updateStoryItem(index, 'year', event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Year" />
                  <input value={item.title} onChange={(event) => updateStoryItem(index, 'title', event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Title" />
                  <textarea value={item.description} onChange={(event) => updateStoryItem(index, 'description', event.target.value)} rows={2} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Description" />
                </div>
              ))}
            </div>

            <div>
              <div className={`mb-2 flex items-center justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('event_tl')}</p>
                <button type="button" onClick={addEventItem} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">{t('add_event')}</button>
              </div>
              {content.eventCards.map((item, index) => (
                <div key={`${item.title}-${index}`} className="mb-3 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className={`flex items-center justify-between gap-2 border-b border-white/5 pb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{t('event_tl')} {index + 1}</span>
                    <button type="button" onClick={() => removeEventItem(index)} className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] text-slate-200">{t('remove')}</button>
                  </div>
                  <input type="date" value={item.date} onChange={(event) => updateEventItem(index, 'date', event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Date" />
                  <input value={item.title} onChange={(event) => updateEventItem(index, 'title', event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Title" />
                  <input value={item.time} onChange={(event) => updateEventItem(index, 'time', event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Time" />
                  <input value={item.location} onChange={(event) => updateEventItem(index, 'location', event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Location" />
                  <input value={item.address} onChange={(event) => updateEventItem(index, 'address', event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Address" />
                  <input value={item.mapQuery ?? ''} onChange={(event) => updateEventItem(index, 'mapQuery', event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Google Maps place or address" />
                  <textarea value={item.description} onChange={(event) => updateEventItem(index, 'description', event.target.value)} rows={2} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Description" />
                </div>
              ))}
            </div>

            <div>
              <div className={`mb-2 flex items-center justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('wishes')}</p>
                <button type="button" onClick={addWishItem} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">{t('add_wish')}</button>
              </div>
              {content.wishes.map((item, index) => (
                <div key={`${item.name}-${index}`} className="mb-3 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className={`flex items-center justify-between gap-2 border-b border-white/5 pb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{t('wishes')} {index + 1}</span>
                    <button type="button" onClick={() => removeWishItem(index)} className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] text-slate-200">{t('remove')}</button>
                  </div>
                  <input value={item.name} onChange={(event) => updateWishItem(index, 'name', event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Name" />
                  <textarea value={item.message} onChange={(event) => updateWishItem(index, 'message', event.target.value)} rows={2} className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white outline-none" placeholder="Message" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* INVITATION CONTENT - ISOLATED FROM PLATFORM DARK MODE */}
      <main className="invitation-scope">
        {!isOpen ? (
          <section className="relative min-h-[100vh] overflow-hidden" style={{ backgroundColor: content.pageBackground }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,213,208,0.65),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(212,175,55,0.25),_transparent_40%)]" />
            <div className="relative flex min-h-[100vh] items-center justify-center px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
              <motion.div key="envelope" className="relative z-10 flex h-[82vh] min-h-[520px] w-full max-w-[min(92vw,760px)] items-center justify-center sm:h-[82vh] sm:min-h-[620px]" onClick={handleOpen}>
                <motion.div initial={{ opacity: 0, scale: 0.92, rotateX: 24, y: 24, rotateZ: -2 }} animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0, rotateZ: 0 }} transition={{ duration: 1.1, ease: 'easeOut' }} className="relative h-full w-full max-h-[720px] overflow-hidden rounded-[1.9rem] border shadow-[0_30px_75px_rgba(188,93,92,0.18)] sm:rounded-[2.55rem]" style={{ perspective: '1600px', transformStyle: 'preserve-3d', backgroundImage: `linear-gradient(180deg, ${content.envelopeTop} 0%, ${content.envelopeMiddle} 50%, ${content.envelopeBottom} 100%)`, borderColor: content.envelopeBorder }}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.16),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.38),_transparent)]" />
                  <div className="absolute inset-0 opacity-60">
                    <motion.div className="absolute -left-6 top-4 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200/50 to-transparent blur-3xl sm:-left-12 sm:top-6 sm:h-48 sm:w-48" animate={{ y: [0, 16, 0], x: [0, 14, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.div className="absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-gradient-to-tl from-rose-200/45 to-transparent blur-3xl sm:-bottom-16 sm:-right-14 sm:h-56 sm:w-56" animate={{ y: [0, -16, 0], x: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
                  </div>
                  <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.04, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                  </motion.div>
                  <div className="absolute inset-x-0 top-0 h-[46%] rounded-t-[1.9rem] border-b border-amber-200/60 bg-gradient-to-b from-white/90 via-[#fff7ef] to-[#fbe1df]/70 sm:rounded-t-[2.55rem]" />
                  <div className="absolute inset-x-0 top-0 h-[34%] [clip-path:polygon(0_100%,50%_0%,100%_100%)] bg-gradient-to-b from-[#fff8ee] via-[#f9d7cf] to-[#ecb29c]/80" />
                  <motion.div className="absolute left-0 top-0 z-20 h-full w-[50.5%] origin-left rounded-l-[1.9rem] bg-gradient-to-r from-[#f7d5d7]/80 via-[#f6e6df]/70 to-transparent px-3 pb-8 pt-10 shadow-[14px_0_30px_rgba(191,135,118,0.12)] sm:rounded-l-[2.55rem] sm:px-6 sm:pb-14 sm:pt-16" initial={{ rotateY: 0 }} animate={{ rotateY: isOpen ? -120 : 0, x: isOpen ? -18 : 0 }} transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1] }} />
                  <motion.div className="absolute right-0 top-0 z-20 h-full w-[50.5%] origin-right rounded-r-[1.9rem] bg-gradient-to-l from-[#f7e7c4]/75 via-[#f7e9dc]/70 to-transparent px-3 pb-8 pt-10 shadow-[-14px_0_30px_rgba(191,135,118,0.12)] sm:rounded-r-[2.55rem] sm:px-6 sm:pb-14 sm:pt-16" initial={{ rotateY: 0 }} animate={{ rotateY: isOpen ? 120 : 0, x: isOpen ? 18 : 0 }} transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1] }} />
                  <motion.div className="pointer-events-none absolute inset-x-0 top-[34%] z-30 flex items-center justify-center px-3 sm:top-[38%]" initial={{ opacity: 1 }} animate={{ opacity: isOpen ? 0 : 1 }} transition={{ duration: 0.4, ease: 'easeIn' }}>
                    <div className="flex max-w-[88%] flex-col items-center justify-center text-center">
                      <motion.p className="font-playfair text-[clamp(1.3rem,3.8vw,2.1rem)] font-semibold uppercase leading-[0.95] tracking-[0.16em] sm:text-[clamp(2rem,4.8vw,3.2rem)]" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} style={{ color: content.envelopeTextPrimary }}>{content.coupleNames[0]}</motion.p>
                      <motion.span className="mt-1 font-playfair text-[clamp(1.5rem,3.7vw,2.4rem)] font-light leading-none sm:mt-2" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.25 }} style={{ color: content.accentColor }}>&</motion.span>
                      <motion.p className="mt-1 font-playfair text-[clamp(1.3rem,3.8vw,2.1rem)] font-semibold uppercase leading-[0.95] tracking-[0.16em] sm:mt-2 sm:text-[clamp(2rem,4.8vw,3.2rem)]" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.35 }} style={{ color: content.envelopeTextSecondary }}>{content.coupleNames[1]}</motion.p>
                    </div>
                  </motion.div>
                  <motion.div className="pointer-events-none absolute left-0 right-0 top-6 z-20 text-center sm:top-8" initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: 'easeIn' }}>
                    <p className="font-inter text-[0.62rem] font-semibold uppercase tracking-[0.35em] drop-shadow-sm sm:text-sm" style={{ color: content.envelopeLabelText }}>{content.introLabel}</p>
                  </motion.div>
                  <motion.div className="pointer-events-none absolute bottom-6 left-0 right-0 z-20 text-center sm:bottom-8" initial={{ opacity: 1 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1 }}>
                    <motion.p className="font-inter text-[0.62rem] font-medium uppercase tracking-[0.3em] sm:text-sm" animate={{ y: [0, 4, 0] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ color: content.envelopeLabelText }}>{t('tap_to_open')}</motion.p>
                  </motion.div>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <motion.div key={`spark-${index}`} className="pointer-events-none absolute h-1 w-1 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.7)]" style={{ left: `${18 + (index % 3) * 24}%`, top: `${16 + Math.floor(index / 3) * 24}%` }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1, 0.7], y: [0, -6, 0] }} transition={{ duration: 2.8 + index * 0.12, delay: index * 0.06, repeat: Infinity, ease: 'easeInOut' }} />
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>
        ) : (
          <>
            <section id="story" className="relative w-full bg-gradient-to-b from-[#fffaf7] via-[#fffaf7] to-[#f4b6a8]/10 px-4 py-20">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="font-playfair text-3xl sm:text-4xl text-[#3d3933] md:text-5xl">{t('our_wedding_day')}</h2>
                <p className="mt-3 font-inter text-base sm:text-xl text-[#7a8b7b]">{content.dateLabel}</p>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                  {['days', 'hours', 'minutes', 'seconds'].map((label, index) => (
                    <motion.div key={label} className="rounded-xl border border-[#f4b6a8]/20 bg-white p-3.5 sm:p-6 text-center shadow-md" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1, duration: 0.5 }} viewport={{ once: true }}>
                      <div className="font-playfair text-2xl sm:text-4xl text-[#d4af37]">00</div>
                      <div className="mt-1.5 font-inter text-xs sm:text-sm uppercase tracking-wider text-[#7a8b7b]">{t(label)}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-12 grid gap-4 text-left md:grid-cols-2">
                  {content.storyEvents.map((item, index) => (
                    <div key={`${item.year}-${index}`} className="rounded-2xl border border-[#f4b6a8]/20 bg-white/80 p-6 shadow-md">
                      <p className="font-playfair text-xl text-[#3d3933]">{item.year}</p>
                      <h3 className="mt-2 font-inter text-lg font-semibold text-[#3d3933]">{item.title}</h3>
                      <p className="mt-2 font-inter text-sm leading-6 text-[#7a8b7b]">{item.description}</p>
                    </div>
                  ))}
                </div>
                <p className="mx-auto mt-8 max-w-2xl font-inter text-lg leading-relaxed text-[#3d3933]/70">{content.description}</p>
              </div>
            </section>

            <section id="details" className="relative w-full bg-white px-3 sm:px-4 py-16 sm:py-20">
              <div className="mx-auto max-w-6xl">
                <div className="text-center">
                  <p className="font-inter text-xs font-semibold uppercase tracking-[0.35em] text-[#7a8b7b]">{t('schedule') || 'PROGRAMME'}</p>
                  <h2 className="mt-2 font-playfair text-3xl sm:text-4xl text-[#3d3933] md:text-5xl">{t('event_details')}</h2>
                </div>

                {/* ─── MOBILE LUXURY AUTO-PLAYING TIMELINE (NO SCROLLBAR, 7S AUTO-ADVANCE) ─── */}
                <div className={`mt-6 ${preview ? 'block' : 'block lg:hidden'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                  {/* Segmented Story Progress Tabs Container */}
                  <div className="rounded-3xl bg-gradient-to-br from-[#fffdfa] via-[#fcf6f0] to-[#f9ede3]/80 p-3 sm:p-4 border border-[#e8d5c8] shadow-[0_4px_20px_rgba(180,130,100,0.08)]">
                    {/* Top Status Row: Auto-play indicator + Lock/Resume button */}
                    <div className="flex items-center justify-between pb-2.5 text-[11px] font-semibold text-[#8d6c52]">
                      <div className="flex items-center gap-1.5">
                        <span className="uppercase tracking-[0.2em]">{t('schedule') || 'PROGRAMME'}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-amber-800 font-bold">
                          0{selectedMapIndex + 1} / 0{sortedEventCards.length}
                        </span>
                      </div>

                      {/* Auto-Play status & Lock toggle */}
                      {isMobileLocked ? (
                        <button
                          type="button"
                          onClick={handleResumeAutoPlay}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 border border-amber-300/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 shadow-xs active:scale-95 transition cursor-pointer"
                        >
                          <Play className="h-2.5 w-2.5 fill-amber-700 text-amber-700" />
                          <span>{isRtl ? 'تشغيل تلقائي (7 ثوانٍ)' : 'Reprendre le défilement (7s)'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectEvent(selectedMapIndex, true)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-amber-200/80 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900 shadow-xs cursor-pointer hover:bg-white active:scale-95 transition"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>{isRtl ? 'تغيير تلقائي (7 ثوانٍ)' : 'Auto (7s)'}</span>
                          <Pause className="h-2.5 w-2.5 text-amber-700" />
                        </button>
                      )}
                    </div>

                    {/* Clean Segmented Progress Bars (NO HORIZONTAL SCROLLBAR!) */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {sortedEventCards.map((event, idx) => {
                        const isSelected = selectedMapIndex === idx;
                        const isPast = idx < selectedMapIndex;

                        return (
                          <button
                            key={`${event.title}-${idx}`}
                            type="button"
                            onClick={() => handleSelectEvent(idx, true)}
                            className="group flex flex-col text-left cursor-pointer p-1 rounded-xl transition hover:bg-white/50"
                          >
                            {/* Segment Progress Bar */}
                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#ebdcd0]">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isPast
                                    ? 'w-full bg-amber-500'
                                    : isSelected
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
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
                            <div className="mt-1.5 flex items-center justify-between">
                              <span
                                className={`text-[10px] font-bold ${
                                  isSelected ? 'text-amber-900' : 'text-[#a88a72]'
                                }`}
                              >
                                0{idx + 1}
                              </span>
                              <span
                                className={`text-[10px] font-medium truncate max-w-[85px] ${
                                  isSelected ? 'text-amber-950 font-bold' : 'text-slate-500'
                                }`}
                              >
                                {event.title}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Selected Event Card on Mobile */}
                  {selectedMapEvent && (
                    <div className="mt-3 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-[#fffdfa] to-[#fef7ee] p-4 shadow-md">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/50 pb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold shadow-xs">
                            {selectedMapIndex + 1}
                          </span>
                          <h4 className="font-playfair font-bold text-base text-[#3d3933] break-words">{selectedMapEvent.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedMapEvent.time && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-amber-200/60 px-2.5 py-0.5 text-xs font-semibold text-amber-900 shadow-2xs">
                              <Clock className="h-3 w-3 text-amber-600" />
                              {selectedMapEvent.time}
                            </span>
                          )}
                          {selectedMapEvent.date && (
                            <span className="inline-flex items-center gap-1 font-inter text-[11px] font-semibold text-[#7a8b7b]">
                              <Calendar className="h-3 w-3" />
                              {selectedMapEvent.date}
                            </span>
                          )}
                        </div>
                      </div>

                      {selectedMapEvent.location && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-amber-900">
                          <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>{selectedMapEvent.location}</span>
                        </div>
                      )}

                      {selectedMapEvent.description && (
                        <p className="mt-2 font-inter text-xs leading-relaxed text-[#3d3933]/70">
                          {selectedMapEvent.description}
                        </p>
                      )}

                      {/* Navigation Prev / Next Quick Buttons */}
                      <div className="mt-3.5 flex items-center justify-between border-t border-amber-200/40 pt-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const prevIdx = (selectedMapIndex - 1 + sortedEventCards.length) % sortedEventCards.length;
                            handleSelectEvent(prevIdx, true);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 transition cursor-pointer"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          <span>{isRtl ? 'السابق' : 'Précédent'}</span>
                        </button>

                        {isMobileLocked && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                            <Lock className="h-2.5 w-2.5" />
                            <span>{isRtl ? 'مثبّت' : 'Fixé'}</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const nextIdx = (selectedMapIndex + 1) % sortedEventCards.length;
                            handleSelectEvent(nextIdx, true);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 transition cursor-pointer"
                        >
                          <span>{isRtl ? 'التالي' : 'Suivant'}</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* GTA V Interactive Map on Mobile */}
                  <div className="mt-4">
                    <GtaMapViewer
                      locationQuery={selectedMapEvent?.mapQuery || selectedMapEvent?.address || selectedMapEvent?.location || ''}
                      title={selectedMapEvent?.title ?? 'Event'}
                      locationName={selectedMapEvent?.location}
                      address={selectedMapEvent?.address}
                      theme="amber"
                      isRtl={isRtl}
                      heightClass="h-[250px] sm:h-[300px]"
                    />
                  </div>

                  {/* Optional Full Event List Toggle Button for Mobile */}
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllEventsMobile((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:underline"
                    >
                      {showAllEventsMobile
                        ? isRtl
                          ? '▲ إخفاء القائمة المفصلة'
                          : '▲ Masquer la liste complète'
                        : isRtl
                        ? '▼ عرض تفاصيل جميع الفعاليات'
                        : '▼ Afficher tous les événements en détail'}
                    </button>
                  </div>

                  {/* Collapsible Full Events List on Mobile */}
                  <AnimatePresence>
                    {showAllEventsMobile && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2.5 overflow-hidden"
                      >
                        {sortedEventCards.map((event, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              handleSelectEvent(index, true);
                              setShowAllEventsMobile(false);
                            }}
                            className="rounded-xl border border-[#f4b6a8]/25 bg-white p-3.5 shadow-sm cursor-pointer hover:border-amber-400"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-playfair font-bold text-sm text-[#3d3933]">
                                {index + 1}. {event.title}
                              </span>
                              <span className="text-xs text-amber-700 font-semibold">{event.time}</span>
                            </div>
                            {event.location && <p className="mt-1 text-xs text-slate-500">{event.location}</p>}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ─── DESKTOP 2-COLUMN SIDE-BY-SIDE LAYOUT (hidden on mobile and preview, visible on lg) ─── */}
                <div dir="ltr" className={`mt-12 ${preview ? 'hidden' : 'hidden lg:grid'} grid-cols-12 gap-8 items-start min-w-0`}>
                  {/* Left Column: Events List */}
                  <div className="col-span-7 space-y-4 min-w-0" dir={isRtl ? 'rtl' : 'ltr'}>
                    {sortedEventCards.map((event, index) => {
                      const isSelected = selectedMapIndex === index;
                      return (
                        <motion.div
                          key={`${event.title}-${index}`}
                          initial={{ opacity: 0, y: 18 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.08 }}
                          onClick={() => handleSelectEvent(index, true)}
                          className={`group cursor-pointer rounded-3xl border p-6 transition-all duration-300 ${
                            isSelected
                              ? 'border-amber-400 bg-gradient-to-br from-[#fffdfa] to-[#fef7ee] shadow-xl ring-2 ring-amber-400/40'
                              : 'border-[#f4b6a8]/25 bg-white/85 hover:border-amber-300 hover:bg-white shadow-sm'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex-1">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                                <Clock className="h-3 w-3 text-amber-600" />
                                {event.time}
                              </span>
                              <h3 className="mt-3 font-playfair text-2xl font-bold text-[#3d3933] group-hover:text-amber-900 transition-colors">
                                {event.title}
                              </h3>
                            </div>
                            <span className="inline-flex items-center gap-1 font-inter text-xs font-semibold uppercase tracking-widest text-[#7a8b7b] bg-slate-50 rounded-full px-3 py-1">
                              <Calendar className="h-3 w-3 text-[#7a8b7b]" />
                              {event.date}
                            </span>
                          </div>

                          <div className="mt-3 flex items-start gap-2 text-sm text-amber-800 font-medium">
                            <MapPin className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                            <span>{event.location}</span>
                          </div>

                          {event.address && (
                            <p className="mt-1 pl-6 font-inter text-xs text-[#7a8b7b] leading-relaxed">
                              {event.address}
                            </p>
                          )}

                          {event.description && (
                            <p className="mt-3 border-t border-[#f4b6a8]/15 pt-3 font-inter text-sm leading-relaxed text-[#3d3933]/70">
                              {event.description}
                            </p>
                          )}

                          <div className="mt-4 flex items-center justify-between border-t border-[#f4b6a8]/15 pt-3 text-xs">
                            <span className={`font-semibold flex items-center gap-1.5 ${isSelected ? 'text-amber-800 font-bold' : 'text-slate-400 group-hover:text-amber-600'}`}>
                              <MapPin className="h-3.5 w-3.5 text-amber-600" />
                              {isSelected ? (isRtl ? 'الموقع محدد على الخريطة' : 'Lieu sélectionné sur la carte') : (isRtl ? 'عرض على الخريطة' : 'Afficher sur la carte')}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Right Column: Sticky GTA V Interactive Map */}
                  <div className="col-span-5 sticky top-24 min-w-0" dir={isRtl ? 'rtl' : 'ltr'}>
                    <GtaMapViewer
                      locationQuery={selectedMapEvent?.mapQuery || selectedMapEvent?.address || selectedMapEvent?.location || ''}
                      title={selectedMapEvent?.title ?? 'Event'}
                      locationName={selectedMapEvent?.location}
                      address={selectedMapEvent?.address}
                      theme="amber"
                      isRtl={isRtl}
                      heightClass="h-[300px]"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section id="wishes" className="relative w-full bg-gradient-to-b from-[#fffaf7] via-[#f4b6a8]/10 to-[#fffaf7] px-4 py-20">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-center font-playfair text-4xl text-[#3d3933] md:text-5xl">{t('wishes')}</h2>
                <p className="mx-auto mt-4 max-w-2xl text-center font-inter text-lg text-[#7a8b7b]">{t('wishes_desc')}</p>
                <div className="mt-12 grid gap-4 md:grid-cols-2">
                  {content.wishes.map((wish, index) => (
                    <div key={`${wish.name}-${index}`} className="rounded-2xl border border-[#f4b6a8]/20 bg-white/80 p-5 shadow-sm">
                      <p className="font-playfair text-lg text-[#3d3933]">{wish.name}</p>
                      <p className="mt-2 font-inter text-sm text-[#7a8b7b]">{wish.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`${content.coupleNames[0]} & ${content.coupleNames[1]} Wedding Invitation`}
        subtitle={`${content.subtitle} · ${content.dateLabel}`}
        coverImage="/templates/twain-love.png"
        invitationUrl={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}${window.location.search}` : undefined}
      />
    </div>
  );
}

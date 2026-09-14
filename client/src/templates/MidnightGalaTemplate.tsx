import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { Header } from '../components/Header';
import { ShareModal } from '../components/ShareModal';
import { loadTemplateState, saveTemplateState } from '../lib/templateShareState';
import { Moon, Calendar, MapPin, Sparkles } from 'lucide-react';

interface TemplateProps {
  preview?: boolean;
  invitationData?: Record<string, unknown>;
}

export default function MidnightGalaTemplate({ preview = false, invitationData }: TemplateProps) {
  const { isRtl } = useLanguageTheme();
  const getText = (key: string, fallback: string) => typeof invitationData?.[key] === 'string' ? invitationData[key] as string : fallback;
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [data, setData] = useState(() => loadTemplateState('midnight-gala', {
    title: getText('title', 'The Annual Midnight Gala'),
    subtitle: getText('subtitle', 'Black-Tie Charity Ball & Concert'),
    date: getText('date', 'New Year\'s Eve, 31 December 2025'),
    time: getText('time', '8:30 PM till Midnight'),
    venue: getText('venue', 'Starlight Crystal Hall'),
    address: getText('address', '99 Starlight Drive, Cosmopolis'),
    description: getText('description', 'An enchanting evening of champagne toasts, live symphony orchestra, fine dining, and midnight fireworks.'),
    showStoryTimeline: true,
  }));

  useEffect(() => {
    if (!invitationData) saveTemplateState('midnight-gala', data);
  }, [data, invitationData]);

  const canEditTemplate = false;

  return (
    <div className={`min-h-screen bg-[#070913] text-indigo-100 ${isRtl ? 'rtl' : 'ltr'}`}>
      {!preview && (
        <Header
        />
      )}

      {canEditTemplate && !preview && (
        <div className="sticky top-4 z-30 flex justify-end gap-2 px-4 pt-4">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="rounded-full border border-indigo-400/30 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-4 py-2 text-sm font-semibold text-indigo-200 shadow-lg backdrop-blur transition hover:from-indigo-500/30 hover:to-purple-500/30 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" /> Generate Link
          </button>
          <button
            type="button"
            onClick={() => setIsEditorOpen((prev) => !prev)}
            className="rounded-full border border-indigo-400/30 bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-200 shadow-lg backdrop-blur transition hover:bg-indigo-500/25"
          >
            {isEditorOpen ? 'Hide Editor' : 'Edit Content'}
          </button>
        </div>
      )}

      {/* Editor Drawer */}
      {canEditTemplate && isEditorOpen && (
        <div className={`${preview ? 'absolute' : 'fixed'} top-16 z-40 max-h-[calc(100vh-5rem)] w-[min(92vw,420px)] overflow-auto rounded-3xl border border-indigo-500/30 bg-slate-950/95 p-4 shadow-2xl backdrop-blur ${isRtl ? 'left-4 text-right' : 'right-4 text-left'}`}>
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-indigo-400">Midnight Gala Editor</p>
              <h3 className="text-lg font-semibold text-white">Event Options</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/20"
            >
              Close
            </button>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {/* Generate Shareable URL Button */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 px-4 text-xs font-bold text-white shadow-lg transition hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Shareable URL</span>
            </button>

            {/* Story Timeline Toggle */}
            <div className="rounded-2xl border border-indigo-500/20 bg-white/5 p-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                  Show Story Timeline
                </span>
                <input
                  type="checkbox"
                  checked={data.showStoryTimeline !== false}
                  onChange={(e) => setData({ ...data, showStoryTimeline: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-white/5 accent-indigo-500 cursor-pointer"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-indigo-400">Gala Title</span>
              <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-indigo-400">Subtitle</span>
              <input value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-indigo-400">Date</span>
              <input value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-indigo-400">Venue</span>
              <input value={data.venue} onChange={(e) => setData({ ...data, venue: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-indigo-400">Description</span>
              <textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
            </label>
          </div>
        </div>
      )}

      <main className="invitation-scope relative flex min-h-[90vh] flex-col items-center justify-center px-4 py-20 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.2),_transparent_60%)]" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
            <Moon className="h-4 w-4" /> {data.subtitle}
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white break-words">
            {data.title}
          </h1>

          <p className="text-lg text-indigo-200/80 max-w-xl mx-auto leading-relaxed">{data.description}</p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/40 p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="text-xs uppercase text-indigo-400">Date & Time</p>
                  <p className="font-semibold text-white">{data.date}</p>
                  <p className="text-xs text-indigo-200">{data.time}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/40 p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="text-xs uppercase text-indigo-400">Location</p>
                  <p className="font-semibold text-white">{data.venue}</p>
                  <p className="text-xs text-indigo-200">{data.address}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={data.title}
        subtitle={`${data.subtitle} · ${data.date}`}
        coverImage="/templates/midnight-gala.png"
        invitationUrl={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : undefined}
      />
    </div>
  );
}

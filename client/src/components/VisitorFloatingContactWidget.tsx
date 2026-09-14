import React, { useState } from 'react';
import { MessageCircle, ChevronRight, Sparkles, Send } from 'lucide-react';

interface VisitorFloatingContactWidgetProps {
  templateTitle?: string;
}

export const VisitorFloatingContactWidget: React.FC<VisitorFloatingContactWidgetProps> = ({
  templateTitle = 'Royal Invitation',
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const encodedMsg = encodeURIComponent(
    `Hello! I want to order the custom "${templateTitle}" invitation design. Please send me details and pricing!`
  );

  return (
    <>
      {/* ─── DESKTOP RIGHT FLOATING ROYAL PANEL ───────────────────────────── */}
      <aside
        aria-label="Order & Contact Assistant"
        className="hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 z-50 flex-col items-end pointer-events-auto transition-all duration-500 ease-out"
      >
        {isMinimized ? (
          /* Minimized Golden Badge */
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="group flex items-center gap-2.5 rounded-full border border-amber-400/50 bg-slate-950/90 p-3 text-amber-300 shadow-[0_8px_30px_rgba(217,119,6,0.3)] backdrop-blur-2xl transition-all duration-300 hover:scale-110 hover:border-amber-300 hover:shadow-[0_12px_40px_rgba(217,119,6,0.5)]"
            title="Open Order & Contact Panel"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-amber-400 animate-spin-slow" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <span className="pr-1 text-xs font-serif font-bold tracking-wide text-amber-200">Order Design</span>
          </button>
        ) : (
          /* Expanded Royal Floating Card */
          <div className="relative w-64 rounded-3xl border border-amber-500/30 bg-slate-950/88 p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-300 hover:border-amber-400/60">
            {/* Minimalist Minimize Button */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="Minimize panel"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Header Title */}
            <div className="flex items-center gap-2 pr-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/10 text-amber-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Custom Order</p>
                <h4 className="text-xs font-serif font-bold text-slate-100">Order This Invitation</h4>
              </div>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
              Get your personalized design customized with your names &amp; event details!
            </p>

            {/* Social Buttons Stack */}
            <div className="mt-3.5 space-y-2">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/?text=${encodedMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:from-emerald-500 hover:to-teal-500 hover:scale-[1.02] hover:shadow-emerald-500/25"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>WhatsApp Chat</span>
                </div>
                <Send className="h-3.5 w-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Instagram Button */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-pink-500/30 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-pink-500/25"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram Direct</span>
                </div>
                <Send className="h-3.5 w-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Facebook Button */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:bg-blue-500 hover:scale-[1.02] hover:shadow-blue-500/25"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
                  </svg>
                  <span>Facebook Messenger</span>
                </div>
                <Send className="h-3.5 w-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2.5">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Fast Response
              </span>
              <span>Available 24/7</span>
            </div>
          </div>
        )}
      </aside>

      {/* ─── MOBILE BOTTOM FLOATING QUICK CONTACT DOCK ───────────────────────── */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-50 flex items-center justify-between gap-2 rounded-2xl border border-amber-500/40 bg-slate-950/90 px-4 py-3 shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Order Design</span>
          <span className="text-xs font-semibold text-white">Contact Creator</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/?text=${encodedMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
            title="Instagram"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
      </div>
    </>
  );
};

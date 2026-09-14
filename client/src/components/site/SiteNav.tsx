import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLanguageTheme } from '../../context/LanguageThemeContext';
import { LanguageThemeControls } from '../LanguageThemeControls';
import { buildWhatsAppUrl, orderWhatsAppMessage } from '../../lib/contact';

export function SiteNav() {
  const { t, isRtl } = useLanguageTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const hideOnPreview = location.pathname.startsWith('/invitation/');

  const links = [
    { to: '/', label: t('nav_home') },
    { to: '/#invitations', label: t('nav_invitations') },
    { to: '/a-propos', label: t('nav_about') },
    { to: '/contact', label: t('nav_contact') },
  ];

  const whatsappHref = buildWhatsAppUrl(orderWhatsAppMessage('Invly'));

  if (hideOnPreview) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8dfd2]/80 bg-[#faf8f5]/90 text-charcoal backdrop-blur-md">
      <div className={`mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <Link to="/" className="font-cormorant text-2xl font-semibold tracking-[0.28em] text-charcoal">
          INVLY
        </Link>

        <nav className={`hidden items-center gap-8 text-sm font-medium tracking-wide text-warmbrown md:flex ${isRtl ? 'flex-row-reverse' : ''}`}>
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="transition hover:text-champagne">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <LanguageThemeControls />
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-charcoal px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ivory transition hover:bg-warmbrown sm:inline-flex"
          >
            WhatsApp
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e8dfd2] md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[#e8dfd2] bg-ivory px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4 text-sm font-medium text-warmbrown">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-champagne">
              WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

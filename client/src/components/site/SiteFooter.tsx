import { Link } from 'react-router-dom';
import { useLanguageTheme } from '../../context/LanguageThemeContext';
import { buildWhatsAppUrl, orderWhatsAppMessage } from '../../lib/contact';

export function SiteFooter() {
  const { t } = useLanguageTheme();
  const whatsappHref = buildWhatsAppUrl(orderWhatsAppMessage('Invly'));

  return (
    <footer className="border-t border-[#e8dfd2] bg-[#f5f0e8] px-5 py-12 text-sm text-warmbrown">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-cormorant text-3xl tracking-[0.28em] text-charcoal">INVLY</p>
          <p className="mt-3 max-w-sm leading-relaxed">{t('footer_studio')}</p>
        </div>
        <div className="flex flex-wrap gap-6">
          <Link to="/" className="hover:text-charcoal">{t('nav_home')}</Link>
          <Link to="/#invitations" className="hover:text-charcoal">{t('nav_invitations')}</Link>
          <Link to="/a-propos" className="hover:text-charcoal">{t('nav_about')}</Link>
          <Link to="/contact" className="hover:text-charcoal">{t('nav_contact')}</Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-charcoal">
            WhatsApp
          </a>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs tracking-wide text-warmbrown/70">{t('footer_text')}</p>
    </footer>
  );
}

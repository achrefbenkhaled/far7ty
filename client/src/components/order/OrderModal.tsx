import { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguageTheme } from '../../context/LanguageThemeContext';
import { FACEBOOK_URL, INSTAGRAM_URL, buildWhatsAppUrl, orderWhatsAppMessage } from '../../lib/contact';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
}

export function OrderModal({ isOpen, onClose, templateName }: OrderModalProps) {
  const { t, isRtl } = useLanguageTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const details = { name, phone, date, message };
  const whatsappHref = buildWhatsAppUrl(orderWhatsAppMessage(templateName, details));

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-charcoal/50 p-4 backdrop-blur-sm sm:items-center">
      <div className={`w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-[#e8dfd2] bg-ivory shadow-2xl ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="h-1.5 bg-gradient-to-r from-[#e8dfd2] via-champagne to-[#e8dfd2]" />
        <div className="relative p-6 sm:p-8">
          <button type="button" onClick={onClose} className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} rounded-full p-2 text-warmbrown hover:bg-[#f5f0e8]`}>
            <X className="h-4 w-4" />
          </button>
          <p className="font-cormorant text-3xl text-charcoal">{t('order_title')}</p>
          <p className="mt-2 text-sm text-warmbrown">{t('order_desc')} — {templateName}</p>

          <form className="mt-6 space-y-3" onSubmit={(e) => e.preventDefault()}>
            <label className="block text-xs uppercase tracking-[0.2em] text-warmbrown">
              {t('order_name')}
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e8dfd2] bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-champagne" />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-warmbrown">
              {t('order_phone')}
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e8dfd2] bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-champagne" />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-warmbrown">
              {t('order_date')}
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e8dfd2] bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-champagne" />
            </label>
            <label className="block text-xs uppercase tracking-[0.2em] text-warmbrown">
              {t('order_message')}
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-[#e8dfd2] bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-champagne" />
            </label>
          </form>

          <div className="mt-6 space-y-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-full bg-charcoal py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ivory transition hover:bg-warmbrown"
            >
              {t('order_whatsapp')}
            </a>
            <div className="grid grid-cols-2 gap-2">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#e8dfd2] py-2.5 text-center text-xs uppercase tracking-[0.16em] text-warmbrown hover:border-champagne">
                Instagram
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#e8dfd2] py-2.5 text-center text-xs uppercase tracking-[0.16em] text-warmbrown hover:border-champagne">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

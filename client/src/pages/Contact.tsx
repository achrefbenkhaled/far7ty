import { useState } from 'react';
import { CheckCircle2, Mail, MessageCircle, Send } from 'lucide-react';
import { buildWhatsAppUrl, orderWhatsAppMessage } from '../lib/contact';

const faqs = [
  {
    question: 'Combien coûte une invitation ?',
    answer: 'Nos formules commencent à 29 DT pour Classique, 49 DT pour Modern et 99 DT pour une création Personnalisée.',
  },
  {
    question: 'Combien de temps faut-il pour recevoir mon invitation ?',
    answer: 'Une formule prête à partager est préparée rapidement. Pour une création personnalisée, le délai dépend des détails et des contenus à intégrer.',
  },
  {
    question: 'Puis-je modifier les informations de mon événement ?',
    answer: 'Oui. Envoyez-nous vos noms, date, lieu, couleurs et texte, et nous adaptons l’invitation à votre événement.',
  },
  {
    question: 'Comment puis-je partager mon invitation ?',
    answer: 'Vous recevez un lien facile à partager par WhatsApp, Instagram, email ou tout autre canal.',
  },
];

export function ContactPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const whatsappUrl = buildWhatsAppUrl(orderWhatsAppMessage('une invitation personnalisée', { name, phone: contact, message }));
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,171,106,0.18),transparent_32%),linear-gradient(180deg,_#faf5ef_0%,_#f4eee8_100%)] px-4 py-10 text-[#2d241e] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">Contact</p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] text-[#221b18] sm:text-7xl">Parlons de votre invitation.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5c4a3d]">
              Dites-nous ce que vous préparez. Nous vous aiderons à choisir le bon modèle et la formule adaptée à votre événement.
            </p>
            <a
              href={buildWhatsAppUrl('Bonjour Invly, je souhaite créer une invitation.')}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1f8f5f] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(31,143,95,0.2)] transition hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4" />
              Écrire sur WhatsApp
            </a>
          </div>

          <div className="rounded-[2rem] border border-[#eadfce] bg-[#fffdfb] p-6 shadow-[0_20px_60px_rgba(92,74,61,0.06)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f1ea] text-[#8a6a4a]"><Mail className="h-5 w-5" /></div>
              <div>
                <h2 className="font-serif text-2xl">Votre projet</h2>
                <p className="text-sm text-[#5c4a3d]">Réponse rapide par WhatsApp</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-[#5c4a3d]">
                Votre nom
                <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#eadfce] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#8a6a4a]" />
              </label>
              <label className="block text-sm font-semibold text-[#5c4a3d]">
                WhatsApp ou email
                <input required value={contact} onChange={(event) => setContact(event.target.value)} className="mt-2 w-full rounded-xl border border-[#eadfce] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#8a6a4a]" />
              </label>
              <label className="block text-sm font-semibold text-[#5c4a3d]">
                Parlez-nous de votre événement
                <textarea required rows={4} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-2 w-full resize-none rounded-xl border border-[#eadfce] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#8a6a4a]" />
              </label>
              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2d241e] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#453a33]">
                <Send className="h-4 w-4" />
                Envoyer ma demande
              </button>
              {sent && <p className="flex items-center gap-2 text-sm font-semibold text-[#1f8f5f]"><CheckCircle2 className="h-4 w-4" /> Votre demande est prête à être envoyée.</p>}
            </form>
          </div>
        </section>

        <section className="mt-20 border-t border-[#eadfce] pt-12" aria-labelledby="faq-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">Questions fréquentes</p>
            <h2 id="faq-heading" className="mt-3 font-serif text-4xl text-[#221b18] sm:text-5xl">Tout ce qu’il faut savoir.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-[1.5rem] border border-[#eadfce] bg-[#fffdfb] p-6">
                <h3 className="font-serif text-2xl text-[#2d241e]">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5c4a3d]">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

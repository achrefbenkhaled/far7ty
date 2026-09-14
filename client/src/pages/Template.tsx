import { useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, MessageCircle, Sparkles } from 'lucide-react';
import { templates } from '../data/templates';
import { getTemplateComponent } from '../templates';
import { ShareModal } from '../components/ShareModal';
import { PhoneFrame } from '../components/showcase/PhoneFrame';

export function TemplatesPage() {
  const templateGroups = [
    { key: 'wedding', title: 'Invitations de mariage', description: 'Des créations élégantes pour célébrer votre grand jour.', templates: templates.filter((template) => template.category === 'Wedding') },
    { key: 'birthday', title: 'Invitations d’anniversaire', description: 'Des modèles joyeux et personnalisables pour votre anniversaire.', templates: templates.filter((template) => template.category === 'Birthday') },
    { key: 'other', title: 'Autres événements', description: 'Des invitations adaptées à vos événements professionnels et festifs.', templates: templates.filter((template) => !['Wedding', 'Birthday'].includes(template.category)) },
  ].filter((group) => group.templates.length > 0);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mb-12 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">Nos invitations</p>
        <h1 className="mt-4 font-serif text-4xl leading-none text-[#2d241e] sm:text-5xl lg:text-6xl">
          Découvrez des créations pensées pour célébrer votre histoire.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#5c4a3d]">
          Chaque modèle est conçu pour offrir une expérience élégante, intime et mémorable, dès le premier regard.
        </p>
      </div>

      <nav aria-label="Catégories d’invitations" className="mb-14 flex flex-wrap gap-3 border-y border-[#eadfce] py-4">
        {templateGroups.map((group) => (
          <a
            key={group.key}
            href={`#${group.key}-templates`}
            className="inline-flex items-center rounded-full border border-[#d8c4a8] bg-white px-5 py-2.5 text-sm font-semibold text-[#2d241e] transition hover:border-[#8a6a4a] hover:bg-[#f8f1ea]"
          >
            {group.key === 'wedding' ? 'Mariage' : group.key === 'birthday' ? 'Anniversaire' : 'Autres événements'}
          </a>
        ))}
      </nav>

      <div className="space-y-20">
        {templateGroups.map((group) => (
          <section key={group.key} id={`${group.key}-templates`} aria-labelledby={`${group.key}-templates-heading`}>
            <div className="mb-8 border-b border-[#eadfce] pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">{group.key === 'wedding' ? 'Mariage' : group.key === 'birthday' ? 'Anniversaire' : 'Événements'}</p>
              <h2 id={`${group.key}-templates-heading`} className="mt-3 font-serif text-4xl text-[#2d241e] sm:text-5xl">{group.title}</h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-[#5c4a3d]">{group.description}</p>
            </div>

            <div className="space-y-14">
              {group.templates.map((template, index) => {
          const TemplateComponent = getTemplateComponent(template.id);
          const reversed = index % 2 === 1;

          return (
            <motion.section
              key={template.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="rounded-[2rem] border border-[#eee2d8] bg-[#fffdfb] p-4 shadow-[0_25px_80px_rgba(101,76,58,0.06)] sm:p-6 lg:p-8"
            >
              <div className={`grid items-center gap-8 lg:grid-cols-2 ${reversed ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                <div className="space-y-5">
                  <div className="inline-flex rounded-full border border-[#eadfce] bg-[#f8f1ea] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a6a4a]">
                    {template.category}
                  </div>
                  <div>
                    <h2 className="font-serif text-3xl text-[#2d241e] sm:text-4xl">{template.title}</h2>
                    <p className="mt-3 max-w-lg text-base leading-7 text-[#5c4a3d]">{template.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/preview/${template.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[#2d241e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#453a33]"
                    >
                      Voir l&apos;invitation
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/pricing/${template.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#d8c4a8] bg-[#f7efe7] px-5 py-3 text-sm font-semibold text-[#2d241e] transition hover:border-[#c9a96e]"
                    >
                      Choisir ce modèle
                    </Link>
                  </div>

                  <ul className="space-y-2 text-sm text-[#5c4a3d]">
                    {['Scroll intérieur', 'Hero & récit', 'Lieu & RSVP', 'Contact direct WhatsApp'].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f2e7d6] text-[#715c49]">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-center">
                  <PhoneFrame className="w-full max-w-[360px]" preview>
                    <div className="origin-top bg-[#fffaf5]">
                      <TemplateComponent preview />
                    </div>
                  </PhoneFrame>
                </div>
              </div>
            </motion.section>
          );
              })}
            </div>
          </section>
        ))}
      </div>

    </main>
  );
}

const pricingPlans = [
  {
    name: 'Classique',
    price: '29',
    description: 'Une invitation élégante avec les informations essentielles de votre événement.',
    features: ['Modèle prêt à partager', 'Détails de l’événement', 'Confirmation par WhatsApp'],
    className: 'border-[#d8c4a8] bg-[#fffaf5]',
  },
  {
    name: 'Modern',
    price: '49',
    description: 'Une expérience plus dynamique pour présenter votre événement avec style.',
    features: ['Tout le contenu Classique', 'Animations et sections modernes', 'Galerie et RSVP'],
    className: 'border-[#2d241e] bg-[#2d241e] text-white',
  },
  {
    name: 'Personnalisé',
    price: '99',
    description: 'Une invitation conçue autour de votre histoire, de vos couleurs et de vos besoins.',
    features: ['Design adapté à votre identité', 'Contenu et sections sur mesure', 'Accompagnement personnalisé'],
    className: 'border-[#c9a96e] bg-[#f8f1ea]',
  },
];

export function PricingPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const selectedTemplate = templates.find((template) => template.id === templateId);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,171,106,0.2),transparent_32%),linear-gradient(180deg,_#faf5ef_0%,_#f4eee8_100%)] px-4 py-8 text-[#2d241e] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/templates" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5c4a3d] transition hover:text-[#8a6a4a]">
          <ArrowLeft className="h-4 w-4" />
          Retour aux invitations
        </Link>

        <div className="mx-auto mt-12 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#f8f1ea] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a6a4a]">
            <Sparkles className="h-3.5 w-3.5" />
            {selectedTemplate ? 'Votre invitation' : 'Invly'}
          </div>
          <h1 className="mt-5 font-serif text-4xl leading-tight text-[#221b18] sm:text-6xl">Choisissez votre formule</h1>
          <p className="mt-4 text-base leading-7 text-[#5c4a3d]">
            {selectedTemplate ? (
              <>Pour le modèle <span className="font-semibold text-[#2d241e]">{selectedTemplate.title}</span>, choisissez l’offre qui correspond à votre projet.</>
            ) : (
              'Des formules simples pour créer et partager une invitation qui vous ressemble.'
            )}
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => {
            const isFeatured = index === 1;
            const textClass = isFeatured ? 'text-white' : 'text-[#2d241e]';
            const mutedTextClass = isFeatured ? 'text-[#f1e7df]' : 'text-[#5c4a3d]';
            const templateLabel = selectedTemplate?.title ?? 'une invitation';
            const whatsappMessage = encodeURIComponent(`Bonjour Invly, je souhaite choisir la formule ${plan.name} à ${plan.price} DT pour ${templateLabel}.`);

            return (
              <article key={plan.name} className={`flex flex-col rounded-[1.75rem] border p-7 shadow-[0_20px_60px_rgba(92,74,61,0.08)] ${plan.className}`}>
                {isFeatured && <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#e8c990]">Le plus choisi</p>}
                <h2 className={`font-serif text-3xl ${textClass}`}>{plan.name}</h2>
                <p className={`mt-4 min-h-20 text-sm leading-6 ${mutedTextClass}`}>{plan.description}</p>
                <div className={`mt-6 flex items-end gap-2 border-b pb-6 ${isFeatured ? 'border-white/20' : 'border-[#eadfce]'}`}>
                  <span className={`font-serif text-6xl leading-none ${textClass}`}>{plan.price}</span>
                  <span className={`mb-1 text-sm font-semibold ${mutedTextClass}`}>DT</span>
                </div>
                <ul className={`mt-6 space-y-3 text-sm ${mutedTextClass}`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${isFeatured ? 'text-[#e8c990]' : 'text-[#8a6a4a]'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={`https://wa.me/33600000000?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${isFeatured ? 'bg-white text-[#2d241e]' : 'bg-[#2d241e] text-white'}`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Choisir cette formule
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { search } = useLocation();
  const selectedTemplate = templates.find((template) => template.id === templateId) ?? templates[0];
  const TemplateComponent = getTemplateComponent(selectedTemplate.id);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const navigate = useNavigate();
  const searchSuffix = search || '';

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,171,106,0.16),transparent_30%),linear-gradient(180deg,_#f9f3ed_0%,_#f4eee9_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
          <div className="flex w-full flex-col items-center justify-center gap-8">
            <div className="flex w-full items-center justify-center">
              <PhoneFrame className="w-full max-w-[420px]" preview>
                <div className="h-full w-full bg-[#fffaf5]">
                  <TemplateComponent preview />
                </div>
              </PhoneFrame>
            </div>

            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">Template</p>
              <h1 className="mt-3 font-serif text-4xl text-[#2d241e] sm:text-5xl">{selectedTemplate.title}</h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#5c4a3d]">{selectedTemplate.description}</p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/preview/${selectedTemplate.id}${searchSuffix}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2d241e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#453a33]"
                >
                  Voir l&apos;invitation
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOrderOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d8c4a8] bg-[#f9f2eb] px-5 py-3 text-sm font-semibold text-[#2d241e] transition hover:border-[#c9a96e]"
                >
                  Choisir ce modèle
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ShareModal
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        title={selectedTemplate.title}
      />
    </>
  );
}

export function TemplateDevicePreviewPage() {
  const { templateId } = useParams<{ templateId?: string }>();
  const { search } = useLocation();
  const navigate = useNavigate();
  const selectedTemplate = templates.find((template) => template.id === templateId) ?? templates[0];
  const [device, setDevice] = useState<'desktop' | 'laptop' | 'tablet' | 'phone'>('phone');
  const searchSuffix = search || '';

  const presets = useMemo(() => ({
    desktop: { label: 'Desktop / PC', width: 1200, height: 760 },
    laptop: { label: 'Laptop', width: 980, height: 620 },
    tablet: { label: 'iPad / Tablet', width: 760, height: 990 },
    phone: { label: 'iPhone', width: 390, height: 844 },
  }), []);

  const activePreset = presets[device];
  const previewWidth = `min(100%, ${activePreset.width}px)`;
  const previewHeight = `min(76vh, ${activePreset.height}px)`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,171,106,0.18),transparent_30%),linear-gradient(180deg,_#f8f2ec_0%,_#f2ece7_100%)] px-4 py-8 text-[#2d241e] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center">
        <div className="mb-6 flex w-full flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="inline-flex items-center gap-2 rounded-full border border-[#d8c4a8] bg-[#f9f2eb] px-4 py-2 text-sm font-semibold text-[#2d241e]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">Template</p>
            <h1 className="mt-1 font-serif text-2xl text-[#2d241e] sm:text-3xl">{selectedTemplate.title}</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/invitation/${selectedTemplate.id}${searchSuffix}`)}
            className="inline-flex items-center gap-2 rounded-full bg-[#2d241e] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Voir l&apos;invitation
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {Object.entries(presets).map(([key, preset]) => {
            const isActive = device === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDevice(key as keyof typeof presets)}
                className={`group rounded-[1.5rem] border p-3 transition ${isActive ? 'border-[#2d241e] bg-[#fffdfb] shadow-[0_20px_40px_rgba(45,36,30,0.08)]' : 'border-[#eadfce] bg-[#f8f1ea]/70 hover:border-[#d8c4a8]'}`}
              >
                <div className="mb-2 flex items-center justify-center">
                  <div
                    className={`relative overflow-hidden rounded-[1.6rem] border border-[#d9c9b3] bg-[#171311] shadow-[0_18px_50px_rgba(44,36,32,0.18)] ${isActive ? 'ring-2 ring-[#2d241e]/20' : ''}`}
                    style={{
                      width: key === 'desktop' ? 120 : key === 'laptop' ? 136 : key === 'tablet' ? 84 : 56,
                      height: key === 'desktop' ? 72 : key === 'laptop' ? 72 : key === 'tablet' ? 94 : 110,
                    }}
                  >
                    <div className="absolute inset-x-3 inset-y-2 rounded-[inherit] bg-[#f5efe9]" />
                  </div>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#5c4a3d]">{preset.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 sm:mt-10 flex w-full items-center justify-center overflow-hidden px-2 py-4 sm:py-6">
          <div
            className={`relative mx-auto flex items-center justify-center overflow-hidden bg-[#171311] shadow-[0_40px_100px_rgba(34,27,24,0.25)] transition-all duration-300 ${
              device === 'phone'
                ? 'rounded-[2.4rem] border-[10px] sm:border-[12px] border-[#201c1b]'
                : device === 'tablet'
                ? 'rounded-[2rem] border-[10px] border-[#201c1b]'
                : 'rounded-2xl border-4 border-[#201c1b]'
            }`}
            style={{
              width: previewWidth,
              height: previewHeight,
              maxWidth: '100%',
            }}
          >
            {/* Phone Notch: ONLY show for phone preset */}
            {device === 'phone' && (
              <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#171311]" />
            )}
            <iframe
              key={`${selectedTemplate.id}-${device}`}
              src={`/invitation/${selectedTemplate.id}?preview=${device === 'phone' ? '1' : '0'}&embed=1`}
              title={`${selectedTemplate.title} device preview`}
              className="h-full w-full border-0 bg-white"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export function TemplateFullPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { search } = useLocation();
  const selectedTemplate = templates.find((template) => template.id === templateId) ?? templates[0];
  const TemplateComponent = getTemplateComponent(selectedTemplate.id);
  const querySuffix = search || '';

  return (
    <main className="min-h-screen bg-transparent">
      <div className="mb-4 flex items-center justify-between px-4 pt-4 text-sm text-[#5c4a3d]">
        <Link to={`/template/${selectedTemplate.id}${querySuffix}`} className="inline-flex items-center gap-2 font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Link to={`/preview/${selectedTemplate.id}${querySuffix}`} className="inline-flex items-center gap-2 font-medium">
          Preview
        </Link>
      </div>
      <TemplateComponent />
    </main>
  );
}

export default function Template() {
  return <TemplatesPage />;
}

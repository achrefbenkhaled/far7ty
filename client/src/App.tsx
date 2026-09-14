import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Facebook, Instagram, MessageCircle, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { PhoneFrame } from './components/showcase/PhoneFrame';
import { PricingPage, TemplatesPage, TemplateDetailPage, TemplateDevicePreviewPage } from './pages/Template';
import { ContactPage } from './pages/Contact';
import { ManageDashboard, ManageInvitationForm, ManageInvitationPreview, ManageLogin, RequireManageAuth, PublicInvitationPage } from './pages/Manage';
import { ManageLayout } from './components/manage/ManageLayout';
import { templates } from './data/templates';
import { getTemplateComponent } from './templates';

function HomePage() {
  const heroTemplate = templates[0];
  const HeroTemplate = getTemplateComponent(heroTemplate.id);

  return (
    <>
      <Header />
      <main className="bg-[#fffdf9] text-[#2d241e]">
        <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-24 lg:pt-16">
          <div className="flex flex-col justify-center">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#f8f1ea] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a6a4a]">
                <Sparkles className="h-3.5 w-3.5" />
                Invitation studio
              </div>
              <h1 className="max-w-xl font-serif text-5xl leading-[0.95] text-[#221b18] sm:text-6xl lg:text-7xl">
                Votre histoire mérite une invitation exceptionnelle.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#5c4a3d]">
                Découvrez nos invitations digitales élégantes, interactives et personnalisées.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/templates"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2d241e] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#453a33]"
                >
                  Découvrir les modèles
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="https://wa.me/33600000000?text=Bonjour%20Invly%2C%20je%20souhaite%20nous%20contacter%20pour%20une%20invitation%20personnalis%C3%A9e."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d6c6b3] bg-white px-6 py-3.5 text-sm font-semibold text-[#2d241e]"
                >
                  Nous contacter
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { label: 'WhatsApp', href: 'https://wa.me/33600000000?text=Bonjour%20Invly%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20vos%20mod%C3%A8les.', icon: MessageCircle, color: 'bg-[#1f8f5f]' },
                  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram, color: 'bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]' },
                  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook, color: 'bg-[#1877f2]' },
                ].map(({ label, href, icon: Icon, color }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold text-white ${color}`}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }} className="flex items-center justify-center">
            <PhoneFrame className="w-full max-w-[390px]" preview>
              <div className="bg-[#fffaf5]">
                <HeroTemplate preview />
              </div>
            </PhoneFrame>
          </motion.div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Éditorial', description: 'Des invitations qui respirent la finesse, le romantisme et l’élégance.' },
              { title: 'Personnalisées', description: 'Chaque projet est adapté à votre histoire, vos détails et votre ambiance.' },
              { title: 'Prêtes à partager', description: 'Une expérience mobile fluide pour recevoir, admirer et commander.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-[#efe3d8] bg-white p-6 shadow-[0_16px_50px_rgba(92,74,61,0.04)]">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f7efe7] text-[#8a6a4a]">
                  <Check className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-3xl text-[#2d241e]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5c4a3d]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="templates" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">Nos créations</p>
              <h2 className="mt-3 font-serif text-4xl text-[#2d241e] sm:text-5xl">Invitations qui font sensation.</h2>
            </div>
            <a href="/templates" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2d241e]">
              Explorer toutes les invitations
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="space-y-8">
            {templates.slice(0, 3).map((template, index) => {
              const TemplateComponent = getTemplateComponent(template.id);
              const reverse = index % 2 === 1;

              return (
                <div key={template.id} className={`grid items-center gap-8 rounded-[2rem] border border-[#efe3d8] bg-[#fffdfb] p-4 shadow-[0_20px_60px_rgba(92,74,61,0.04)] lg:grid-cols-2 lg:p-6 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                  <div className="space-y-5">
                    <div className="inline-flex rounded-full border border-[#eadfce] bg-[#f8f1ea] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a6a4a]">
                      {template.category}
                    </div>
                    <h3 className="font-serif text-4xl text-[#2d241e]">{template.title}</h3>
                    <p className="max-w-lg text-base leading-7 text-[#5c4a3d]">{template.description}</p>
                    <div className="flex flex-wrap gap-3">
                      <a href={`/preview/${template.id}`} className="inline-flex items-center gap-2 rounded-full bg-[#2d241e] px-5 py-3 text-sm font-semibold text-white">
                        Voir l&apos;invitation
                        <ArrowRight className="h-4 w-4" />
                      </a>
                      <a
                        href={`https://wa.me/33600000000?text=${encodeURIComponent(`Bonjour Invly, je suis intéressé(e) par le modèle ${template.title}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#d6c6b3] bg-[#f9f3ee] px-5 py-3 text-sm font-semibold text-[#2d241e]"
                      >
                        Choisir ce modèle
                      </a>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <PhoneFrame className="w-full max-w-[390px] sm:max-w-[420px]" preview>
                      <div className="bg-[#fffaf5]">
                        <TemplateComponent preview />
                      </div>
                    </PhoneFrame>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[#eadfce] bg-[#f8f1ea] p-6 text-center shadow-[0_20px_60px_rgba(92,74,61,0.04)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">Contact</p>
            <h2 className="mt-4 font-serif text-4xl text-[#2d241e] sm:text-5xl">Votre projet commence ici.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5c4a3d]">
              Parlez-nous de votre événement, de votre style et de la date de votre célébration. Nous vous répondrons avec le modèle le plus adapté.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="https://wa.me/33600000000?text=Bonjour%20Invly%2C%20je%20souhaite%20cr%C3%A9er%20une%20invitation%20personnalis%C3%A9e%20pour%20mon%20%C3%A9v%C3%A8nement." target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1f8f5f] px-6 py-3 text-sm font-semibold text-white">
                <MessageCircle className="h-4 w-4" />
                Contactez-nous sur WhatsApp
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white">
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1877f2] px-6 py-3 text-sm font-semibold text-white">
                <Facebook className="h-4 w-4" />
                Facebook
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#fffdf9] text-[#2d241e]">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/templates" element={<><Header /><TemplatesPage /></>} />
        <Route path="/pricing" element={<><Header /><PricingPage /></>} />
        <Route path="/pricing/:templateId" element={<><Header /><PricingPage /></>} />
        <Route path="/contact" element={<><Header /><ContactPage /></>} />
        <Route path="/template/:templateId" element={<TemplateDetailPage />} />
        <Route path="/preview" element={<TemplateDevicePreviewPage />} />
        <Route path="/preview/:templateId" element={<TemplateDevicePreviewPage />} />
        <Route path="/invitation/:slug" element={<PublicInvitationPage />} />
        <Route path="/manage/login" element={<ManageLogin />} />
        <Route path="/manage" element={<RequireManageAuth><ManageLayout /></RequireManageAuth>}>
          <Route index element={<ManageDashboard />} />
          <Route path="invitations" element={<ManageDashboard />} />
          <Route path="invitations/new" element={<ManageInvitationForm />} />
          <Route path="invitations/:id/edit" element={<ManageInvitationForm />} />
          <Route path="invitations/:id/preview" element={<ManageInvitationPreview />} />
        </Route>
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;

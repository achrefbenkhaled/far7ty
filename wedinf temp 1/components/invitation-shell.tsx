'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { invitationTemplates } from '@/lib/template-data'
import { Navigation } from '@/components/navigation'
import { Envelope } from '@/components/envelope'
import { HeroSection } from '@/components/hero-section'
import { TimelineSection } from '@/components/timeline-section'
import { EventDetails } from '@/components/event-details'
import { GallerySection } from '@/components/gallery-section'
import { RSVPForm } from '@/components/rsvp-form'
import { GiftsSection } from '@/components/gifts-section'
import { Footer } from '@/components/footer'

export function InvitationShell() {
  const [activeTemplateId, setActiveTemplateId] = useState(invitationTemplates[0].id)
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const activeTemplate = useMemo(
    () => invitationTemplates.find((template) => template.id === activeTemplateId) ?? invitationTemplates[0],
    [activeTemplateId],
  )

  return (
    <main className={`min-h-screen w-full overflow-x-hidden ${activeTemplate.theme.shell}`}>
      <div className="mx-auto flex max-w-7xl flex-col px-3 py-5 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur md:px-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Templates</p>
            <p className="font-playfair text-lg text-slate-800">Choose a look</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {invitationTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setActiveTemplateId(template.id)}
                className={`rounded-full border px-3 py-2 text-sm font-medium transition ${activeTemplateId === template.id ? 'border-transparent bg-slate-900 text-white' : 'border-slate-200 bg-white/90 text-slate-700 hover:border-slate-300'}`}
              >
                {template.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div key="intro" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.6 }}>
            <Envelope
              template={activeTemplate}
              onOpen={() => setIsOpen(true)}
            />
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <Navigation template={activeTemplate} />
            <HeroSection template={activeTemplate} />
            <TimelineSection template={activeTemplate} />
            <EventDetails template={activeTemplate} />
            <GallerySection template={activeTemplate} />
            <RSVPForm template={activeTemplate} />
            <GiftsSection template={activeTemplate} />
            <Footer template={activeTemplate} />
          </motion.div>
        )}
      </AnimatePresence>

      {isMounted && !isOpen && (
        <motion.button
          className="fixed bottom-4 right-4 z-50 rounded-full border border-white/60 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
        >
          Open invitation
        </motion.button>
      )}
    </main>
  )
}

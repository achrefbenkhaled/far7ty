'use client'

import { motion } from 'framer-motion'
import type { InvitationTemplate } from '@/lib/template-data'

interface EventDetailsProps {
  template: InvitationTemplate
}

export function EventDetails({ template }: EventDetailsProps) {
  return (
    <section id="details" className="relative w-full px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.h2 className={`text-center font-playfair text-4xl md:text-5xl ${template.theme.heading}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          Event Details
        </motion.h2>

        <motion.div className="mt-12 grid gap-8 md:grid-cols-2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7 }}>
          {template.eventCards.map((event, index) => (
            <motion.div key={event.title} className={`overflow-hidden rounded-3xl border ${template.theme.outline} shadow-lg backdrop-blur ${template.theme.card}`} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.12 }} whileHover={{ y: -8, scale: 1.01 }}>
              <div className={`bg-gradient-to-r p-8 text-white ${template.theme.button}`}>
                <h3 className="font-playfair text-3xl">{event.title}</h3>
                <p className="mt-2 text-lg opacity-90">{event.time}</p>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <h4 className={`font-playfair text-xl ${template.theme.heading}`}>Location</h4>
                    <p className={`mt-2 font-semibold ${template.theme.heading}`}>{event.location}</p>
                    <p className={`mt-1 text-sm ${template.theme.muted}`}>{event.address}</p>
                  </div>
                  <div className={`h-px ${template.theme.outline}`} />
                  <p className={`leading-relaxed ${template.theme.muted}`}>{event.description}</p>
                  <motion.a href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`} target="_blank" rel="noreferrer" className={`inline-flex items-center text-sm font-semibold ${template.theme.accent} transition`} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
                    Get Directions →
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

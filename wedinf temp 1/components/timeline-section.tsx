'use client'

import { motion } from 'framer-motion'
import type { InvitationTemplate } from '@/lib/template-data'

interface TimelineSectionProps {
  template: InvitationTemplate
}

export function TimelineSection({ template }: TimelineSectionProps) {
  return (
    <section id="story" className="relative w-full px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.h2 className={`text-center font-playfair text-4xl md:text-5xl ${template.theme.heading}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          Our Story
        </motion.h2>

        <div className="relative mt-12">
          <motion.div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-300 via-rose-300 to-transparent" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} style={{ originY: 0 }} />

          <div className="space-y-12">
            {template.storyEvents.map((event, index) => (
              <motion.div key={event.year} className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`} initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: index * 0.12 }}>
                <div className="flex-1">
                  <motion.div className={`rounded-2xl border p-6 shadow-lg backdrop-blur ${template.theme.card}`} whileHover={{ y: -6 }}>
                    <div className={`font-playfair text-3xl ${template.theme.accentSoft}`}>{event.year}</div>
                    <h3 className={`mt-2 font-playfair text-2xl ${template.theme.heading}`}>{event.title}</h3>
                    <p className={`mt-3 leading-relaxed ${template.theme.muted}`}>{event.description}</p>
                  </motion.div>
                </div>
                <motion.div className="flex-shrink-0" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.12 + 0.1 }}>
                  <div className={`relative h-8 w-8 rounded-full bg-gradient-to-br ${template.theme.ring} shadow-lg`}>
                    <motion.div className="absolute inset-2 rounded-full bg-white" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }} />
                  </div>
                </motion.div>
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

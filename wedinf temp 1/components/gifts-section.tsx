'use client'

import { motion } from 'framer-motion'
import type { InvitationTemplate } from '@/lib/template-data'

interface GiftsSectionProps {
  template: InvitationTemplate
}

export function GiftsSection({ template }: GiftsSectionProps) {
  return (
    <section id="gifts" className="relative w-full px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.h2 className={`text-center font-playfair text-4xl md:text-5xl ${template.theme.heading}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>Gifts & Wishes</motion.h2>
        <motion.p className={`mx-auto mt-3 max-w-2xl text-center text-lg ${template.theme.muted}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}>Your presence is our greatest gift; if you would like to contribute, these options are available.</motion.p>

        <motion.div className="mt-12 grid gap-8 md:grid-cols-3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7 }}>
          {template.giftOptions.map((option, index) => (
            <motion.a key={option.title} href={option.link} className={`block rounded-[2rem] border p-8 shadow-lg backdrop-blur ${template.theme.card}`} whileHover={{ y: -8 }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }}>
              <div className="text-5xl">{option.icon}</div>
              <h3 className={`mt-4 font-playfair text-2xl ${template.theme.heading}`}>{option.title}</h3>
              <p className={`mt-3 leading-relaxed ${template.theme.muted}`}>{option.description}</p>
            </motion.a>
          ))}
        </motion.div>

        <motion.div className={`mt-12 rounded-[2rem] border p-10 shadow-lg backdrop-blur ${template.theme.card}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <h3 className={`text-center font-playfair text-3xl ${template.theme.heading}`}>Love Wall</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {template.wishes.map((wish, index) => (
              <motion.div key={wish.name} className={`rounded-2xl border p-6 ${template.theme.badge}`} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }} whileHover={{ y: -4 }}>
                <p className={`italic ${template.theme.muted}`}>&quot;{wish.message}&quot;</p>
                <p className={`mt-3 font-semibold ${template.theme.heading}`}>— {wish.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { InvitationTemplate } from '@/lib/template-data'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface HeroSectionProps {
  template: InvitationTemplate
}

export function HeroSection({ template }: HeroSectionProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const weddingDate = new Date(template.countdownTarget).getTime()
      const difference = weddingDate - Date.now()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = window.setInterval(calculateTimeLeft, 1000)
    return () => window.clearInterval(timer)
  }, [template.countdownTarget])

  return (
    <section id="hero" className="relative w-full px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className={`absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl ${template.theme.ring} opacity-25`} animate={{ y: [0, 24, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
          <motion.h2 className={`text-center font-playfair text-4xl md:text-5xl ${template.theme.heading}`}>{template.category === 'Anniversary' ? 'Celebrate With Us' : 'Our Wedding Day'}</motion.h2>
          <motion.p className={`mt-3 text-center text-lg ${template.theme.muted}`}>{template.dateLabel}</motion.p>

          <motion.div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds },
            ].map((item, index) => (
              <motion.div key={item.label} className={`rounded-2xl border p-6 text-center shadow-lg backdrop-blur ${template.theme.card}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.5 }} viewport={{ once: true }} whileHover={{ y: -4, scale: 1.01 }}>
                <div className={`font-playfair text-4xl ${template.theme.accent}`}>{item.value.toString().padStart(2, '0')}</div>
                <div className={`mt-2 text-xs uppercase tracking-[0.35em] ${template.theme.muted}`}>{item.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.p className={`mx-auto mt-10 max-w-2xl text-center leading-relaxed ${template.theme.muted}`} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.8 }}>
            {template.description} We would be honored to celebrate this beautiful moment with you.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

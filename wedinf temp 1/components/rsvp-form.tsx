'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { InvitationTemplate } from '@/lib/template-data'

interface RSVPFormProps {
  template: InvitationTemplate
}

export function RSVPForm({ template }: RSVPFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', attendance: 'yes', guests: '1', dietary: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    window.setTimeout(() => {
      setSubmitted(true)
      setIsLoading(false)
      window.setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: '', email: '', phone: '', attendance: 'yes', guests: '1', dietary: '', message: '' })
      }, 2800)
    }, 800)
  }

  return (
    <section id="rsvp" className="relative w-full px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <motion.h2 className={`text-center font-playfair text-4xl md:text-5xl ${template.theme.heading}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>RSVP</motion.h2>
        <motion.p className={`mt-3 text-center text-lg ${template.theme.muted}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}>Please let us know if you can celebrate with us.</motion.p>

        {!submitted ? (
          <motion.form onSubmit={handleSubmit} className={`mt-10 space-y-6 rounded-[2rem] border p-8 shadow-lg backdrop-blur ${template.theme.card}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <label className={`mb-2 block text-sm font-semibold ${template.theme.heading}`}>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 ${template.theme.outline}`} placeholder="Your name" />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <label className={`mb-2 block text-sm font-semibold ${template.theme.heading}`}>Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 ${template.theme.outline}`} placeholder="your@email.com" />
              </motion.div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}>
                <label className={`mb-2 block text-sm font-semibold ${template.theme.heading}`}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 ${template.theme.outline}`} placeholder="(123) 456-7890" />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}>
                <label className={`mb-2 block text-sm font-semibold ${template.theme.heading}`}>Will you attend? *</label>
                <select name="attendance" value={formData.attendance} onChange={handleChange} className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 ${template.theme.outline}`}>
                  <option value="yes">Yes, I&apos;ll be there!</option>
                  <option value="no">Sorry, I can&apos;t make it</option>
                  <option value="maybe">I&apos;m still deciding</option>
                </select>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}>
              <label className={`mb-2 block text-sm font-semibold ${template.theme.heading}`}>Number of Guests *</label>
              <select name="guests" value={formData.guests} onChange={handleChange} className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 ${template.theme.outline}`}>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
              </select>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.18 }}>
              <label className={`mb-2 block text-sm font-semibold ${template.theme.heading}`}>Dietary Restrictions</label>
              <input type="text" name="dietary" value={formData.dietary} onChange={handleChange} className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 ${template.theme.outline}`} placeholder="Any dietary restrictions or allergies?" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <label className={`mb-2 block text-sm font-semibold ${template.theme.heading}`}>Special Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows={4} className={`w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 ${template.theme.outline}`} placeholder="Share your thoughts or well wishes..." />
            </motion.div>

            <motion.button type="submit" disabled={isLoading} className={`w-full rounded-2xl px-4 py-3 font-semibold text-white transition ${template.theme.button} disabled:opacity-50`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.22 }}>
              {isLoading ? 'Submitting...' : 'Submit RSVP'}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div className={`mt-10 rounded-[2rem] border p-12 text-center shadow-lg ${template.theme.card}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 15 }}>
            <motion.div className="mb-4 text-6xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6 }}>✓</motion.div>
            <h3 className={`font-playfair text-3xl ${template.theme.heading}`}>Thank You!</h3>
            <p className={`mt-3 text-lg ${template.theme.muted}`}>We&apos;ve received your RSVP and we&apos;re excited to celebrate with you.</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}

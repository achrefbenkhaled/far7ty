'use client'

import { motion } from 'framer-motion'
import type { InvitationTemplate } from '@/lib/template-data'

interface FooterProps {
  template: InvitationTemplate
}

export function Footer({ template }: FooterProps) {
  return (
    <footer className="relative w-full bg-slate-950 px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div className="grid gap-8 md:grid-cols-3" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <div>
            <h3 className="font-playfair text-2xl text-amber-300">{template.brandName}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{template.description} We are grateful for your love and company.</p>
          </div>
          <div>
            <h3 className="font-playfair text-xl text-amber-300">Contact</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>Email: hello@{template.brandName.toLowerCase().replace(/\s+/g, '')}.com</p>
              <p>Phone: (555) 111-2222</p>
              <p>Location: {template.eventCards[0].address}</p>
            </div>
          </div>
          <div>
            <h3 className="font-playfair text-xl text-amber-300">Stay Connected</h3>
            <div className="mt-3 flex gap-4 text-sm text-slate-300">
              {['Instagram', 'Facebook', 'Pinterest'].map((social) => (
                <motion.a key={social} href="#" className="transition-colors hover:text-amber-300" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
                  {social}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div className="mt-10 h-px bg-white/10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ originX: 0 }} />
        <motion.div className="mt-8 text-center text-sm text-slate-400" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p>© 2025 {template.brandName}. Made with love and motion.</p>
        </motion.div>
      </div>
    </footer>
  )
}

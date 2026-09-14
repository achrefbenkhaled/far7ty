'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { InvitationTemplate } from '@/lib/template-data'

interface GallerySectionProps {
  template: InvitationTemplate
}

export function GallerySection({ template }: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const slides = useMemo(() => template.galleryImages.map((item, index) => ({ ...item, id: index + 1 })), [template.galleryImages])

  return (
    <section id="gallery" className="relative w-full px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.h2 className={`text-center font-playfair text-4xl md:text-5xl ${template.theme.heading}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          Memories
        </motion.h2>

        <motion.div className="mt-12 grid gap-6 md:grid-cols-3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          {slides.map((image, index) => (
            <motion.button key={image.id} className={`group relative aspect-square overflow-hidden rounded-3xl border ${template.theme.outline} text-left shadow-lg`} onClick={() => setSelectedImage(image.id)} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }} whileHover={{ scale: 1.03 }}>
              <motion.div className={`absolute inset-0 bg-gradient-to-br ${template.theme.ring} opacity-80 group-hover:opacity-90`} animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }} transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                <p className="font-playfair text-2xl">{image.title}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.3em] opacity-90">{image.category}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence>
          {selectedImage !== null && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)}>
              <motion.div className="w-full max-w-3xl rounded-3xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                <div className={`flex aspect-[4/3] items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${template.theme.ring}`}>
                  <div className="text-center text-white">
                    <p className="font-playfair text-3xl sm:text-4xl">{slides[selectedImage - 1]?.title}</p>
                    <p className="mt-3 text-sm uppercase tracking-[0.35em] opacity-90">{slides[selectedImage - 1]?.category}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-white">
                  <button className="rounded-full border border-white/20 px-4 py-2" onClick={() => setSelectedImage((prev) => (prev === 1 ? slides.length : prev! - 1))}>← Previous</button>
                  <button className="rounded-full border border-white/20 px-4 py-2" onClick={() => setSelectedImage((prev) => (prev === slides.length ? 1 : prev! + 1))}>Next →</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

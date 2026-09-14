'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { InvitationTemplate } from '@/lib/template-data'

interface NavigationProps {
  template: InvitationTemplate
}

export function Navigation({ template }: NavigationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <motion.div className="font-playfair text-xl text-slate-800" whileHover={{ scale: 1.05 }}>
          {template.brandName}
        </motion.div>

        <div className="hidden items-center gap-8 md:flex">
          {template.navItems.map((item) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
            </motion.a>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}

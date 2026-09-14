'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { InvitationTemplate } from '@/lib/template-data'

interface EnvelopeProps {
  template: InvitationTemplate
  onOpen?: () => void
}

interface Particle {
  id: number
  x: number
  y: number
}

export function Envelope({ template, onOpen }: EnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [leftName, rightName] = template.coupleNames

  const handleOpen = () => {
    setIsOpen(true)
    onOpen?.()
    
    // Generate particles on open
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 300,
    }))
    setParticles(newParticles)
  }

  return (
    <div className={`relative flex h-screen w-full items-center justify-center overflow-hidden ${template.theme.shell}`}>
      {/* Light flash on door opening */}
      <motion.div
        className="absolute inset-0 bg-white z-40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isOpen ? { opacity: [0, 0.7, 0] } : { opacity: 0 }}
        transition={{ duration: 1.2, delay: 0.8 }}
      />
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-300/40 to-transparent rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-48 -right-48 w-96 h-96 bg-gradient-to-tl from-amber-300/40 to-transparent rounded-full blur-3xl"
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          // Closed invitation card state
          <motion.div
            key="envelope"
            className="relative z-10 w-[85vw] h-[85vh] max-w-2xl max-h-screen cursor-pointer"
            onClick={handleOpen}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotateX: 25, y: 30 }}
              animate={isOpen ? { opacity: 0, scale: 0.8, y: -100 } : { opacity: 1, scale: 1, rotateX: 0, y: 0 }}
              transition={{ duration: isOpen ? 1.2 : 1, ease: 'easeOut' }}
              className={`relative h-full w-full overflow-hidden rounded-[2rem] border ${template.theme.outline} shadow-2xl ${template.theme.surface}`}
              style={{ perspective: '1400px' }}
            >
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-40 pointer-events-none">
                <motion.div
                  className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-amber-200/50 to-transparent rounded-full blur-3xl"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-rose-200/50 to-transparent rounded-full blur-3xl"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
              </div>

              {/* Shimmer overlay effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={isOpen ? { opacity: 0 } : { opacity: [0, 0.05, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent" />
              </motion.div>

              {/* Left door - slides left on open */}
              <motion.div
                className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-rose-200/60 via-rose-100/40 to-transparent flex flex-col items-center justify-end z-20 origin-left pb-12 sm:pb-20 shadow-2xl"
                initial={{ rotateY: 0 }}
                animate={isOpen ? { rotateY: -120, x: -20 } : { rotateY: 0, x: 0 }}
                transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ perspective: '2000px' }}
              >
                <motion.div
                  className="text-center px-2 sm:px-4"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={isOpen ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeIn' }}
                >
                  <motion.p
                    className={`font-playfair text-4xl font-light leading-tight tracking-wider sm:text-5xl md:text-6xl lg:text-7xl ${template.theme.heading}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                  >
                    {leftName}
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Right door - slides right on open */}
              <motion.div
                className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-amber-200/60 via-amber-100/40 to-transparent flex flex-col items-center justify-start z-20 origin-right pt-12 sm:pt-20 shadow-2xl"
                initial={{ rotateY: 0 }}
                animate={isOpen ? { rotateY: 120, x: 20 } : { rotateY: 0, x: 0 }}
                transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ perspective: '2000px' }}
              >
                <motion.div
                  className="text-center px-2 sm:px-4"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={isOpen ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeIn' }}
                >
                  <motion.p
                    className={`font-playfair text-4xl font-light leading-tight tracking-wider sm:text-5xl md:text-6xl lg:text-7xl ${template.theme.accent}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                  >
                    {rightName}
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Decorative ornaments at center - replaces line */}
              <motion.div
                className="absolute left-1/2 top-8 transform -translate-x-1/2 z-10 pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    className="w-2 h-2 bg-amber-400 rounded-full shadow-lg shadow-amber-400/60"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-1 h-6 bg-gradient-to-b from-amber-400/60 to-amber-200/20"
                    animate={{ scaleY: [1, 1.2, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              {/* Bottom decorative ornaments */}
              <motion.div
                className="absolute left-1/2 bottom-8 transform -translate-x-1/2 z-10 pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    className="w-1 h-6 bg-gradient-to-t from-amber-400/60 to-amber-200/20"
                    animate={{ scaleY: [1, 1.2, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-amber-400 rounded-full shadow-lg shadow-amber-400/60"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              {/* Horizontal decorative flourishes - left side */}
              <motion.div
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none"
                initial={{ opacity: 0, x: -20 }}
                animate={isOpen ? { opacity: 0 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <svg width="40" height="60" viewBox="0 0 40 60" className="text-amber-300/50">
                  <path d="M 5 10 Q 15 20 5 30 Q 15 40 5 50" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </motion.div>

              {/* Horizontal decorative flourishes - right side */}
              <motion.div
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none"
                initial={{ opacity: 0, x: 20 }}
                animate={isOpen ? { opacity: 0 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <svg width="40" height="60" viewBox="0 0 40 60" className="text-amber-300/50">
                  <path d="M 35 10 Q 25 20 35 30 Q 25 40 35 50" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </motion.div>

              {/* Ampersand in center with animation */}
              <motion.div
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-5 pointer-events-none"
                initial={{ opacity: 0, scale: 0, rotateZ: -180 }}
                animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1, rotateZ: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              >
                <motion.p
                  className="font-playfair text-6xl sm:text-7xl text-amber-500 font-light drop-shadow-md"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  &
                </motion.p>
              </motion.div>

              {/* Wedding ring - appears when doors open */}
              <motion.div
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
                initial={{ scale: 0, opacity: 0, rotateZ: 0 }}
                animate={isOpen ? { scale: 1.2, opacity: 1, rotateZ: 360 } : { scale: 0, opacity: 0, rotateZ: 0 }}
                transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
              >
                <div className="relative">
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-300/70 via-amber-400/95 to-amber-300/70 rounded-full blur-3xl"
                    animate={isOpen ? { scale: [1, 1.6, 1.3], opacity: [0.8, 1, 0.8] } : { scale: 0.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
                    style={{ width: '200px', height: '200px' }}
                  />

                  {/* Ring SVG */}
                  <svg
                    viewBox="0 0 100 100"
                    className="relative w-36 h-36 drop-shadow-2xl"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <defs>
                      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#fcd34d', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    {/* Main ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="url(#ringGrad)"
                      strokeWidth="3.5"
                      strokeDasharray="219.8"
                      strokeDashoffset={isOpen ? 0 : 219.8}
                      style={{
                        transition: isOpen ? 'stroke-dashoffset 1.3s ease-out 0.5s' : 'stroke-dashoffset 0.3s',
                      }}
                    />
                    {/* Inner accent */}
                    <circle
                      cx="50"
                      cy="50"
                      r="24"
                      stroke="url(#ringGrad)"
                      strokeWidth="2"
                      opacity="0.7"
                      strokeDasharray="150.8"
                      strokeDashoffset={isOpen ? 0 : 150.8}
                      style={{
                        transition: isOpen ? 'stroke-dashoffset 1.5s ease-out 0.7s' : 'stroke-dashoffset 0.3s',
                      }}
                    />
                    {/* Gem - top */}
                    <circle cx="50" cy="12" r="6" fill="#fbbf24" />
                    <circle cx="50" cy="12" r="3" fill="white" opacity="0.9" />
                  </svg>
                </div>
              </motion.div>

              {/* Top text - "YOU ARE INVITED" */}
              <motion.div
                className="absolute top-6 sm:top-8 left-0 right-0 text-center z-5 pointer-events-none"
                initial={{ opacity: 1, y: 0 }}
                animate={isOpen ? { opacity: 0, y: -20, scale: 0.8 } : { opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeIn' }}
              >
                <p className={`text-xs font-bold uppercase tracking-[0.35em] drop-shadow-sm sm:text-sm ${template.theme.accent}`}>
                  {template.introLabel}
                </p>
              </motion.div>

              {/* Bottom hint text */}
              <motion.div
                className="absolute bottom-6 sm:bottom-8 left-0 right-0 text-center z-5 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 1.2, delay: 1 }}
              >
                <motion.p
                  className={`text-xs font-medium uppercase tracking-[0.3em] sm:text-sm ${template.theme.muted}`}
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  Tap to open
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Floating sparkles around card */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`spark-${i}`}
                className="absolute w-2.5 h-2.5 bg-amber-300 rounded-full shadow-lg shadow-amber-400/80"
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: [0, 0.8, 1, 0.8, 0],
                  scale: [0, 0.5, 1, 0.5, 0],
                  x: [0, Math.cos(i * Math.PI / 6) * 150, Math.cos(i * Math.PI / 6) * 130],
                  y: [0, Math.sin(i * Math.PI / 6) * 150, Math.sin(i * Math.PI / 6) * 130],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 4 + i * 0.2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-5px',
                  marginTop: '-5px',
                }}
              />
            ))}
          </motion.div>
        ) : (
          // Opened invitation content
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
            className="text-center z-10 px-4 sm:px-6 py-12 max-w-2xl"
          >
            {/* Particle burst on open */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="fixed w-2 h-2 bg-amber-400 rounded-full shadow-lg shadow-amber-400/80"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-4px',
                  marginTop: '-4px',
                }}
              />
            ))}

            <motion.h1
              className={`mb-4 font-playfair text-5xl sm:text-6xl lg:text-7xl ${template.theme.heading}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {template.coupleNames.join(' & ')}
            </motion.h1>

            <motion.div
              className="h-1.5 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8 shadow-md"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            />

            <motion.p
              className={`mb-4 text-lg sm:text-xl ${template.theme.muted}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {template.subtitle}
            </motion.p>

            <motion.p
              className={`mb-12 text-base sm:text-lg ${template.theme.muted}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              {template.dateLabel}
            </motion.p>

            <motion.button
              onClick={() => {
                window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
              }}
              className={`rounded-full px-8 py-3 font-semibold tracking-wide text-white transition-all ${template.theme.button}`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              Explore Our Story
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

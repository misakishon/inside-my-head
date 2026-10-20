import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { motion } from 'motion/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // GSAP ScrollTrigger timeline
  useGSAP(
    () => {
      // Scroll indicator line
      gsap.to(progressBarRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        },
      })

      // Staggered cards reveal on scroll
      const cards = gsap.utils.toArray<HTMLElement>('.gsap-card')
      cards.forEach((card) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Scroll Progress Bar (GSAP Controlled) */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 origin-left z-50 scale-x-0"
      />

      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] pointer-events-none" />

        {/* Motion Micro-interaction Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-300 backdrop-blur-md mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          React + TypeScript + Tailwind + GSAP + Motion
        </motion.div>

        {/* Hero Title with Motion */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="text-5xl sm:text-7xl font-extrabold tracking-tight max-w-4xl"
        >
          Dynamic Animation{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Stack Initialized
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl"
        >
          High-performance scroll-driven choreography with GSAP ScrollTrigger, combined with physics-based gesture interactions powered by Motion.
        </motion.p>

        {/* Interactive Motion Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            href="#scroll-section"
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 25px rgba(99, 102, 241, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
          >
            Explore ScrollTrigger ↓
          </motion.a>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="px-6 py-3 rounded-xl font-semibold border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition-colors"
          >
            Jump to Motion Lab
          </motion.button>
        </motion.div>

        {/* Scroll down prompt */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-xs text-slate-500 font-mono"
        >
          <span>SCROLL TO TRIGGER</span>
          <div className="w-5 h-9 rounded-full border border-slate-700 flex justify-center pt-2">
            <div className="w-1 h-2 bg-indigo-400 rounded-full animate-bounce" />
          </div>
        </motion.div>
      </header>

      {/* GSAP ScrollTrigger Feature Section */}
      <section id="scroll-section" className="py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-400 font-mono text-sm tracking-wider uppercase">Scroll-Driven Choreography</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2">GSAP ScrollTrigger in Action</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            These cards are triggered dynamically as they enter the viewport using GSAP's scrollTrigger plugin with React integration.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="gsap-card p-8 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-lg mb-6">
              01
            </div>
            <h3 className="text-xl font-bold mb-2">GSAP Core & ScrollTrigger</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Industrial-grade timeline control, scroll scrubbing, pinning, and viewport listeners with zero jank.
            </p>
          </div>

          <div className="gsap-card p-8 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-lg mb-6">
              02
            </div>
            <h3 className="text-xl font-bold mb-2">Tailwind CSS v4</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              High-velocity utility styling integrated natively into Vite with sub-millisecond compilation and modern design tokens.
            </p>
          </div>

          <div className="gsap-card p-8 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-lg mb-6">
              03
            </div>
            <h3 className="text-xl font-bold mb-2">Motion Micro-Interactions</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Declarative, physics-based gesture state handling for hovering, dragging, spring damping, and exit/enter states.
            </p>
          </div>
        </div>
      </section>

      {/* Motion Micro-Interactions Interactive Sandbox */}
      <section className="py-24 px-6 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="text-purple-400 font-mono text-sm tracking-wider uppercase">Interactive Gestures</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2">Motion Micro-Interaction Sandbox</h2>
          <p className="text-slate-400 mt-2">Try dragging, hovering, and tapping the elements below.</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Draggable & Spring Physics */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center min-h-[220px]">
            <span className="text-xs font-mono text-slate-500 mb-4">DRAG ME (SPRING CONSTRAINED)</span>
            <motion.div
              drag
              dragConstraints={{ left: -60, right: 60, top: -40, bottom: 40 }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.15, cursor: 'grabbing' }}
              whileHover={{ scale: 1.05, cursor: 'grab' }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center font-bold text-2xl select-none"
            >
              ✦
            </motion.div>
          </div>

          {/* Hover 3D Card Effect */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center min-h-[220px]">
            <span className="text-xs font-mono text-slate-500 mb-4">HOVER ELEVATION & GLOW</span>
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-xs p-5 rounded-xl border border-slate-700/60 bg-slate-800/60 backdrop-blur text-center transition-all shadow-md"
            >
              <p className="font-semibold text-slate-200">Interactive Card</p>
              <p className="text-xs text-slate-400 mt-1">Responsive physics spring response</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-600 border-t border-slate-900 font-mono">
        Animated Stack • React 19 • TypeScript • Vite • Tailwind CSS • GSAP • Motion
      </footer>
    </div>
  )
}

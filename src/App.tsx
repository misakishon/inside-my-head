import { useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { motion, AnimatePresence } from 'motion/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface ComponentCard {
  id: string
  title: string
  category: string
  image: string
  desc: string
  accent: string
  tag: string
}

const COMPONENTS: ComponentCard[] = [
  {
    id: 'laptop',
    title: 'Code & Architecture',
    category: 'Engineering',
    image: '/components/03_laptop.png',
    desc: 'Full-stack engineering with React 19, TypeScript, Vite, and modern scalable design patterns.',
    accent: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    tag: '</> Clean Code'
  },
  {
    id: 'bulb',
    title: 'Spark & Ideation',
    category: 'Strategy',
    image: '/components/04_lightbulb.png',
    desc: 'Unlocking breakthrough concepts and translating abstract vision into concrete digital products.',
    accent: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400',
    tag: '⚡ Eureka Moments'
  },
  {
    id: 'gamepad',
    title: 'Play & Interaction',
    category: 'Experience',
    image: '/components/05_game_controller.png',
    desc: 'Physics-based micro-interactions, responsive tactile gestures, and delightful gamification.',
    accent: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    tag: '🎮 Tactile UX'
  },
  {
    id: 'headphones',
    title: 'Focus & Soundscapes',
    category: 'Sensory',
    image: '/components/06_headphones.png',
    desc: 'Immersion in deep cognitive flow states, ambient audio feedback, and rhythmic animation pacing.',
    accent: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-400',
    tag: '🎧 Flow State'
  },
  {
    id: 'gear',
    title: 'System Mechanics',
    category: 'Infrastructure',
    image: '/components/09_gear.png',
    desc: 'Zero-latency state synchronization, robust component pipelines, and bulletproof logic.',
    accent: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    tag: '⚙️ Reliability'
  },
  {
    id: 'mug',
    title: 'Craft & Fuel',
    category: 'Daily Ritual',
    image: '/components/10_coffee_mug.png',
    desc: 'Espresso-driven midnight sprints, relentless polish, and obsession with pixel perfection.',
    accent: 'from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-400',
    tag: '☕ Dark Roast'
  },
  {
    id: 'phone',
    title: 'Mobile Ergonomics',
    category: 'Responsive',
    image: '/components/07_smartphone.png',
    desc: 'Touch-optimized layouts, dynamic viewport budgets, and frictionless handheld navigation.',
    accent: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    tag: '📱 Mobile First'
  },
  {
    id: 'notebook',
    title: 'Blueprints & Docs',
    category: 'Methodology',
    image: '/components/08_spiral_notebook.png',
    desc: 'Structured specs, architectural wireframes, and traceable planning before shipping code.',
    accent: 'from-slate-500/20 to-zinc-500/20 border-slate-500/30 text-slate-300',
    tag: '📝 Architecture'
  }
]

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [selectedFormat, setSelectedFormat] = useState<'gif' | 'webp'>('gif')
  const [activeCard, setActiveCard] = useState<ComponentCard | null>(null)

  // GSAP ScrollTrigger timeline
  useGSAP(
    () => {
      // Top scroll progress bar
      gsap.to(progressBarRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2,
        },
      })

      // Stagger in cards on scroll
      const cards = gsap.utils.toArray<HTMLElement>('.mind-card')
      cards.forEach((card) => {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        })
      })
    },
    { scope: containerRef }
  )

  const activeSrc = selectedFormat === 'gif' ? '/17_mind_blown_avatar.gif' : '/mind_blown_avatar.webp'

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 origin-left z-50 scale-x-0"
      />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/60 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-indigo-500/20">
              ✦
            </span>
            <span className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400 bg-clip-text text-transparent">
              UNLEASHED <span className="text-xs font-mono text-indigo-400 font-normal ml-1">// LAB</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#hero" className="hover:text-slate-100 transition-colors">Overview</a>
            <a href="#anatomy" className="hover:text-slate-100 transition-colors">Mind Anatomy</a>
            <a href="#stack" className="hover:text-slate-100 transition-colors">Tech Stack</a>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ANIMATION LIVE
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" ref={heroRef} className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Status pill */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-300 backdrop-blur-md mb-6"
            >
              <span className="text-sm">🧠</span>
              <span>Where Code & Creative Thoughts Explode</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08]"
            >
              Creative Ideas,{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Unleashed.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed"
            >
              Watch ideas erupt from thought to reality. An autonomous character animation capturing the raw momentum of software engineering, zero-gravity ideation, and interactive motion.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <motion.a
                href="#anatomy"
                whileHover={{ scale: 1.04, boxShadow: '0px 0px 30px rgba(99, 102, 241, 0.4)' }}
                whileTap={{ scale: 0.96 }}
                className="px-7 py-3.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
              >
                <span>Deconstruct Anatomy</span>
                <span className="text-indigo-300 font-mono text-sm">↓</span>
              </motion.a>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedFormat(selectedFormat === 'gif' ? 'webp' : 'gif')}
                className="px-6 py-3.5 rounded-xl font-medium border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Format: {selectedFormat.toUpperCase()}</span>
                <span className="text-xs font-mono text-slate-500">(Click to switch)</span>
              </motion.button>
            </motion.div>

            {/* Quick stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-14 grid grid-cols-3 gap-6 pt-8 border-t border-slate-900 w-full max-w-lg"
            >
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">60 FPS</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">Render Engine</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">12+</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">Extracted Items</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">0 ms</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">Jank Latency</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: The Animated Avatar Display Card */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              whileHover={{ rotateY: 5, rotateX: -5 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-full max-w-md rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800 shadow-2xl shadow-indigo-950/40 backdrop-blur-2xl transition-transform"
            >
              {/* Radial inner glow behind character */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-indigo-500/10 to-cyan-500/10 rounded-3xl pointer-events-none" />

              {/* Top Card Bar */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
                  17_mind_blown_avatar.{selectedFormat}
                </div>
              </div>

              {/* The GIF / WebP Animation Player */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-center p-2 min-h-[460px]">
                <img
                  src={activeSrc}
                  alt="Mind Blown Avatar Animation"
                  className="w-full h-auto object-contain max-h-[520px] select-none pointer-events-none filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
                  loading="eager"
                />
              </div>

              {/* Orbiting Floating Badge 1 (Top Left) */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-xl shadow-lg shadow-cyan-950/50 text-xs font-semibold text-cyan-300 flex items-center gap-2 hidden sm:flex"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Zero-Gravity Ideation</span>
              </motion.div>

              {/* Orbiting Floating Badge 2 (Bottom Right) */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.0, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-4 -right-4 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-indigo-500/40 backdrop-blur-xl shadow-lg shadow-indigo-950/50 text-xs font-semibold text-indigo-300 flex items-center gap-2 hidden sm:flex"
              >
                <span>🚀 Full Burst Mode</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Anatomy Showcase ("What Emerges From The Head") */}
      <section id="anatomy" className="py-28 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            Deconstructed Anatomy
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold mt-4 tracking-tight">
            Inside the Mind's Orbit
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Every element that bursts out of the character's open head has been extracted into isolated, pixel-perfect assets. Hover over each component to inspect its role.
          </p>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMPONENTS.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCard(item)}
              className="mind-card group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-900/30 border border-slate-800/80 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Top Tag */}
              <div className="flex items-center justify-between mb-6">
                <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-md border ${item.accent}`}>
                  {item.tag}
                </span>
                <span className="text-xs text-slate-500 font-mono">{item.category}</span>
              </div>

              {/* Component Image */}
              <div className="relative h-40 flex items-center justify-center my-2 p-2">
                <div className="absolute inset-0 bg-radial from-slate-800/30 to-transparent rounded-xl pointer-events-none group-hover:scale-110 transition-transform" />
                <motion.img
                  src={item.image}
                  alt={item.title}
                  className="max-h-32 max-w-[85%] object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Card Footer Details */}
              <div className="mt-4 pt-4 border-t border-slate-800/60">
                <h3 className="font-bold text-slate-200 text-lg group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack Integration Section */}
      <section id="stack" className="py-24 px-6 border-t border-slate-900 bg-slate-950/60 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Architecture Blueprint</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">Built With Next-Gen Stack</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-xl mx-auto">
              Precision synchronization between animation runtimes, utility styling, and reactive state management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xl mb-6">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-2">React 19 + TypeScript</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Type-safe component tree with ultra-fast compilation through Vite 8 and deterministic asset loading.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xl mb-6">
                📜
              </div>
              <h3 className="text-xl font-bold mb-2">GSAP ScrollTrigger</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Hardware-accelerated viewport-driven choreography, timeline scrubbing, and sub-pixel progress indicators.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-xl mb-6">
                🎯
              </div>
              <h3 className="text-xl font-bold mb-2">Motion Micro-Physics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Physics-based spring curves for interactive button states, 3D hover elevations, and dynamic modal transitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Inspector for Active Card */}
      <AnimatePresence>
        {activeCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveCard(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-center"
            >
              <button
                onClick={() => setActiveCard(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors font-mono"
              >
                ✕
              </button>

              <div className="w-32 h-32 mx-auto my-4 flex items-center justify-center p-2 rounded-2xl bg-slate-950/60 border border-slate-800">
                <img src={activeCard.image} alt={activeCard.title} className="max-h-24 max-w-[85%] object-contain" />
              </div>

              <span className={`inline-block text-xs font-mono font-medium px-2.5 py-1 rounded-md border mt-2 ${activeCard.accent}`}>
                {activeCard.tag}
              </span>

              <h3 className="text-2xl font-bold text-white mt-4">{activeCard.title}</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{activeCard.desc}</p>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-500">
                <span>CATEGORY: {activeCard.category.toUpperCase()}</span>
                <span>STATUS: EXTRACTED</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Creative Ideas Unleashed. All assets extracted & animated.</p>
          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-slate-300 transition-colors">Back to Top ↑</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

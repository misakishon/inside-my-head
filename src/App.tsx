import { useState, useEffect, useRef } from 'react'

interface InteractiveItem {
  id: string
  name: string
  title: string
  subtitle: string
  desc: string
  image: string
  bounds: { left: number; top: number; width: number; height: number }
  badge?: string
}

const INTERACTIVE_ITEMS: InteractiveItem[] = [
  {
    id: 'laptop',
    name: 'Cyber Rig',
    title: 'WORKSTATION // CYBER RIG',
    subtitle: 'MacBook Pro / Quantum Neural Rig',
    desc: 'The primary powerhouse for engineering web applications, graphics engines, and responsive design systems. Click below to personalize with your own laptop photo.',
    image: '/assets/my_laptop.png',
    bounds: { left: 21.0, top: 22.6, width: 33.0, height: 18.7 },
    badge: '★ Featured Component'
  },
  {
    id: 'lightbulb',
    name: 'Synapse Spark',
    title: 'SYNAPSE // SPARK',
    subtitle: 'Bioluminescent Ideation',
    desc: 'Unlocking breakthrough concepts, creative directions, and translating abstract vision into concrete digital products.',
    image: '/components/04_lightbulb.png',
    bounds: { left: 47.6, top: 21.5, width: 12.2, height: 10.5 }
  },
  {
    id: 'controller',
    name: 'Arcade Pad',
    title: 'TACTILE // ARCADE PAD',
    subtitle: 'Zero-G Haptic Controller',
    desc: 'Physics-based micro-interactions, responsive tactile feedback, and delightful gamified storytelling.',
    image: '/components/05_game_controller.png',
    bounds: { left: 59.2, top: 23.4, width: 20.7, height: 11.8 }
  },
  {
    id: 'headphones',
    name: 'Sonic Rig',
    title: 'FREQUENCY // SONIC RIG',
    subtitle: 'Cyber-Acoustic Immersion',
    desc: 'Deep cognitive flow states, ambient focus soundscapes, and rhythmic animation pacing.',
    image: '/components/06_headphones.png',
    bounds: { left: 62.4, top: 32.3, width: 22.5, height: 15.2 }
  },
  {
    id: 'smartphone',
    name: 'Commlink',
    title: 'POCKET // COMMLINK',
    subtitle: 'Sub-Space Transceiver',
    desc: 'Dynamic touch gestures, fluid viewport budgets, and frictionless handheld ergonomics.',
    image: '/components/07_smartphone.png',
    bounds: { left: 48.5, top: 34.8, width: 15.1, height: 12.0 }
  },
  {
    id: 'notebook',
    name: 'Blueprints',
    title: 'CODEX // BLUEPRINTS',
    subtitle: 'Holographic Schematics',
    desc: 'Traceable planning, architectural diagrams, and structured specifications before shipping code.',
    image: '/components/08_spiral_notebook.png',
    bounds: { left: 24.9, top: 40.5, width: 21.1, height: 15.0 }
  },
  {
    id: 'gear',
    name: 'Chrono-Gear',
    title: 'CORE // CHRONO-GEAR',
    subtitle: 'Perpetual Motion Engine',
    desc: 'Zero-latency state synchronization, robust component pipelines, and bulletproof runtime stability.',
    image: '/components/09_gear.png',
    bounds: { left: 45.9, top: 46.1, width: 12.1, height: 8.2 }
  },
  {
    id: 'coffee_mug',
    name: 'Fuel Cell',
    title: 'ELIXIR // DARK MATTER',
    subtitle: 'High-Octane Fuel Cell',
    desc: 'Espresso-driven sprints, relentless attention to detail, and obsession with pixel precision.',
    image: '/components/10_coffee_mug.png',
    bounds: { left: 64.2, top: 46.4, width: 15.9, height: 10.2 }
  },
  {
    id: 'binder',
    name: 'Token Vault',
    title: 'ARCHIVE // PROTOCOLS',
    subtitle: 'Design Token Vault',
    desc: 'Comprehensive design tokens, typography rules, and modular component documentation.',
    image: '/components/11_document_binder.png',
    bounds: { left: 53.9, top: 49.4, width: 11.5, height: 7.7 }
  },
  {
    id: 'paper',
    name: 'Memory Scrap',
    title: 'GLITCH // MEMORY SCRAP',
    subtitle: 'Drifting Thought Fragments',
    desc: 'Spontaneous brainstorms and creative thoughts floating freely out of the mind.',
    image: '/components/12_floating_paper.png',
    bounds: { left: 36.3, top: 52.3, width: 12.3, height: 6.0 }
  },
  {
    id: 'cap',
    name: 'Psi-Helmet',
    title: 'SNAPBACK // PSI-HELMET',
    subtitle: 'Neural Containment Unit',
    desc: 'The signature cap popped off to release creative ideas and superpowers into the world.',
    image: '/components/02_floating_cap.png',
    bounds: { left: 20.4, top: 2.2, width: 53.7, height: 20.9 }
  }
]

export default function App() {
  const [isActive, setIsActive] = useState(false)
  const [audioOn, setAudioOn] = useState(false)
  const [timeStr, setTimeStr] = useState('11:08')
  const [selectedItem, setSelectedItem] = useState<InteractiveItem | null>(null)
  const [customLaptopImg, setCustomLaptopImg] = useState<string | null>(() => {
    try {
      return localStorage.getItem('my_laptop_img')
    } catch {
      return null
    }
  })
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle uploading custom laptop image
  const handleLaptopImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const res = reader.result as string
        setCustomLaptopImg(res)
        try {
          localStorage.setItem('my_laptop_img', res)
        } catch {
          // ignore storage quota
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResetLaptopImage = () => {
    setCustomLaptopImg(null)
    try {
      localStorage.removeItem('my_laptop_img')
    } catch {
      // ignore
    }
  }

  // Real-time dynamic clock for Neo-Tokyo (UTC+9)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
      try {
        const formatter = new Intl.DateTimeFormat([], options)
        setTimeStr(formatter.format(now))
      } catch {
        const h = String(now.getHours()).padStart(2, '0')
        const m = String(now.getMinutes()).padStart(2, '0')
        setTimeStr(`${h}:${m}`)
      }
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Web Audio subtle click synthesizer
  const toggleAudio = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtxRef.current = new AudioCtx()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(audioOn ? 240 : 480, ctx.currentTime)
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch {
      // AudioContext fallback
    }
    setAudioOn((prev) => !prev)
  }

  // Toggle open state EXCLUSIVELY on click/press (not hover)
  const handleToggle = () => {
    setIsActive((prev) => {
      const next = !prev
      if (audioOn) {
        try {
          if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
            audioCtxRef.current = new AudioCtx()
          }
          const ctx = audioCtxRef.current
          if (ctx.state === 'suspended') ctx.resume()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(next ? 520 : 320, ctx.currentTime)
          gain.gain.setValueAtTime(0.06, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.12)
        } catch {
          // audio fallback
        }
      }
      return next
    })
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden p-[20px_28px] flex flex-col justify-between box-border bg-[#E8E8E8] text-[#111111] antialiased selection:bg-[#EE4338] selection:text-white select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          TOP ROW (Grid cols 1–12, strictly aligned with bottom rows)
      ───────────────────────────────────────────────────────────── */}
      <header className="grid grid-cols-12 gap-x-6 items-start w-full">
        
        {/* Cols 1–2: Vertical Rotated Logo & Metadata */}
        <div className="col-span-2 flex items-start">
          <div className="flex flex-row items-stretch gap-[6px] select-none h-[115px]">
            {/* Left vertical column: Large bold MISAKI® */}
            <div className="vertical-lr-reverse font-extrabold text-[1.85rem] leading-none tracking-[-0.03em] text-[#111111] font-mono whitespace-nowrap">
              MISAKI®
            </div>
            {/* Right vertical column: Tiny metadata with clean separation */}
            <div className="vertical-lr-reverse flex justify-between h-full text-[0.65rem] text-[#555555] font-mono leading-none tracking-normal whitespace-nowrap py-0.5">
              <span>grid 07 &nbsp; neo-tokyo</span>
              <span>system est. 2026</span>
            </div>
          </div>
        </div>

        {/* Cols 3–4: Menu & Stacked Links */}
        <div className="col-span-2 flex flex-col items-start select-none">
          <span className="text-[0.72rem] text-[#888888] mb-1 font-mono font-normal">Menu</span>
          <nav className="flex flex-col font-condensed font-medium text-[1.55rem] leading-[0.95] tracking-tight uppercase">
            <a href="#work" className="hover:opacity-50 transition-opacity">WORK</a>
            <div className="flex items-center gap-1.5 pl-0.5">
              <span className="text-sm font-normal">→</span>
              <a href="#about" className="hover:opacity-50 transition-opacity">ABOUT</a>
            </div>
            <a href="#playground" className="hover:opacity-50 transition-opacity">PLAYGROUND</a>
            <a href="#contact" className="hover:opacity-50 transition-opacity">CONTACT</a>
          </nav>
        </div>

        {/* Cols 5–7: Audio Toggle & Working Globally */}
        <div className="col-span-3 grid grid-cols-3 gap-2 text-[0.72rem] leading-tight items-start">
          <div className="col-span-1">
            <button
              type="button"
              onClick={toggleAudio}
              className="text-left cursor-pointer group"
            >
              <span className="text-[#888888]">Audio </span>
              <span className="font-bold text-[#111111] group-hover:text-[#EE4338] transition-colors">
                {audioOn ? 'On ♫' : 'Off —'}
              </span>
            </button>
          </div>
          <div className="col-span-2 flex flex-col">
            <span className="font-bold text-[#111111]">Multiverse Terminal</span>
            <span className="text-[#888888] font-mono">Neo-Tokyo, {timeStr}</span>
          </div>
        </div>

        {/* Cols 8–11: Personal Traits Statement Block */}
        <div className="col-span-4 flex flex-col font-condensed font-medium text-[clamp(1.2rem,1.55vw,1.65rem)] leading-[1.08] tracking-[-0.01em] text-[#EE4338] uppercase select-none">
          <div>SYNTHESIZER OF VIRTUAL REALMS</div>
          <div>CHIEF DREAM ARCHITECT AT NIGHT</div>
          <div>POWERED BY 90S ANIME & RAMEN</div>
          <div>CONVERSES IN JAVASCRIPT & GLSL</div>
          <div>RETRO MECHA ARTIFACT COLLECTOR</div>
          <div>NEO-TOKYO DRIFT NOVICE</div>
          <div>SEARCHING FOR THE MATRIX...</div>
        </div>

        {/* Col 12: Inquiries Link (Single Horizontal Line, Right-Aligned) */}
        <div className="col-span-1 flex items-start justify-end text-[0.72rem] whitespace-nowrap">
          <span className="text-[#888888]">Sub-Space Signal &nbsp;</span>
          <a
            href="mailto:hello@misaki.dev"
            className="font-bold text-[#111111] underline underline-offset-2 hover:text-[#EE4338] transition-colors"
          >
            hello@misaki.dev
          </a>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MIDDLE ROW (Giant 19, Centerpiece Speech & Avatar, Giant 96)
      ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-12 gap-x-6 items-center w-full my-auto relative select-none overflow-visible">
        
        {/* Cols 1–3: Giant 19 Flush Left */}
        <div className="col-span-3 flex items-center justify-start pointer-events-none select-none">
          <span className="font-giant text-[clamp(15rem,23vw,24rem)] leading-[0.78] tracking-[-0.04em] text-white select-none">
            19
          </span>
        </div>

        {/* Cols 4–7: Centerpiece (Speech Bubble & Animated Avatar) */}
        <div className="col-span-5 hero-centerpiece">
          
          {/* Speech Bubble (Click to toggle open/close) */}
          <div
            onClick={handleToggle}
            className="speech-bubble font-condensed font-medium text-left whitespace-nowrap select-none cursor-pointer outline-none"
            style={{ WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
          >
            <div>
              EVER WONDERED<br />
              WHAT'S GOING ON<br />
              INSIDE MY HEAD?
            </div>
            {/* Small right-pointing triangle tail on right edge near bottom */}
            <div className="absolute -right-2 bottom-[18px] w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-[#111111]" />
          </div>

          {/* Animated Avatar GIF Stack with Interactive Hotspots (Bigger Size & Touchable Items) */}
          <div
            className="avatar-stage relative flex items-center justify-center overflow-visible outline-none"
            style={{ WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
          >
            {/* Idle Closed GIF - always loaded in memory */}
            <img
              src="/assets/avatar_not_open.gif"
              alt="Character Avatar Closed"
              onClick={handleToggle}
              className={`avatar-gif transition-opacity duration-150 ${
                isActive ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
              }`}
              style={{ willChange: 'opacity' }}
            />
            {/* Active Open GIF - always loaded in memory */}
            <img
              src="/assets/avatar_open.gif"
              alt="Character Avatar Open"
              onClick={handleToggle}
              className={`avatar-gif transition-opacity duration-150 ${
                isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
              style={{ willChange: 'opacity' }}
            />

            {/* Interactive Component Touch Targets (Hotspots over floating items when open) */}
            {isActive && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {INTERACTIVE_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedItem(item)
                    }}
                    className="component-hotspot absolute pointer-events-auto cursor-pointer rounded-lg group focus:outline-none"
                    style={{
                      left: `${item.bounds.left}%`,
                      top: `${item.bounds.top}%`,
                      width: `${item.bounds.width}%`,
                      height: `${item.bounds.height}%`,
                    }}
                    title={`Click to view ${item.name}`}
                  >
                    <div className="w-full h-full rounded-md border border-transparent group-hover:border-[#EE4338] group-hover:bg-[#EE4338]/10 group-hover:shadow-[0_0_12px_rgba(238,67,56,0.35)] transition-all flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#111111] text-white font-mono text-[0.62rem] uppercase tracking-wider px-2 py-0.5 rounded whitespace-nowrap shadow-md pointer-events-none -translate-y-5">
                        {item.name} ↗
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cols 8–11: Giant 96 starting at Col 8 with overlaid red AND */}
        <div className="col-span-4 relative flex items-center justify-start pointer-events-none select-none">
          <span
            className="absolute left-0 top-[48%] -translate-y-1/2 z-10 font-condensed font-medium text-[#EE4338] text-[1.55rem] tracking-tight leading-none pointer-events-none"
          >
            AND
          </span>
          <span className="font-giant text-[clamp(15rem,23vw,24rem)] leading-[0.78] tracking-[-0.04em] text-white select-none">
            96
          </span>
        </div>

        {/* Col 12: Empty slot preserving 12-column alignment */}
        <div className="col-span-1" />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM ROW (5 Asymmetric Columns, Zero Divider Line)
      ───────────────────────────────────────────────────────────── */}
      <footer className="grid grid-cols-12 gap-x-6 items-start w-full text-[0.72rem] leading-[1.32] select-none">
        
        {/* Cols 1–2: Awards & Recognitions */}
        <div className="col-span-2 flex flex-col">
          <h3 className="text-[0.72rem] text-[#888888] mb-[14px] font-mono font-normal">
            Awards & Recognitions
          </h3>
          <ul className="space-y-[1px] text-[#111111] font-medium">
            <li>Sector 7 Digital Grand Prix (x4)</li>
            <li>Cyberverse Best in Show — Gold (x3)</li>
            <li>Quantum Webby Nominee (x2)</li>
            <li>Interdimensional Design Trophy (x2)</li>
            <li>Neo-Interface of the Orbit (x4)</li>
            <li>Holo-Grid Site of the Solar Cycle (x13)</li>
            <li>Subpixel Architecture Laureate (x2)</li>
            <li>Cyborg UI Guild Honor (x14)</li>
            <li>Future Web Archive Prime (x12)</li>
            <li>Multiverse Craft Feature (x17)</li>
            <li>Neo-Tokyo Kinetic Design Medal</li>
            <li>Universal Speculative Arts Award</li>
          </ul>
        </div>

        {/* Cols 3–4: Talk, Interview & Publications */}
        <div className="col-span-2 flex flex-col">
          <h3 className="text-[0.72rem] text-[#888888] mb-[14px] font-mono font-normal">
            Talk, Interview & Publications
          </h3>
          <ul className="space-y-[1px] text-[#111111] font-medium">
            <li>
              <a href="#dispatch" className="underline underline-offset-2 hover:text-[#EE4338]">
                The Neuromancer Dispatch: Spotlight
              </a>
            </li>
            <li className="text-[#111111]">
              Neo-Press Tokyo: Holographic Screen Systems
            </li>
            <li className="text-[#111111]">
              Signals from Dimension Zero | Cycle 2026
            </li>
            <li>
              <a href="#mecha-type" className="underline underline-offset-2 hover:text-[#EE4338]">
                Cyber-Chronicles: Mecha Typography
              </a>
            </li>
            <li>
              <a href="#frequency" className="underline underline-offset-2 hover:text-[#EE4338]">
                Orbital Frequency 108.4: Soundscapes
              </a>
            </li>
            <li>
              <a href="#neural-ui" className="underline underline-offset-2 hover:text-[#EE4338]">
                Ghost in the Machine: Neural UI Case Study
              </a>
            </li>
            <li>
              <a href="#shaders" className="underline underline-offset-2 hover:text-[#EE4338]">
                Procedural Dreams & GLSL Shaders Vol. 4
              </a>
            </li>
            <li>
              <a href="#multitimeline" className="underline underline-offset-2 hover:text-[#EE4338]">
                Silicon & Stardust: Multi-Timeline Web
              </a>
            </li>
            <li>
              <a href="#anthropology" className="underline underline-offset-2 hover:text-[#EE4338]">
                Cyber-Anthropology Journal: Issue #42
              </a>
            </li>
            <li>
              <a href="#infinite-canvas" className="underline underline-offset-2 hover:text-[#EE4338]">
                Sub-Space Radio | Infinite Canvas Protocol
              </a>
            </li>
          </ul>
        </div>

        {/* Cols 5–7: Capabilities */}
        <div className="col-span-3 flex flex-col">
          <h3 className="text-[0.72rem] text-[#888888] mb-[14px] font-mono font-normal">
            Capabilities
          </h3>
          <ul className="space-y-[1px] text-[#111111] font-medium">
            <li>Quantum Interface Architecture</li>
            <li>Procedural 3D Worldbuilding</li>
            <li>Neural Motion Graphics</li>
            <li>Holographic Storytelling</li>
            <li>Subpixel Kinetic Typography</li>
            <li>Zero-G Micro-Interactions</li>
            <li>Speculative Web Experiences</li>
          </ul>
          <div className="mt-3">
            <a
              href="#protocol"
              className="underline underline-offset-2 font-medium text-[#111111] hover:text-[#EE4338] transition-colors"
            >
              Exploration Protocol & Lore →
            </a>
          </div>
        </div>

        {/* Cols 8–11: Manifesto Statement (Constrained to max-width: 430px) */}
        <div className="col-span-4 flex flex-col">
          <p className="font-condensed font-medium text-[clamp(1.2rem,1.55vw,1.65rem)] leading-[1.08] tracking-[-0.01em] text-[#EE4338] uppercase select-none max-w-[430px]">
            CRAFTING UNREAL DIGITAL REALMS WITH RELENTLESS IMAGINATION, CODE POETRY, AND BOLD EXPERIMENTS FOR EXPLORERS, TIME TRAVELERS, AND DIGITAL DREAMERS ACROSS THE MULTIVERSE SINCE 2018.
          </p>
        </div>

        {/* Col 12: Trusted by (Right edge) */}
        <div className="col-span-1 flex flex-col">
          <h3 className="text-[0.72rem] text-[#888888] mb-[14px] font-mono font-normal">
            Allied Guilds
          </h3>
          <ul className="space-y-[1px] text-[#111111] font-medium leading-[1.32]">
            <li>Cyberdyne Syndicate</li>
            <li>NerveGear Labs</li>
            <li>Acro-Digital Corp</li>
            <li>Orbital Dynamics</li>
            <li>Capsule Systems</li>
            <li>MishMash Studios</li>
            <li>Voxel Collective</li>
            <li>Neo-Arcadia</li>
            <li>Ghost Shell Co</li>
            <li>Starbound Media</li>
            <li>Dreamweaver AI</li>
            <li className="text-[#888888]">and parallel worlds</li>
          </ul>
        </div>

      </footer>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: SHOWCASE INTERACTIVE COMPONENT / LAPTOP IMAGE
      ───────────────────────────────────────────────────────────── */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#E8E8E8] border-2 border-[#111111] max-w-xl w-full p-6 text-[#111111] shadow-[10px_10px_0px_#111111] relative select-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#111111]/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.7rem] uppercase text-[#888888] tracking-widest">
                  ITEM // {selectedItem.id.toUpperCase()}
                </span>
                {selectedItem.id === 'laptop' && (
                  <span className="bg-[#EE4338] text-white font-mono text-[0.62rem] uppercase px-1.5 py-0.5 rounded-sm font-semibold">
                    PRIMARY RIG
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="font-mono text-xs font-bold hover:text-[#EE4338] transition-colors p-1 uppercase"
              >
                ✕ [ESC]
              </button>
            </div>

            {/* Title & Subtitle */}
            <h2 className="font-condensed font-medium text-[2.2rem] leading-none text-[#EE4338] uppercase">
              {selectedItem.title}
            </h2>
            <p className="font-mono text-[0.78rem] text-[#555555] uppercase tracking-wide mt-1 mb-4">
              {selectedItem.subtitle}
            </p>

            {/* Main Image Display (Bigger Size!) */}
            <div className="bg-white border border-[#111111] p-6 flex items-center justify-center min-h-[260px] max-h-[340px] relative overflow-hidden rounded-sm mb-4">
              <img
                src={selectedItem.id === 'laptop' && customLaptopImg ? customLaptopImg : selectedItem.image}
                alt={selectedItem.name}
                className="max-h-[250px] max-w-full object-contain select-none"
              />
            </div>

            {/* Laptop Customizer Upload Option */}
            {selectedItem.id === 'laptop' && (
              <div className="bg-white/70 border border-[#111111]/30 p-3 rounded-sm mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex flex-col text-left">
                  <span className="font-bold text-[#111111]">Customize Cyber Rig:</span>
                  <span className="text-[#666666] text-[0.72rem]">Mount custom workstation photo or schematic into terminal</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-[#111111] text-white hover:bg-[#EE4338] transition-colors font-mono text-[0.7rem] uppercase font-bold px-3 py-1.5 rounded-sm whitespace-nowrap">
                    📁 Load Schematics
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLaptopImageUpload}
                    />
                  </label>
                  {customLaptopImg && (
                    <button
                      type="button"
                      onClick={handleResetLaptopImage}
                      className="border border-[#111111] hover:bg-[#EE4338] hover:text-white hover:border-[#EE4338] transition-colors font-mono text-[0.7rem] uppercase px-2.5 py-1.5 rounded-sm whitespace-nowrap"
                    >
                      ↺ Default
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-[0.82rem] leading-relaxed text-[#333333] mb-5">
              {selectedItem.desc}
            </p>

            {/* Footer button */}
            <div className="flex items-center justify-end border-t border-[#111111]/20 pt-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="bg-[#111111] text-white hover:bg-[#EE4338] transition-colors font-condensed font-medium text-[1.1rem] uppercase px-5 py-1.5 tracking-wide rounded-sm cursor-pointer"
              >
                CLOSE ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

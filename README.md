# 🧠 MISAKI® Multiverse Terminal & Interactive Avatar

A responsive, high-craft **Swiss Brutalist / Speculative Creative Terminal** featuring an interactive **"Mind-Blown" animated character centerpiece** with touchable floating components and 100% original fictional universe lore.

Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**, accompanied by custom Python image processing tools for transparent animated GIF generation.

---

## ✨ Features

### 1. 📐 Swiss Brutalist Editorial Grid (`100vh`)
- **Full Viewport Fit**: Designed to fit completely within a single desktop screen (`height: 100vh; overflow: hidden;`) without vertical scrollbars or cut-offs.
- **Strict 12-Column CSS Grid**: Consistent alignment across Header, Hero Centerpiece, and Footer:
  - **Cols 1–2**: Rotated vertical logo (`MISAKI®`) with metadata (`grid 07 neo-tokyo` & `system est. 2026`) | Giant `20` (Customizable) | Awards & Recognitions.
  - **Cols 3–4**: Navigation menu (`WORK`, `→ ABOUT`, `PLAYGROUND`, `CONTACT`) | Transmissions & Publications.
  - **Cols 5–7**: Audio synthesizer toggle (`Audio Off —`) & Dynamic Neo-Tokyo Clock (`Neo-Tokyo, 11:08`) | Capabilities list.
  - **Cols 8–11**: Fictional traits block (`SYNTHESIZER OF VIRTUAL REALMS...`) | Giant `26` with overlaid red `AND` | Multiverse Manifesto.
  - **Col 12**: Sub-Space Signal link (`hello@misaki.dev`) | Allied Guilds list.
- **Pure Flat Aesthetics**: Zero drop shadows, zero border dividers, completely flat brutalist look.

### 2. 🧢 Interactive Avatar Centerpiece (Enlarged)
- **Prominent Scale**: Enlarged hero avatar stage (`clamp(520px, 64vh, 740px)`) giving commanding presence while preserving single-screen `100vh` viewport budget.
- **Closed Idle State (`avatar_not_open.gif`)**:
  - The character wears a snapback cap firmly on his head.
  - Natural breathing sway and procedural eye blinks.
- **Open "Mind-Blown" State (`avatar_open.gif`)**:
  - Pop off the cap to reveal an open skull with burst lines and confetti.
  - **Continuous Levitation Loop**: All 10 idea components and the cap float and pulse in a seamless, infinite loop.
  - **User-Controlled (Never Auto-Closes)**: Stays open indefinitely until explicitly clicked again.
- **Zero-Blink Toggle**: Preloaded dual-layer architecture in React ensures instantaneous transitions with zero network flicker or cache-busting delay.
- **Repaired Artwork**:
  - Reconstructed smooth skull rim via cubic spline interpolation (eliminating jagged notches and spikes).
  - Reconstructed floating paper with a smooth, closed curved bottom edge and zero stray skull fragments.

### 3. 💻 Touchable & Interactive Components & Numbers
- **Customizable Hero Numbers**: Click either the left (`20`) or right (`26`) giant number to change it to any year or digit code you desire (persists in `localStorage`).
- **Hover Micro-Interactions**: Hovering over any floating item shows an indicator ring and tooltip tag (e.g. `CYBER RIG ↗`, `SYNAPSE SPARK ↗`).
- **Showcase Modal**: Clicking any floating component opens a Swiss brutalist modal with detailed specifications and high-resolution artwork.
- **Custom Cyber Rig Showcase**:
  - Click **`📁 Load Schematics`** inside the modal to upload your custom workstation photo or schematics right from your disk (instantly stored in `localStorage`).
  - Alternatively, place an image at `public/assets/my_laptop.png`.
  - Includes a quick **`↺ Default`** button to return to the default illustration.

### 4. 🔊 Tactile Audio & Real-Time Clock
- **Web Audio API**: Built-in sound synthesizer generating subtle sine-wave click frequencies (520Hz / 320Hz) when toggling states or audio.
- **Real-Time Clock**: Live dynamic time formatted for Neo-Tokyo (`UTC+9`).

---

## 🎨 Color Palette & Typography

| Token | Value | Description |
|---|---|---|
| **Background** | `#E8E8E8` | Cool editorial paper gray |
| **Primary Text** | `#111111` | Deep brutalist black |
| **Accent / Bio** | `#EE4338` | Coral red-orange highlight |
| **Muted Labels** | `#888888` | Metadata and section subtitles |
| **Giant Numbers** | `#FFFFFF` | Oversized white background digits (`20` and `26`, customizable) |

- **Display & Navigation Font**: `'Barlow Semi Condensed'` / `'Archivo Narrow'` (Weight: 500)
- **Giant Numbers & Body Font**: `'Inter'` / `'Helvetica Neue'` (Bold 700 for numbers, Medium for lists)

---

## 🗂️ Project Structure

```text
Animated/
├── Components/                       # Master source assets & coordinate catalog
│   ├── 01_character.png              # Repaired base character layer
│   ├── 02_floating_cap.png           # Snapback cap layer
│   ├── 03_laptop.png                 # Laptop illustration layer
│   ├── 04_lightbulb.png to 14_*.png  # Individual component illustrations & bursts
│   ├── components_metadata.json      # Coordinate bounds & dimension catalog
│   ├── avatar_not_open.gif           # Archive copy of closed state GIF
│   └── avatar_open.gif               # Archive copy of open state GIF
│
├── public/                           # Assets served directly by Vite
│   ├── assets/
│   │   ├── avatar_not_open.gif       # Active closed animation (40 frames)
│   │   ├── avatar_not_open.webp      # WebP alternative
│   │   ├── avatar_open.gif           # Active open continuous loop (48 frames)
│   │   ├── avatar_open.webp          # WebP alternative
│   │   └── my_laptop.png             # Laptop showcase image (customizable)
│   ├── components/                   # High-res item illustrations for modals
│   ├── favicon.svg                   # Site favicon
│   └── icons.svg                     # Vector definitions
│
├── src/
│   ├── App.tsx                       # Main portfolio application & interactive avatar
│   ├── index.css                     # Tailwind CSS v4, layout rules, and avatar stage
│   └── main.tsx                      # Application mounting script
│
├── create_separate_gifs.py           # Python generator script for the transparent GIFs
├── index.html                        # HTML entry point
├── package.json                      # Dependencies and npm scripts
├── tsconfig.json                     # TypeScript configuration
└── vite.config.ts                    # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (or `pnpm` / `yarn`)
- **Python 3.10+** (optional, only needed if you wish to re-render the animated GIFs from scratch)

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd C:\TrainAi\Animated
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open your browser to **`http://localhost:5174/`** (or the port displayed in your terminal).

4. Build for production:
   ```bash
   npm run build
   ```
   The optimized production bundle will be output to the `dist/` folder.

---

## 🛠️ Animation Generator (Optional)

The transparent animated GIFs are compiled using **`create_separate_gifs.py`** with OpenCV and Pillow:

```bash
python create_separate_gifs.py
```

This will automatically re-render and synchronize:
- `avatar_not_open.gif` (2.0s closed idle cycle with natural blinks)
- `avatar_open.gif` (2.4s infinite open levitation loop with burst particles)

across all relevant directories (`public/assets/`, `Components/`).

---

## 📝 Customization Guide

1. **Change the Laptop Photo**:
   - In the browser: Click the speech bubble or avatar to open his head, click the floating **Laptop**, and use the **`📁 Choose Photo`** button.
   - Or in the codebase: Replace [public/assets/my_laptop.png](file:///C:/TrainAi/Animated/public/assets/my_laptop.png) with your own PNG or JPG.
2. **Adjust Avatar Size**:
   - In [src/index.css](file:///C:/TrainAi/Animated/src/index.css), tweak `.avatar-stage`:
     ```css
     .avatar-stage {
       height: clamp(430px, 54vh, 600px);
     }
     ```
3. **Add or Edit Portfolio Content**:
   - Open [src/App.tsx](file:///C:/TrainAi/Animated/src/App.tsx) and update personal traits, menu links, awards, talks, and client rosters.

---

## 📄 License

MIT License © 2026. All assets extracted and crafted for portfolio presentation.

export const heritageTheme = Object.freeze({
  name: "Heritage Modern Dark",
  colors: Object.freeze({
    primaryRed: "#9E1B1B",
    primaryRedDark: "#6E1010",
    accentGold: "#D4AF37",
    accentGoldLight: "#F3E5AB",
    bronze: "#8C6D46",
    bgDark: "#030712",
    bgCard: "rgba(15, 23, 42, 0.8)",
    bgGlass: "rgba(255, 255, 255, 0.06)",
    borderGlass: "rgba(245, 158, 11, 0.35)",
    textPrimary: "#FAFAFA",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
  }),
  typography: Object.freeze({
    fontFamilyHeading: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFamilySerif: "'Cinzel', Georgia, serif",
    fontFamilyBody:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFamilyMono: "'Space Grotesk', monospace",
    sizes: Object.freeze({
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      h3: "1.5rem",
      h2: "2.25rem",
      h1: "3.25rem",
    }),
  }),
  glassmorphism: Object.freeze({
    backdropFilter: "blur(20px)",
    background: "rgba(15, 23, 42, 0.78)",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
  }),
  animations: Object.freeze({
    transitionFast: "all 0.15s ease-in-out",
    transitionNormal: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    transitionSlow: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
    pulseGlow: "pulseAura 4s ease-in-out infinite",
  }),
  breakpoints: Object.freeze({
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  }),
} as const);

export type HeritageTheme = typeof heritageTheme;

export function injectHeritageGlobalStyles(): string {
  return `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    
    <!-- Lenis Smooth Scroll Library -->
    <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js"></script>

    <!-- GSAP & ScrollTrigger Animation Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              heading: ['Montserrat', '-apple-system', 'sans-serif'],
              sans: ['Plus Jakarta Sans', '-apple-system', 'sans-serif'],
              mono: ['Space Grotesk', 'monospace'],
            },
            colors: {
              cyber: {
                dark: '#030712',
                card: 'rgba(15, 23, 42, 0.8)',
                gold: '#fbbf24',
                amber: '#f59e0b',
                bronze: '#d4af37',
                crimson: '#9f1239',
                cyan: '#06b6d4',
                emerald: '#10b981',
              }
            }
          }
        }
      }
    </script>
    <style>
      :root {
        --font-heading: 'Montserrat', -apple-system, sans-serif;
        --font-body: 'Plus Jakarta Sans', -apple-system, sans-serif;
        --font-mono: 'Space Grotesk', monospace;
      }
      
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      html {
        scroll-behavior: auto !important;
      }

      /* Authentic Vietnamese Cyber-Heritage Background Pattern */
      body {
        font-family: var(--font-body);
        background-color: #030712;
        color: #f8fafc;
        background-image: 
          /* Bronze Drum Starburst Radial Rays */
          radial-gradient(circle at 50% 25%, rgba(245, 158, 11, 0.16) 0%, rgba(159, 18, 57, 0.1) 35%, transparent 70%),
          radial-gradient(circle at 85% 85%, rgba(6, 182, 212, 0.12) 0%, transparent 65%),
          radial-gradient(circle at 15% 75%, rgba(212, 175, 55, 0.1) 0%, transparent 60%),
          /* Cybernetic Heritage Grid Lines */
          linear-gradient(rgba(245, 158, 11, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(245, 158, 11, 0.035) 1px, transparent 1px);
        background-size: 100% 100%, 100% 100%, 100% 100%, 48px 48px, 48px 48px;
        background-attachment: fixed;
        overflow-x: hidden;
        perspective: 1200px;
      }

      /* Hyper Legible & Beautiful Typography Classes */
      h1, h2, h3, h4, h5, h6, .font-heading {
        font-family: var(--font-heading) !important;
        letter-spacing: -0.02em;
        font-weight: 800;
      }

      p, span, div, a, button, input, select, textarea {
        font-family: var(--font-body);
        line-height: 1.6;
      }

      code, pre, .font-mono {
        font-family: var(--font-mono) !important;
      }

      /* Royal Cyber Gradient Text */
      .gradient-title-cyber {
        background: linear-gradient(135deg, #ffffff 0%, #fef08a 25%, #f59e0b 65%, #f43f5e 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientShift 6s ease infinite;
        filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.35));
      }

      .gradient-cyan-emerald {
        background: linear-gradient(135deg, #e0f2fe 0%, #38bdf8 40%, #10b981 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      @keyframes float3D {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(1deg); }
      }

      @keyframes spinSlow {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes pulseAura {
        0%, 100% { box-shadow: 0 0 25px rgba(245, 158, 11, 0.3), 0 0 50px rgba(159, 18, 57, 0.2); }
        50% { box-shadow: 0 0 45px rgba(245, 158, 11, 0.65), 0 0 80px rgba(6, 182, 212, 0.35); }
      }

      .animate-float-3d {
        animation: float3D 5s ease-in-out infinite;
      }

      .animate-spin-slow {
        animation: spinSlow 40s linear infinite;
      }

      .animate-aura-pulse {
        animation: pulseAura 4s ease-in-out infinite;
      }

      /* High-Detail Cyber Glassmorphism Cards */
      .glass-futuristic {
        background: rgba(15, 23, 42, 0.82);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(245, 158, 11, 0.3);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.4s ease, box-shadow 0.4s ease;
        position: relative;
        overflow: hidden;
      }

      .glass-futuristic::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
          45deg,
          transparent 45%,
          rgba(254, 240, 138, 0.12) 50%,
          transparent 55%
        );
        transform: rotate(30deg);
        transition: all 0.8s ease;
        opacity: 0;
        pointer-events: none;
      }

      .glass-futuristic:hover::before {
        opacity: 1;
        transform: rotate(30deg) translate(35%, 35%);
      }

      .glass-futuristic:hover {
        border-color: rgba(245, 158, 11, 0.85);
        box-shadow: 0 0 40px rgba(245, 158, 11, 0.35), 0 30px 70px rgba(0, 0, 0, 0.85);
        transform: translateY(-8px) scale(1.018);
      }

      .glass-nav-cyber {
        background: rgba(3, 7, 18, 0.85);
        backdrop-filter: blur(28px);
        -webkit-backdrop-filter: blur(28px);
        border: 1px solid rgba(245, 158, 11, 0.25);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.15);
      }

      /* Full-Screen Mobile Hamburger Overlay Drawer Slide-In */
      #mobile-hamburger-overlay.open {
        transform: translateX(0) !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      .btn-cyber-gold {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #b45309 100%);
        color: #030712;
        font-family: var(--font-heading);
        font-weight: 800;
        letter-spacing: 0.5px;
        box-shadow: 0 0 25px rgba(245, 158, 11, 0.45);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        overflow: hidden;
      }

      .btn-cyber-gold:hover {
        box-shadow: 0 0 45px rgba(245, 158, 11, 0.8), 0 0 75px rgba(245, 158, 11, 0.5);
        transform: translateY(-3px) scale(1.03);
      }

      .btn-cyber-gold:active {
        transform: translateY(0px) scale(0.98);
      }

      /* Respect prefers-reduced-motion */
      @media (prefers-reduced-motion: reduce) {
        .cinematic-scene, [data-scroll-speed], [data-scroll-stagger] {
          transform: none !important;
          opacity: 1 !important;
          animation: none !important;
        }
      }
    </style>

    <!-- Lenis & GSAP ScrollTrigger Motion Engine Script -->
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        function initMotionEngine() {
          if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            setTimeout(initMotionEngine, 100);
            return;
          }

          gsap.registerPlugin(ScrollTrigger);

          // 1. Initialize Lenis Smooth Inertia Scroll
          if (typeof Lenis !== 'undefined') {
            const lenis = new Lenis({
              duration: 1.2,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              smoothWheel: true,
              touchMultiplier: 1.5,
            });

            function raf(time) {
              lenis.raf(time);
              requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);

            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
              lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
          }

          // 2. Cinematic Section-to-Section Scene Transitions (Reversible 1:1 Scrub)
          const sections = document.querySelectorAll('section, main > div, .cinematic-scene');
          sections.forEach((section, index) => {
            if (section.offsetHeight < 120) return;

            section.classList.add('cinematic-scene');

            const headings = section.querySelectorAll('h1, h2, .gradient-title-cyber');
            const paragraphs = section.querySelectorAll('p, .text-slate-300, .text-slate-400');
            const cards = section.querySelectorAll('.glass-futuristic, .spatial-3d-experience-container, form');
            const buttons = section.querySelectorAll('.btn-cyber-gold, button, a.btn-cyber-gold');

            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                end: 'top 30%',
                scrub: 1,
              },
            });

            if (headings.length) {
              timeline.fromTo(headings, { y: 60, opacity: 0, scale: 0.95, rotateX: 6 }, { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 1, ease: 'power3.out' }, 0);
            }
            if (paragraphs.length) {
              timeline.fromTo(paragraphs, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.15);
            }
            if (cards.length) {
              timeline.fromTo(cards, { y: 50, opacity: 0, scale: 0.96, rotateX: 8 }, { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 1.1, stagger: 0.15, ease: 'power3.out' }, 0.25);
            }
            if (buttons.length) {
              timeline.fromTo(buttons, { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.5)' }, 0.35);
            }

            if (index < sections.length - 1) {
              gsap.to(section, {
                scale: 0.92,
                opacity: 0.2,
                rotateX: -7,
                y: -40,
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'bottom 70%',
                  end: 'bottom top',
                  scrub: 1,
                },
              });
            }
          });

          // 3. Parallax Layers for Background / Foreground Elements
          const parallaxElements = document.querySelectorAll('[data-scroll-speed]');
          parallaxElements.forEach((el) => {
            const speed = parseFloat(el.getAttribute('data-scroll-speed') || '0.25');
            gsap.to(el, {
              y: -120 * speed,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            });
          });
        }

        initMotionEngine();
      });
    </script>
  `.trim();
}

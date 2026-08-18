export const heritageTheme = Object.freeze({
  name: "Heritage Modern Dark",
  colors: Object.freeze({
    primaryRed: "#9E1B1B",
    primaryRedDark: "#6E1010",
    accentGold: "#D4AF37",
    accentGoldLight: "#F3E5AB",
    bronze: "#8C6D46",
    bgDark: "#121212",
    bgCard: "#1E1E1E",
    bgGlass: "rgba(255, 255, 255, 0.06)",
    borderGlass: "rgba(212, 175, 55, 0.2)",
    textPrimary: "#FAFAFA",
    textSecondary: "#B0B0B0",
    textMuted: "#757575",
  }),
  typography: Object.freeze({
    fontFamilyHeading: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
      h2: "2rem",
      h1: "2.75rem",
    }),
  }),
  glassmorphism: Object.freeze({
    backdropFilter: "blur(12px)",
    background: "rgba(30, 30, 30, 0.75)",
    border: "1px solid rgba(212, 175, 55, 0.25)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  }),
  animations: Object.freeze({
    transitionFast: "all 0.15s ease-in-out",
    transitionNormal: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transitionSlow: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    pulseGlow: "pulse 2s infinite ease-in-out",
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
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    
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
              heading: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
              sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
              mono: ['Space Grotesk', 'monospace'],
            },
            colors: {
              cyber: {
                dark: '#030712',
                card: 'rgba(15, 23, 42, 0.75)',
                gold: '#fbbf24',
                amber: '#f59e0b',
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
        --font-heading: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        --font-mono: 'Space Grotesk', monospace;
      }
      
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      html {
        scroll-behavior: auto !important; /* Lenis handles smooth scrolling */
      }

      body {
        font-family: var(--font-body);
        background-color: #030712;
        color: #f8fafc;
        background-image: 
          radial-gradient(ellipse at 20% 10%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 60%, rgba(159, 18, 57, 0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 90%, rgba(6, 182, 212, 0.12) 0%, transparent 60%);
        background-attachment: fixed;
        overflow-x: hidden;
        perspective: 1200px;
      }

      /* Unified Typography Classes */
      h1, h2, h3, h4, h5, h6, .font-heading {
        font-family: var(--font-heading) !important;
        letter-spacing: -0.02em;
      }

      p, span, div, a, button, input, select, textarea {
        font-family: var(--font-body);
      }

      code, pre, .font-mono {
        font-family: var(--font-mono) !important;
      }

      /* Motion Sites Cinematic Scroll & Masking Styles */
      .cinematic-scene {
        transform-style: preserve-3d;
        will-change: transform, opacity, clip-path;
        backface-visibility: hidden;
      }

      .clip-curtain-vault {
        clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
      }

      /* Animated Gradient Text */
      .gradient-title-cyber {
        background: linear-gradient(135deg, #ffffff 0%, #fef08a 35%, #f59e0b 70%, #f43f5e 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientShift 6s ease infinite;
      }

      .gradient-cyan-emerald {
        background: linear-gradient(135deg, #a5f3fc 0%, #06b6d4 50%, #10b981 100%);
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
        50% { transform: translateY(-12px) rotate(1deg); }
      }

      @keyframes pulseAura {
        0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.25), 0 0 40px rgba(159, 18, 57, 0.15); }
        50% { box-shadow: 0 0 35px rgba(245, 158, 11, 0.5), 0 0 70px rgba(6, 182, 212, 0.3); }
      }

      .animate-float-3d {
        animation: float3D 5s ease-in-out infinite;
      }

      .animate-aura-pulse {
        animation: pulseAura 4s ease-in-out infinite;
      }

      /* Ultra Futuristic Glassmorphism Card */
      .glass-futuristic {
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(245, 158, 11, 0.25);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
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
          rgba(255, 255, 255, 0.08) 50%,
          transparent 55%
        );
        transform: rotate(30deg);
        transition: all 0.7s ease;
        opacity: 0;
        pointer-events: none;
      }

      .glass-futuristic:hover::before {
        opacity: 1;
        transform: rotate(30deg) translate(30%, 30%);
      }

      .glass-futuristic:hover {
        border-color: rgba(245, 158, 11, 0.8);
        box-shadow: 0 0 35px rgba(245, 158, 11, 0.25), 0 25px 60px rgba(0, 0, 0, 0.8);
        transform: translateY(-8px) scale(1.015);
      }

      .glass-nav-cyber {
        background: rgba(3, 7, 18, 0.88);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-bottom: 1px solid rgba(245, 158, 11, 0.25);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
      }

      .btn-cyber-gold {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
        color: #030712;
        font-family: var(--font-heading);
        font-weight: 700;
        letter-spacing: 0.5px;
        box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        overflow: hidden;
      }

      .btn-cyber-gold:hover {
        box-shadow: 0 0 35px rgba(245, 158, 11, 0.7), 0 0 60px rgba(245, 158, 11, 0.4);
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

            // Staggered entry elements inside each scene
            const headings = section.querySelectorAll('h1, h2, .gradient-title-cyber');
            const paragraphs = section.querySelectorAll('p, .text-slate-300, .text-slate-400');
            const cards = section.querySelectorAll('.glass-futuristic, .spatial-3d-experience-container, form');
            const buttons = section.querySelectorAll('.btn-cyber-gold, button, a.btn-cyber-gold');

            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                end: 'top 30%',
                scrub: 1, // Reversible smooth scrub
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

            // Scene Exit 3D Depth Recede Effect as user scrolls past
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

          // 3. Parallax Foreground & Background Speed Offset
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

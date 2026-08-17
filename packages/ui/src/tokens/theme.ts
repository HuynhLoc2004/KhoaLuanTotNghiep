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
    fontFamilyHeading: "'Outfit', 'Cinzel', 'Roboto', sans-serif",
    fontFamilyBody: "'Inter', 'Roboto', sans-serif",
    sizes: Object.freeze({
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      h3: "1.75rem",
      h2: "2.25rem",
      h1: "3rem",
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

export function injectHeritageGlobalStyles(): string {
  return `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              museum: {
                dark: '#080c14',
                card: '#0f172a',
                gold: '#e5c158',
                goldLight: '#fef08a',
                crimson: '#7e0e1b',
                bronze: '#92400e',
                jade: '#059669',
              }
            }
          }
        }
      }
    </script>
    <style>
      :root {
        --font-heading: 'Outfit', 'Cinzel', sans-serif;
        --font-body: 'Plus Jakarta Sans', sans-serif;
      }
      body {
        font-family: var(--font-body);
        background-color: #080c14;
        color: #f8fafc;
        background-image: 
          radial-gradient(at 15% 15%, rgba(126, 14, 27, 0.15) 0px, transparent 50%),
          radial-gradient(at 85% 85%, rgba(229, 193, 88, 0.1) 0px, transparent 50%);
        background-attachment: fixed;
      }
      h1, h2, h3, h4, .font-heading {
        font-family: var(--font-heading);
      }
      @keyframes floatSlow {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 15px rgba(229, 193, 88, 0.2), 0 0 30px rgba(126, 14, 27, 0.1); }
        50% { box-shadow: 0 0 25px rgba(229, 193, 88, 0.4), 0 0 50px rgba(126, 14, 27, 0.25); }
      }
      @keyframes shimmerGold {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .animate-float {
        animation: floatSlow 4s ease-in-out infinite;
      }
      .animate-pulse-glow {
        animation: pulseGlow 3s ease-in-out infinite;
      }
      .shimmer-gold-text {
        background: linear-gradient(90deg, #e5c158 0%, #fef08a 50%, #e5c158 100%);
        background-size: 200% auto;
        color: transparent;
        -webkit-background-clip: text;
        animation: shimmerGold 4s linear infinite;
      }
      .glass-card {
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(229, 193, 88, 0.2);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .glass-card:hover {
        border-color: rgba(229, 193, 88, 0.6);
        box-shadow: 0 12px 40px 0 rgba(229, 193, 88, 0.15);
        transform: translateY(-4px);
      }
      .glass-nav {
        background: rgba(8, 12, 20, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(229, 193, 88, 0.2);
      }
    </style>
  `.trim();
}

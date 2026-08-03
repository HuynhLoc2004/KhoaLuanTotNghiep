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

export type HeritageTheme = typeof heritageTheme;

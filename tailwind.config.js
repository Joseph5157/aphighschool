/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--rgb-ink) / <alpha-value>)",
        inkSoft: "rgb(var(--rgb-inkSoft) / <alpha-value>)",
        turmeric: "rgb(var(--rgb-turmeric) / <alpha-value>)",
        turmericDeep: "rgb(var(--rgb-turmericDeep) / <alpha-value>)",
        tamarind: "rgb(var(--rgb-tamarind) / <alpha-value>)",
        tamarindDark: "rgb(var(--rgb-tamarindDark) / <alpha-value>)",
        kumkum: "rgb(var(--rgb-kumkum) / <alpha-value>)",
        paper: "rgb(var(--rgb-paper) / <alpha-value>)",
        paperRaised: "rgb(var(--rgb-paperRaised) / <alpha-value>)",
        hair: "rgb(var(--rgb-hair) / <alpha-value>)",
        masthead: "rgb(var(--rgb-masthead) / <alpha-value>)",
        mastheadText: "rgb(var(--rgb-mastheadText) / <alpha-value>)",
      },
      // The colour token set is deliberately closed (AGENTS.md). `accent` was
      // used for active navigation against a token that exists in neither this
      // config nor Tailwind's default palette, so those states rendered
      // unstyled. It is retired rather than defined: navigation position is
      // chrome and must not borrow a document-status colour. See
      // docs/ui/DESIGN_SYSTEM.md §4.
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        telugu: ["var(--font-noto-telugu)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      // DESIGN_SYSTEM.md §7.2. Tailwind's default scale stops at 50 and has no
      // step between the header and the scrim, which is how the drawer scrim
      // ended up below the bottom tab bar it was meant to disable.
      zIndex: {
        45: "45",
        60: "60",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      // DESIGN_SYSTEM.md §10: motion answers a user action; 200ms for
      // disclosure, ease-out for entrances. `animate-fadeIn` was used in three
      // places with no keyframes defined, so nothing ever animated.
      animation: {
        fadeIn: "fadeIn 200ms ease-out",
      },
    },
  },
  plugins: [],
};

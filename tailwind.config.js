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
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        telugu: ["var(--font-noto-telugu)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

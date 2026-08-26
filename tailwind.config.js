/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        inkSoft: "var(--color-inkSoft)",
        turmeric: "var(--color-turmeric)",
        turmericDeep: "var(--color-turmericDeep)",
        tamarind: "var(--color-tamarind)",
        tamarindDark: "var(--color-tamarindDark)",
        kumkum: "var(--color-kumkum)",
        paper: "var(--color-paper)",
        paperRaised: "var(--color-paperRaised)",
        hair: "var(--color-hair)",
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

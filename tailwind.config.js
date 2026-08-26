/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2A4A",
        inkSoft: "#33456B",
        turmeric: "#E8A33D",
        turmericDeep: "#C7811F",
        tamarind: "#2F6B4F",
        kumkum: "#B5432E",
        paper: "#EDE8DC",
        paperRaised: "#F7F4EC",
        hair: "#D8D2C1",
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

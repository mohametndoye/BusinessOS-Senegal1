/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16213A",
        sand: "#F6F0E2",
        card: "#FFFDF8",
        baobab: "#B5482F",
        gold: "#E4A83B",
        teal: "#0E7C7B",
        charcoal: "#201B16",
        line: "#E4DAC4",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Work Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

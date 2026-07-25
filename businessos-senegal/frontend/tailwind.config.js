/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12131C",
        inkDeep: "#090A10",
        sand: "#F5F6FA",
        card: "#FFFFFF",
        brand: "#4338CA",
        brandDeep: "#332AA3",
        baobab: "#DC2626",
        baobabDeep: "#B91C1C",
        gold: "#C99A3D",
        goldDeep: "#A67D2E",
        teal: "#0F9D74",
        charcoal: "#1A1B26",
        line: "#E4E6EF",
        muted: "#6B7280",
      },
      fontFamily: {
        display: ["Poppins", "Lato", "sans-serif"],
        sans: ["Lato", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(18,19,28,0.04), 0 1px 1px rgba(18,19,28,0.03)",
        card: "0 1px 3px rgba(18,19,28,0.05), 0 8px 24px -12px rgba(18,19,28,0.10)",
        lift: "0 4px 10px rgba(18,19,28,0.07), 0 16px 32px -16px rgba(18,19,28,0.16)",
        glow: "0 8px 30px -8px rgba(67,56,202,0.35)",
        panel: "0 24px 64px -24px rgba(9,10,16,0.35)",
      },
      backgroundImage: {
        "ink-gradient": "linear-gradient(175deg, #1C1E2E 0%, #12131C 55%, #090A10 100%)",
        "gold-gradient": "linear-gradient(135deg, #DDB35C 0%, #C99A3D 55%, #A67D2E 100%)",
        "baobab-gradient": "linear-gradient(135deg, #EF4444 0%, #DC2626 55%, #B91C1C 100%)",
        "brand-gradient": "linear-gradient(135deg, #5B4FE0 0%, #4338CA 55%, #332AA3 100%)",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sol: {
          bg: "#030014", // Deep dark purple/black
          card: "#1a103d", // Dark purple card bg
          primary: "#8A2BE2", // Neon Purple
          secondary: "#4B0082", // Indigo
          accent: "#D8BFD8", // Thistle/Light Purple
          text: "#E6E6FA", // Lavender
        },
        mantle: {
          primary: "#65B3AE",
          secondary: "#1a1a2e",
          accent: "#00D9FF",
          dark: "#0f0f1a",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "conic-gradient(from 180deg at 50% 50%, #2a0e61 0deg, #10002b 55deg, #3c096c 120deg, #030014 160deg, transparent 360deg)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;

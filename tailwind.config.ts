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
          bg: "#000000",
          card: "#09090b", // Modern Black
          primary: "#3b82f6", // Premium Blue
          secondary: "#1d4ed8", // Darker Blue
          accent: "#60a5fa", // Light Blue
          text: "#fafafa", // White
          dark: "#09090b",
        },
        mantle: {
          primary: "#3b82f6", // Unified Blue
          secondary: "#09090b",
          accent: "#60a5fa",
          dark: "#000000",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;

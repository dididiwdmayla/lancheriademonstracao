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
        amarelo: "#FFD93D",
        laranja: "#FF6321",
        tomate: "#ef4444",
        alface: "#4ade80",
        creme: "#FAF7F2",
        "marrom-900": "#1a0f0a",
        "marrom-600": "#3a2215",
      },
      fontFamily: {
        display: ['Impact', '"Arial Black"', 'sans-serif'],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      dropShadow: {
        "hard-brown": "10px 10px 0px #1a0f0a",
      },
    },
  },
  plugins: [],
};

export default config;

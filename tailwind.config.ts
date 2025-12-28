import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a7ea4',
        background: {
          DEFAULT: '#ffffff',
          dark: '#151718',
        },
        surface: {
          DEFAULT: '#f5f5f5',
          dark: '#1e2022',
        },
        foreground: {
          DEFAULT: '#11181C',
          dark: '#ECEDEE',
        },
        muted: {
          DEFAULT: '#687076',
          dark: '#9BA1A6',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#334155',
        },
        success: {
          DEFAULT: '#22C55E',
          dark: '#4ADE80',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#FBBF24',
        },
        error: {
          DEFAULT: '#EF4444',
          dark: '#F87171',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

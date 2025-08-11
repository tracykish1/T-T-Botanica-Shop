import type { Config } from 'tailwindcss'

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#166534", // deep emerald
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#166534",
          800: "#065f46",
          900: "#064e3b"
        },
        forest: "#0b3d2e",
        moss: "#4d7c57",
        blush: "#f5d0e6"
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.06)"
      },
      borderRadius: {
        '2xl': '1rem'
      }
    },
  },
  plugins: [],
} satisfies Config

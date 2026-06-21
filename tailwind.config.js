/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        indigo: {
          900: '#1A1A2E',
          800: '#16213E',
          700: '#0F3460',
        },
        gold: '#E8D5B7',
        alert: '#E94560',
      },
    },
  },
  plugins: [],
};

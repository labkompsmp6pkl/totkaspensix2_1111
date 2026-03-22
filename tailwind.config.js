
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'exam': '1rem',
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#d9e2ff',
          200: '#bac9ff',
          300: '#8da4ff',
          400: '#5973ff',
          500: '#3348ff',
          600: '#1a27ff',
          700: '#141edf',
          800: '#1119b4',
          900: '#0a106d',
          950: '#070a4b',
        },
      },
    },
  },
  plugins: [],
}

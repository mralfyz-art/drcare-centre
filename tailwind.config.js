/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: '#050507',
        charcoal: '#0B0C10',
        leather: '#12141C',
        gold: {
          100: '#FFFDF5',
          200: '#FFF1B8',
          300: '#FFE066',
          400: '#F5C518',
          500: '#D4A017',
          600: '#A67C00'
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Cairo', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Cairo', 'sans-serif'],
        arabic: ['Cairo', 'sans-serif'],
        rupes: ['Montserrat', 'sans-serif'],
        meguiars: ['"Playfair Display"', 'serif']
      }
    },
  },
  plugins: [],
}

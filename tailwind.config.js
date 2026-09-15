/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'board-light': '#F0D9B5',
        'board-dark': '#B58863',
        'board-selected': '#F6F669',
        'board-legal': '#CDD26A',
        'board-last': '#AADE2A',
        'board-check': '#FF0000',
        'nur-gold': '#FFD700',
      },
      fontFamily: {
        'uzbek': ['Segoe UI', 'Tahoma', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

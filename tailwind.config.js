/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-purple': '#D8B4FE',
        'accent-green': '#22C55E',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      letterSpacing: {
        'tightest': '-0.05em',
      },
    },
  },
  plugins: [],
}

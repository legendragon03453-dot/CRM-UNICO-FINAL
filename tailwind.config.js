/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#C90EFF',
          pink: '#EDAFFF',
        },
        studio: {
          bg: '#1E1E24',
          card: '#2A2A35',
          border: '#363645',
          blue: '#3B82F6',
          orange: '#FB923C',
        }
      },
      borderRadius: {
        'luxury': '20px',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif', 'Inter'],
      },
    },
  },
  plugins: [],
}

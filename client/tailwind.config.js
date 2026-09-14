/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#faf8f5',
        cream: '#f5f0e8',
        champagne: '#c9a96e',
        gold: '#b8945a',
        charcoal: '#2c2420',
        warmbrown: '#5c4a3d',
        brand: {
          50: '#faf8f5',
          500: '#c9a96e',
          600: '#b8945a',
          700: '#8c6d3a'
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        playfair: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif']
      }
    }
  },
  plugins: []
};

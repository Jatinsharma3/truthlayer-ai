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
          teal: '#14b8a6',
          darkTeal: '#0f766e',
          accent: '#2dd4bf',
        },
        navy: {
          950: '#030712', // deep gray-black
          900: '#0b0f19', // deep navy
          800: '#111827', // dark slate
          700: '#1f2937', // medium slate
          600: '#374151',
          500: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}

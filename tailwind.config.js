/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#ccfbf1', // teal-100
          DEFAULT: '#14b8a6', // teal-500
          dark: '#0f766e'   // teal-700
        },
        secondary: {
          light: '#f1f5f9', // slate-100
          DEFAULT: '#64748b', // slate-500
          dark: '#334155'   // slate-700
        },
        accent: {
          light: '#fef3c7', // amber-100
          DEFAULT: '#f59e0b', // amber-500
          dark: '#b45309'    // amber-700
        },
      },
    },
  },
  plugins: [],
} 
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006eb6',
          dark: '#005a94',
          light: '#3d9fd8'
        },
        accent: {
          DEFAULT: '#eeae18',
          dark: '#d49a0e',
          light: '#f5c84d'
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

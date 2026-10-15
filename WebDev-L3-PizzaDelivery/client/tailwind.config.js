/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E63946',
        secondary: '#F4A261',
        background: '#FFFCF2',
        text: '#1A1A2E',
        adminAccent: '#2B2D42'
      }
    },
  },
  plugins: [],
}

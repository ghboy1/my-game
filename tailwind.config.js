/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
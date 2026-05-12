/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: '#071B2A',
        neon: '#5BE12C',
        deepblue: '#0C3B66',
        glass: 'rgba(255,255,255,0.06)'
      },
      fontFamily: {
        poppins: ['Poppins', 'Inter', 'ui-sans-serif']
      },
      boxShadow: {
        glass: '0 6px 24px rgba(7,27,42,0.6), 0 1px 0 rgba(91,225,44,0.06)'
      }
    },
  },
  plugins: [],
}

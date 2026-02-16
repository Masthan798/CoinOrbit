/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'card': 'var(--bg-card)',
        'main': 'var(--bg-main)',
        'section': 'var(--bg-section)',
        'hover-soft': 'var(--hover-soft)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

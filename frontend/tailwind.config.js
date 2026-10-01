/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          ivory: '#F9F3CF',
          cream: '#EDE7CF',
          sand: '#DDBC89',
          terracotta: '#AA512F',
          dark: '#3A1F13',
          surface: '#FAF7EA',
          card: '#FFFFFF',
          border: '#E4D5BC'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 8px 30px rgba(170, 81, 47, 0.08)',
        'warm-lg': '0 14px 40px rgba(170, 81, 47, 0.12)',
        'counter': '0 4px 20px -2px rgba(90, 45, 20, 0.06)'
      }
    },
  },
  plugins: [],
}

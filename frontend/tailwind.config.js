/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080C14',
          surface: '#0D1527',
          card: '#111B32',
          cardHover: '#162340',
          border: '#1E2F52',
          borderGlow: '#06B6D4',
          cyan: '#06B6D4',
          cyanLight: '#22D3EE',
          blue: '#3B82F6',
          blueDeep: '#1D4ED8',
          textMuted: '#94A3B8',
          textDim: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'Noto Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 25px -2px rgba(6, 182, 212, 0.45)',
        'neon-blue': '0 0 25px -2px rgba(59, 130, 246, 0.45)',
        'neon-pulse': '0 0 35px 2px rgba(6, 182, 212, 0.3)',
        'cyber-card': '0 10px 40px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(34, 211, 238, 0.15)',
        'cyber-card-active': '0 10px 40px -10px rgba(6, 182, 212, 0.25), 0 0 2px 1.5px rgba(6, 182, 212, 0.5)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-mesh': 'radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.12) 0px, transparent 50%)'
      }
    },
  },
  plugins: [],
}

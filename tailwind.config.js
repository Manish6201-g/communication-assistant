/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070B12',
          900: '#0B1220',
          850: '#0E1726',
          800: '#142138',
          700: '#1E2D4A',
          600: '#2A3C60',
          500: '#3D547F',
          400: '#5C74A3',
          300: '#8FA3C7',
          200: '#C2D1E8',
          100: '#E4EDF8',
        },
        brand: {
          cyan: '#38BDF8',
          teal: '#2DD4BF',
          emerald: '#10B981',
          coral: '#F43F5E',
          amber: '#F59E0B',
          indigo: '#6366F1',
          blue: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'stream': 'stream 2s linear infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        stream: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}

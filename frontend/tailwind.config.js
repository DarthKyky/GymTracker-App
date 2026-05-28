/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        carbon: {
          950: '#0a0a0b',
          900: '#111113',
          800: '#1a1a1e',
          700: '#242429',
          600: '#2e2e35',
          500: '#3d3d46',
        },
        volt: {
          400: '#d4ff00',
          500: '#bce600',
          600: '#a3cc00',
        },
        steel: {
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

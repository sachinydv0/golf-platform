/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6fff3',
          100: '#b3ffe0',
          200: '#66ffcc',
          300: '#00ffaa',
          400: '#00e694',
          500: '#00cc7f',
          600: '#00a366',
          700: '#007a4d',
          800: '#005233',
          900: '#00291a',
        },
        dark: {
          50:  '#f0f0f0',
          100: '#d0d0d0',
          200: '#a0a0a0',
          300: '#707070',
          400: '#505050',
          500: '#303030',
          600: '#1e1e1e',
          700: '#141414',
          800: '#0d0d0d',
          900: '#080808',
        },
      },
      fontFamily: {
        sans:    ['Syne', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float':    'float 6s ease-in-out infinite',
        'glow':     'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in':  'fadeIn 0.4s ease-out',
      },
      keyframes: {
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        glow:    { from: { boxShadow: '0 0 10px #00cc7f33' }, to: { boxShadow: '0 0 30px #00cc7f66' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
      },
    },
  },
  plugins: [],
};

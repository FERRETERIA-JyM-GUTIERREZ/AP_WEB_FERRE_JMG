/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'ferreteria': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        'orange': {
          25: '#fffbf5',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      },
      keyframes: {
        smoke: {
          '0%': { 
            transform: 'translateY(0) scaleY(1)',
            opacity: '0.3'
          },
          '50%': { 
            transform: 'translateY(-20px) scaleY(1.5)',
            opacity: '0.1'
          },
          '100%': { 
            transform: 'translateY(-40px) scaleY(2)',
            opacity: '0'
          }
        },
        letterBounce: {
          '0%, 100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          },
          '50%': { 
            transform: 'translateY(-8px)',
            opacity: '0.8'
          }
        }
      },
      animation: {
        'smoke': 'smoke 3s ease-in-out infinite',
        'letter-bounce': 'letterBounce 2s ease-in-out infinite'
      }
    },
  },
  plugins: [],
} 
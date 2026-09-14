/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08111f',
        navy: '#0e1d34',
        cyan: '#22d3ee',
        aqua: '#67e8f9',
        cream: '#f7f8fb',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(103,232,249,.16), 0 16px 50px rgba(8,17,31,.12)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-up': 'fade-up .55s ease both',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

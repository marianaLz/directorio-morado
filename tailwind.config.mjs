/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          'bg-top': 'var(--color-bg-top)',
          'bg-bottom': 'var(--color-bg-bottom)',
          title: 'var(--color-title)',
          highlight: 'var(--color-highlight)',
          accent: 'var(--color-accent)',
          'accent-hover': 'var(--color-accent-hover)',
          'card-bg': 'var(--color-card-bg)',
          'card-border': 'var(--color-card-border)',
        },
        whatsapp: '#25D366',
        emergency: {
          red: '#e53935',
          dark: '#b71c1c',
        },
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        sage: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['16px', '1.6'],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, var(--color-bg-top) 0%, var(--color-bg-bottom) 100%)',
        'green-gradient': 'linear-gradient(180deg, #053e2f 0%, #045230 100%)',
        'emergency-gradient': 'linear-gradient(180deg, #b71c1c 0%, #8b0000 100%)',
      },
      borderRadius: {
        '2.5': '10px',
      },
    },
  },
  plugins: [],
};

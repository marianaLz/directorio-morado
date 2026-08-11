/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          lilac: 'var(--brand-lilac)',
          lavender: 'var(--brand-lavender)',
          green: 'var(--brand-green)',
          red: 'var(--brand-red)',
          sage: 'var(--brand-sage)',
          text: 'var(--brand-text)',
          white: 'var(--brand-white)',
        },
      },
      fontFamily: {
        sans: ['Sofia Pro', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['16px', '1.6'],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
      borderRadius: {
        '2.5': '10px',
      },
    },
  },
  plugins: [],
};

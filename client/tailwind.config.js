/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="charcoal-midnight"]'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          border: 'var(--color-border)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          'primary-light': 'var(--color-primary-light)',
          'primary-contrast': 'var(--color-primary-contrast, #ffffff)',
          accent: 'var(--color-accent)',
          'accent-bg': 'var(--color-accent-bg)',
          'accent-border': 'var(--color-accent-border)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'elevated': '0 20px 35px -10px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'dock': '0 -5px 25px -5px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}

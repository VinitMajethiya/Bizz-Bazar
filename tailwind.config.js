/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['Jost', "'Helvetica Neue'", 'Arial', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        ui: 'var(--radius-ui)',
      },
      maxWidth: {
        site: '1180px',
      },
    },
  },
  plugins: [],
};


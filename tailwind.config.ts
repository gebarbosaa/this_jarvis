import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAFAF7',
        surface: '#EFEDE6',
        border: '#DAD6C9',
        ink: {
          DEFAULT: '#22303C',
          soft: '#4B5A63',
          faint: '#8B9096',
        },
        pine: {
          DEFAULT: '#3D6B5C',
          dark: '#2C4F44',
          light: '#E4EDE9',
        },
        amber: {
          DEFAULT: '#C98A3E',
          dark: '#9C6A2C',
          light: '#F5E6CE',
        },
        clay: {
          DEFAULT: '#B65C4A',
          light: '#F3E0DA',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#292724',
        surface: '#35322F',
        border: '#4A4743',
        ink: {
          DEFAULT: '#F5F2ED',
          soft: '#B9B4AC',
          faint: '#817B73',
        },
        primary: '#D97E2B',
        secondary: '#35322F',
        success: '#75C995',
        danger: '#E46D61',
        warning: '#E5B85C',
        info: '#6FA7E8',
        card: '#35322F',
        sidebar: '#252320',
        sidebarBorder: '#403D39',
        orange: '#D97E2B',
        pine: {
          DEFAULT: '#D97E2B',
          dark: '#B8661F',
          light: '#4A3728',
        },
        amber: {
          DEFAULT: '#E5B85C',
          dark: '#B78B35',
          light: '#4A402D',
        },
        clay: {
          DEFAULT: '#E46D61',
          light: '#4A302D',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-sans)', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
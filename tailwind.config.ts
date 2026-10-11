import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#0B1220',
        surface: '#111D30',
        border: '#243B59',
        ink: {
          DEFAULT: '#F0F7FF',
          soft: '#A7BDD7',
          faint: '#7086A3',
        },
        primary: '#54D7FF',
        secondary: '#172840',
        success: '#75C995',
        danger: '#E46D61',
        warning: '#E5B85C',
        info: '#6FA7E8',
        card: '#111D30',
        sidebar: '#080F1C',
        sidebarBorder: '#203752',
        orange: '#54D7FF',
        pine: {
          DEFAULT: '#54D7FF',
          dark: '#378FBF',
          light: '#18334A',
        },
        amber: {
          DEFAULT: '#8BAEFF',
          dark: '#5778C7',
          light: '#1C2B49',
        },
        clay: {
          DEFAULT: '#FF718D',
          light: '#3D243A',
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
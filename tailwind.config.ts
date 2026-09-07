import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Réplica estilos_globales.css JavaFX: #37474F / #263238 + acentos #E53935 / #FF7043
        slateblue: {
          DEFAULT: '#37474F',
          dark: '#263238',
          light: '#546E7A'
        },
        brand: {
          DEFAULT: '#E53935',
          soft: '#FF7043',
          dark: '#B71C1C'
        },
        background: '#102027',
        surface: '#37474F',
        surfacedark: '#263238'
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem'
      }
    }
  },
  plugins: []
};

export default config;

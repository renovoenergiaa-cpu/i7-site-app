/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F9FAFB',
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#FFFFFF',
          hover: '#F3F4F6',
        },
        border: {
          DEFAULT: '#E5E7EB',
          subtle: '#F3F4F6',
        },
        brand: {
          lime: '#65A30D', // Verde folha (como no ícone de Visitas Online)
          'lime-hover': '#4D7C0F',
          blue: '#2F6BFF',
          'blue-hover': '#1F56E0',
          dark: '#0F1115',
        },
        text: {
          primary: '#111827',
          secondary: '#4B5563',
          muted: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'glow-lime': '0 0 25px -5px rgba(180, 255, 57, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(47, 107, 255, 0.3)',
      }
    },
  },
  plugins: [],
};

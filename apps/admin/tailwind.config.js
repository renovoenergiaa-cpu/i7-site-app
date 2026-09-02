/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F1115',
        brand: {
          lime: '#B4FF39',
          blue: '#2F6BFF',
        }
      }
    },
  },
  plugins: [],
};

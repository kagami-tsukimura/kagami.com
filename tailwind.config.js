/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      fontFamily: {
        opensans: ['Open Sans', 'sans-serif'],
      },
      colors: {
        body: '#050505',
        'selected-text': '#A3A3FF',
        theme: '#5c318c',
        secondary: '#9191A4',
        badge: '#3F3F51',
        inputBorder: '#565666',
        input: '#2A2A33',
      },
    },
  },
  plugins: [],
};

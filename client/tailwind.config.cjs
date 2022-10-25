/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [    
  './index.html',
  './src/**/*.{vue,jsx,ts,js}',],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['dracula', "valentine", 'pastel' ]
  }
}

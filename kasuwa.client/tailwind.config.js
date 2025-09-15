/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Northern Nigerian cultural colors
        'kasuwa-primary': {
          50: '#fdf6f0',
          100: '#faebd7',
          200: '#f4d4ae',
          300: '#edb880',
          400: '#e59850',
          500: '#de7e2e',
          600: '#cf6424',
          700: '#ac4e20',
          800: '#89421f',
          900: '#6f371b',
        },
        'kasuwa-secondary': {
          50: '#f0f9f3',
          100: '#dcf3e1',
          200: '#bce6c8',
          300: '#90d3a5',
          400: '#5cb97c',
          500: '#389f5e',
          600: '#2a7f49',
          700: '#23653c',
          800: '#1e5133',
          900: '#1a422b',
        },
        'kasuwa-accent': {
          50: '#fef9ec',
          100: '#fcf1c9',
          200: '#f9e28e',
          300: '#f6ce53',
          400: '#f4b92c',
          500: '#ee9c14',
          600: '#d4780e',
          700: '#b05611',
          800: '#8f4315',
          900: '#753715',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
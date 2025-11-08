/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f7fb',
          100: '#e2e9f3',
          200: '#c4d4e7',
          300: '#9cb8d7',
          400: '#6f96c4',
          500: '#4f7cac',
          600: '#3c638d',
          700: '#2f4e70',
          800: '#243d57',
          900: '#1d3145',
          950: '#111d2a',
        },
        neutral: {
          50: '#f8fafb',
          100: '#edf1f5',
          200: '#d6dde5',
          300: '#bcc6cf',
          400: '#9aa6b4',
          500: '#7b8999',
          600: '#616f80',
          700: '#4f5a68',
          800: '#3f4753',
          900: '#343a44',
        },
        accent: {
          50: '#f6fbf9',
          100: '#d9f1e6',
          200: '#b6e2d0',
          300: '#8fceb6',
          400: '#63b197',
          500: '#43997f',
          600: '#2f7c66',
          700: '#276457',
          800: '#1f5046',
          900: '#1a413a',
        },
      },
    },
  },
  plugins: [],
}


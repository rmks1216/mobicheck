/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // src 디렉터리 안 JS/TS 파일 모두
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // Blue-500
        secondary: '#6b7280', // Gray-500
        accent: '#f59e0b', // Amber-500
        background: '#f9fafb', // Gray-50
        foreground: '#1f2937', // Gray-800
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
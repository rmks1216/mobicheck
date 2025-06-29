/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // src 디렉터리 안 JS/TS 파일 모두
  ],
  theme: {
    extend: {},                  // 필요한 사용자 색상·폰트 확장 가능
  },
  plugins: [],
};
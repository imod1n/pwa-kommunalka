/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#111111',
          secondary: '#1c1c1e',
          card: '#2c2c2e',
          input: '#3a3a3c',
        },
        accent: {
          green: '#30d158',
          blue: '#0a84ff',
          orange: '#ff9f0a',
          red: '#ff453a',
          yellow: '#ffd60a',
          purple: '#bf5af2',
        },
        border: '#38383a',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'ios': '16px',
        'ios-sm': '12px',
        'ios-lg': '20px',
      }
    },
  },
  plugins: [],
}

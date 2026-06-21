import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        oracle: {
          50: '#f0f0ff',
          100: '#d5d0ff',
          200: '#b3a8ff',
          300: '#8a7aff',
          400: '#6c4fff',
          500: '#5a2eff',
          600: '#4d1eff',
          700: '#3f12e8',
          800: '#3410c0',
          900: '#2c1099',
        },
        surface: {
          DEFAULT: '#0a0a1a',
          50: '#12122a',
          100: '#1a1a3a',
          200: '#22224a',
          300: '#2a2a5a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse at center, rgba(108,63,245,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(108,63,245,0.3)',
        'glow-sm': '0 0 15px rgba(108,63,245,0.2)',
      },
    },
  },
  plugins: [],
}
export default config

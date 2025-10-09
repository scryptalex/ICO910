import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        accent: '#22D3EE',
        dark: '#0B0F1A'
      }
    }
  },
  plugins: []
}

export default config


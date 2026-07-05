import type { Config } from 'tailwindcss'
import { colors } from './lib/colors'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: { ...colors },
      fontFamily: {
        display: ['var(--font-bricolage)', 'sans-serif'],
        body: ['var(--font-jakarta)', 'sans-serif'],
      },
      borderRadius: {
        btn: '12px',
        card: '20px',
        hero: '26px',
        modal: '24px',
        pill: '30px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,23,42,.08), 0 4px 12px rgba(15,23,42,.06)',
        'btn-coral': '0 8px 18px -8px rgba(240,104,64,.7)',
        dropdown: '0 8px 24px rgba(15,23,42,.12)',
        modal: '0 20px 60px rgba(15,23,42,.2)',
      },
      keyframes: {
        boraFade: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        boraPop: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        boraDrop: {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        boraHeart: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.42)' },
          '70%': { transform: 'scale(0.86)' },
          '100%': { transform: 'scale(1)' },
        },
        boraGrow: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        boraStamp: {
          '0%': { opacity: '0', transform: 'rotate(-15deg) scale(1.4)' },
          '100%': { opacity: '1', transform: 'rotate(-15deg) scale(1)' },
        },
        boraFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
      },
      animation: {
        'bora-fade': 'boraFade .4s ease both',
        'bora-pop': 'boraPop .5s cubic-bezier(.2,.8,.2,1) both',
        'bora-drop': 'boraDrop .5s cubic-bezier(.2,.8,.3,1.3) both',
        'bora-heart': 'boraHeart .45s ease both',
        'bora-grow': 'boraGrow .85s cubic-bezier(.2,.8,.2,1) both',
        'bora-stamp': 'boraStamp .55s cubic-bezier(.3,1.4,.5,1) both',
        'bora-float': 'boraFloat 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config

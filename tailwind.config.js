/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#070504',
          900: '#0E0B08',
          800: '#18120C',
          700: '#261D13',
          600: '#382B1D',
        },
        gold: {
          light: '#F8E9B0',
          DEFAULT: '#D4AF37',
          dark: '#B8860B',
          antique: '#C5A059',
          bronze: '#8C6D23',
          glow: '#FFE57F',
        },
        royalRed: {
          darkest: '#2B0606',
          dark: '#4A0E0E',
          DEFAULT: '#7A1C1C',
          bright: '#9E2A2A',
          orange: '#C0392B',
          burnt: '#B33917',
        },
        parchment: {
          light: '#FAF3DF',
          DEFAULT: '#F4E8C1',
          dark: '#E2D19D',
          ink: '#1C150C',
          border: '#D2BC82',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'Cambria', 'serif'],
        sanskrit: ['Rozha One', 'Cinzel Decorative', 'serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFE57F 0%, #D4AF37 50%, #8C6D23 100%)',
        'gold-border-gradient': 'linear-gradient(to right, #B8860B, #FFE57F, #B8860B)',
        'royal-gradient': 'linear-gradient(180deg, #4A0E0E 0%, #2B0606 100%)',
        'parchment-gradient': 'linear-gradient(180deg, #FAF3DF 0%, #F4E8C1 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.35)',
        'red-glow': '0 0 30px rgba(122, 28, 28, 0.5)',
        'inner-parchment': 'inset 0 0 15px rgba(140, 109, 35, 0.25)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 30px rgba(255, 229, 127, 0.8))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
};

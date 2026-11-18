/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1326',
        surface: {
          DEFAULT: '#0B1326',
          container: '#171F33',
          high: '#222A3D',
          highest: '#2D3449',
          low: '#131B2E',
          lowest: '#060E20',
          variant: '#2D3449',
        },
        primary: {
          DEFAULT: '#FFE600',
          foreground: '#0F172A',
          container: '#FDE400',
        },
        secondary: {
          DEFAULT: '#FF6B2B',
          foreground: '#FFFFFF',
          container: '#CD4800',
          dim: '#FFB59A',
        },
        prod: {
          crimson: '#EF4444',
          alert: '#93000A',
        },
        on: {
          surface: '#DAE2FD',
          muted: '#94A3B8',
          variant: '#CDC7AA',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon-yellow': '0 0 20px -2px rgba(255, 230, 0, 0.35)',
        'neon-orange': '0 0 16px -2px rgba(255, 107, 43, 0.35)',
        'neon-red': '0 0 16px -2px rgba(239, 68, 68, 0.4)',
      }
    },
  },
  plugins: [],
};


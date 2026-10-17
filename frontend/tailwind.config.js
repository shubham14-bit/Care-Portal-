/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3F8F55",
        "primary-container": "#33844B",
        secondary: "#214D38",
        "secondary-container": "#DDF5E3",
        tertiary: "#006858",
        "bulb-teal": "#45B7A0",
        "leaf-green": "#78C850",
        surface: "#F4F8F0",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F1F5ED",
        "surface-container": "#EBEFE7",
        "surface-container-high": "#E5E9E2",
        "surface-container-highest": "#E0E4DC",
        "on-surface": "#1D3025",
        "on-surface-variant": "#68796C",
        "outline-variant": "#DDF5E3",
        outline: "#707A6F",
        "error-container": "#FFDAD6",
        "on-error-container": "#93000A",
        error: "#BA1A1A",
        // Extended Botanical Sanctuary brand palette
        brand: {
          50: '#F0F9F3',
          100: '#DDF5E3',
          200: '#C2ECCC',
          300: '#9FE0B0',
          400: '#78C850',
          500: '#136A34',
          600: '#0F582B',
          700: '#214D38',
          800: '#173929',
          900: '#0F271B',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        headline: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        subtle: '0 2px 10px rgba(19, 106, 52, 0.04)',
        card: '0 4px 18px rgba(19, 106, 52, 0.06)',
        dock: '0 12px 36px -6px rgba(21, 51, 37, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
        glow: '0 0 20px rgba(120, 200, 80, 0.35)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

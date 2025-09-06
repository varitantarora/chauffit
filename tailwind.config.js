


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D9D1C6', // Pastel Gray - premium feel
          50: '#F7F0E7',
          100: '#EDE0CF',
          200: '#E3D0B7',
          300: '#D9C09F',
          400: '#CFB087',
          500: '#D9D1C6',
          600: '#C7B8AA',
          700: '#B5A08D',
          800: '#A38770',
          900: '#916E53',
        },
        secondary: {
          DEFAULT: '#BD8C5E', // Deer - warm accent
          50: '#F7F0E7',
          100: '#EDE0CF',
          200: '#E3D0B7',
          300: '#D9C09F',
          400: '#CFB087',
          500: '#BD8C5E',
          600: '#A67344',
          700: '#8F5A2A',
          800: '#784110',
          900: '#612800',
        },
        burgundy: {
          DEFAULT: '#720C17', // Icons and app bar
          50: '#FCE8EA',
          100: '#F8D1D5',
          200: '#F1A3AB',
          300: '#EA7581',
          400: '#E34757',
          500: '#720C17',
          600: '#B0142A',
          700: '#840F20',
          800: '#580A13',
          900: '#46080E',
        },
        success: '#10B981',
        danger: '#EF4444',
        textPrimary: '#000000',
        textSecondary: '#314B4C',
        background: '#FFFFFF',
        surface: '#F9F9F9',
        border: '#E5E5E5',
        darkBackground: '#1A1A1A',
        darkSurface: '#2C2C2C',
        darkText: '#D9D1C6',
        darkTextSecondary: '#999999',
        darkBorder: '#4A4A4A',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'serif': ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
  
}
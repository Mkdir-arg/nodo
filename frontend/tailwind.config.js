/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  safelist: [
    { pattern: /col-span-(1|2|3|4|5|6|7|8|9|10|11|12)/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          pink: '#FF0080',
          purple: '#7928CA',
          gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
          DEFAULT: '#FF0080',
          foreground: '#FFFFFF',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        nodo: {
          purple: { dark: '#8908cc', DEFAULT: '#7928CA' },
          cyan: '#08b8cc',
          magenta: '#cc0884',
          title: '#252F40',
          legajo: { name: '#141414', subtitle: '#8C8C8C' },
          text: '#4A5565',
          icon: '#56606A',
          dropdown: '#101828',
          border: '#E5E7EB',
          white: '#FFFFFF',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
      },
      gridTemplateColumns: {
        'legajos-6': 'repeat(6, 243px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
};

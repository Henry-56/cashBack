/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#023440', // Deep Teal/Slate
          light: '#006D77',   // Lighter Teal
        },
        accent: {
          DEFAULT: '#D4E157', // Lime Gold
          hover: '#C0CA33',
        },
        success: '#4CAF50',
        bg: {
          light: '#F5F7FA',
        },
        text: {
          main: '#023440',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

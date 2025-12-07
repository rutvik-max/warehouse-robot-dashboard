// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f5f7ff",
          100: "#e6eeff",
          200: "#c6ddff",
          300: "#9dbbff",
          400: "#6b92ff",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
          800: "#2b1f7a",
          900: "#1f154f",
        },
        primary: {
          DEFAULT: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
        },
        accent: {
          DEFAULT: "#7c3aed",
        },
        success: {
          DEFAULT: "#10b981",
        },
        warning: {
          DEFAULT: "#f59e0b",
        },
        danger: {
          DEFAULT: "#ef4444",
        },
      },
      spacing: {
        72: "18rem",
        80: "20rem",
        84: "21rem",
        96: "24rem",
      },
      borderRadius: {
        'xl-2xl': '1.25rem',
      },
      boxShadow: {
        'soft-md': '0 6px 18px rgba(16,24,40,0.06)',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          lg: '2rem',
          xl: '3rem',
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

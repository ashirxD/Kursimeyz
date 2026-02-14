/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "forest-moss": "#3a4d39",
        "forest-moss-light": "#4f6f52",
        "sage-leaf": "#8a9a5b",
        "sage-soft": "#e8ecd7",
        "oatmeal": "#f2ece0",
        "bark": "#4b3621",
        "bark-hover": "#3d2b1a",
        "clay": "#d27d53",
        "clay-soft": "#f5e8e1",
        "status-delivered-bg": "#eaf2ea",
        "status-delivered-text": "#3a4d39",
        "status-transit-bg": "#e6f0ee",
        "status-transit-text": "#54b1a4",
        "status-processing-bg": "#fef4ed",
        "status-processing-text": "#e07841",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(58, 77, 57, 0.05), 0 8px 10px -6px rgba(58, 77, 57, 0.03)',
        'medium': '0 20px 25px -5px rgba(58, 77, 57, 0.1), 0 10px 10px -5px rgba(58, 77, 57, 0.04)',
      },
    },
  },
  plugins: [],
}
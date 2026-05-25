/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          50: "#e8f5ea",
          100: "#c8e6c9",
          500: "#4caf50",
          600: "#43a047",
          700: "#2d7a3a",
          800: "#1b5e20",
        },
        amber: {
          50: "#fff3e0",
          400: "#ffa726",
          600: "#fb8c00",
          700: "#b85c00",
        },
        teal: {
          50: "#e0f4f4",
          600: "#0d6e6e",
        },
      },
      fontFamily: {
        sans: ["'Sora'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

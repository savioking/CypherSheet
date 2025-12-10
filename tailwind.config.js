/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4338CA",
        "background-light": "#F3F4F6",
        "background-dark": "#111827",
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["Roboto", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
    },
  },
  plugins: [],
};

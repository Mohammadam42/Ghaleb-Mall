/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Tajawal", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#141211",
        mallOrange: "#E85D25",
        mallGold: "#D7A545",
        mallLime: "#B9D84F",
        soft: "#FFF8F1",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(232, 93, 37, 0.18)",
      },
    },
  },
  plugins: [],
};


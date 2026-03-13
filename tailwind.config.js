/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        garamond: ["EB Garamond", "Georgia", "serif"],
        mono: ["Share Tech Mono", "monospace"],
      },
      colors: {
        // Your custom game palette
        gold: {
          1: "#7a5c1e",
          2: "#b8902a",
          3: "#d4a843",
          4: "#f0c060",
        },
        parch: { 1: "#e8d5a8", 2: "#d4bc88" },
      },
    },
  },
};

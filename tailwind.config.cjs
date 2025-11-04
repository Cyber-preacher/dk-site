/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/notes/**/*.md"
  ],
  darkMode: "class",
  theme: {
    extend: {}
  },
  plugins: [typography]
};

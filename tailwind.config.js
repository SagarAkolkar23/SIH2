/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: The lines below are CRITICAL.
  // We added "./src/**/*.{js,jsx,ts,tsx}" to catch everything inside your src folder.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};

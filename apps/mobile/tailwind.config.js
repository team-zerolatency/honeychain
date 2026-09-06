/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#F6EEDD", "background-dark": "#14100B",
        surface: "#FFFBF2", "surface-dark": "#1E160E",
        "surface-2": "#FDF3DC", "surface-2-dark": "#271C11",
        foreground: "#241A0E", "foreground-dark": "#F5EEDD",
        muted: "#6E5B3E", "muted-dark": "#B8A88C",
        accent: "#C2790C", "accent-dark": "#E8A317",
        "accent-strong": "#8F590A", "accent-strong-dark": "#B9770E",
        border: "#E7D9BB", "border-dark": "#382A18",
        "verify-green": "#3F7F4C", "verify-green-dark": "#4C9A5B",
        "verify-yellow": "#B9821F", "verify-yellow-dark": "#D9A441",
        "verify-red": "#A83730", "verify-red-dark": "#C1443D",
      },
      fontFamily: {
        display: ["Fraunces_500Medium"],
        sans: ["Manrope_400Regular"],
      },
    },
  },
  plugins: [],
};
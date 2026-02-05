/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Global Background
        bgPrimary: {
          light: "#FFFFFF",
          dark: "#121212",
        },

        // Card Backgrounds
        card: {
          light: "#FFFFFF",
          dark: "#1E1E1E",
        },

        cardCompleted: {
          light: "#8938E9",
          dark: "#2A2A2A",
        },

        // Text Colors
        textPrimary: {
          light: "#392F46",
          dark: "#9CA3AF",
        },
        textSecondary: {
          light: "#392F46",
          dark: "#9CA3AF",
        },

        textInsidePrimary: {
          light: "#FFFFFF",
          dark: "#FFFFFF",
        },

        textHighlight: {
          light: "#8938E9",
          dark: "#9CA3AF",
        },

        // Accent
        accent: {
          light: "#8938E9",
          dark: "#461C78",
        },

        button: {
          light: "#8938E9",
          dark: "#5F23A6",
        },
        textButton: {
          light: "#FFFFFF",
          dark: "#FFFFFF",
        },

        borderButton: {
          light: "#392F46",
          dark: "#9CA3AF",
        },

        search: {
          light: "#392F46",
          dark: "#9CA3AF",
        },
        textSearch: {
          light: "#FFFFFF",
          dark: "#9CA3AF",
        },
        bgModal: {
          light: "#FFFFFF",
          dark: "#2A2A2A",
        },
        bgTextbox: {
          light: "#FFFFFF",
          dark: "#2A2A2A",
        },
        textTextbox: {
          light: "#392F46",
          dark: "#9CA3AF",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

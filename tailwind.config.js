/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-bold": ["Inter_700Bold"],
      },
      lineHeight: {
        "bigger-text-line": "1.19",
        "body-text-line": "1.50",
      },
      colors: {
        // Global Background
        bgPrimary: {
          light: "#D3D3D3",
          dark: "#121212",
        },
        primary: {
          light: "#2567CA",
          dark: "#5F23A6",
        },
        mainColor: {
          light: "#2567CA",
          dark: "#5F23A6",
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
          light: "#112747",
          dark: "#9CA3AF",
        },
        textSecondary: {
          light: "#486085",
          dark: "#9CA3AF",
        },

        textInsidePrimary: {
          light: "#FFFFFF",
          dark: "#FFFFFF",
        },

        textHighlight: {
          light: "#2567CA",
          dark: "#9CA3AF",
        },

        textButton: {
          light: "#FFFFFF",
          dark: "#FFFFFF",
        },

        borderStrong: {
          light: "#6684B0",
          dark: "#9CA3AF",
        },

        search: {
          light: "#B8B8B8",
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

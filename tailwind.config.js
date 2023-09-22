/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {},
      colors: {
        white: "#ffffff",
        "ui-neutral-600": "#737373",
        "ui-main-50": "#f0fbff",
        "ui-main-900": "#091133",
        "ui-surface-lite-300": "#efefed",
        "ui-neutral-300": "#dadada",
        "ui-main-600": "#00a0d1",
        black: "#000000",
        "ui-neutral-900": "#111111",
        "ui-main-200": "#cef1ff",
        "fluree-no-fill": "#ffffff",
        "ui-yellow-300": "#faca15",
        "ui-main-500": "#00b5ef",
        "brand-purple": "#171f69",
        "ui-main-400": "#13c6ff",
        "ui-surface-lite-050": "#f9f9f7",
        "ui-surface-lite-900": "#dadad8",
        "ui-neutral-500": "#979797",
      },
      spacing: {},
      width: {},
      minWidth: {},
      maxWidth: {},
      height: {},
      minHeight: {},
      maxHeight: {},
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "polka-pink": "#E6007A", // The vibrant pink from Polkadot's logo elements
        "polka-dark": "#1A1A1A", // A very dark grey for primary buttons/text
        "brand-gradient-from": "hsl(200, 90%, 70%)", // Light Sky Blueish
        "brand-gradient-via": "hsl(230, 80%, 75%)", // Deeper Blue/Purpleish
        "brand-gradient-to": "hsl(280, 80%, 80%)", // Lavender/Pinkish
        // You can add more shades if needed
        "light-bg": "#FFFFFF",
        "medium-bg": "#F7F7F9", // Off-white for cards or sections
        "dark-text": "#2C2C2C",
        "medium-text": "#555555",
        "light-text": "#F3F3F3",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(120deg, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%)",
        // A more direct attempt at the Polkadot hero bg colors. You might need to adjust HSL values.
        "polka-hero-gradient":
          "linear-gradient(110deg, hsl(195, 100%, 50%) 0%, hsl(225, 100%, 60%) 40%, hsl(260, 100%, 70%) 70%, hsl(300, 100%, 75%) 100%)",
      },
      animation: {
        "gradient-bg-animation": "gradient-bg 10s ease infinite alternate",
      },
      keyframes: {
        "gradient-bg": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};

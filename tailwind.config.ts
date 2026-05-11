import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0c0f",
        mist: "#f6f7f9",
        line: "#e7e9ee",
        brand: "#635bff",
        mint: "#37d399",
        amber: "#f4b740"
      },
      boxShadow: {
        soft: "0 22px 70px rgba(15, 23, 42, 0.10)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

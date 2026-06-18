import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C9A96E",
          hover: "#B8965C",
          light: "#DFCB9E",
        },
        salon: {
          bg: "#0F0F0F",
          surface: "#1A1A1A",
          border: "#2A2A2A",
          text: {
            primary: "#F5F5F5",
            secondary: "#888888",
          },
          success: "#4CAF50",
          alert: "#FF9800",
          error: "#EF5350",
        },
      },
      borderRadius: {
        salon: "12px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

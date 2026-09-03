import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12131a",
        paper: "#fafaf8",
      },
    },
  },
  plugins: [],
};

export default config;

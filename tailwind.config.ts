import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Andus Labs brand palette (Cheat Sheet: Brand Summary for Fonts & Colors)
        brand: {
          bg: "#FAF5EA", // Old Lace -- page background
          ink: "#1A064B", // Violet -- headings/primary text
          primary: "#0C1D98", // Zaffre -- primary actions/links
          accent: "#7884FF", // Tropical Indigo -- interactive accents, toggles, focus
          periwinkle: "#DCD6F7", // light accent surface
          muted: "#AA988F", // Cinerous -- secondary text, hairlines
          cta: "#FF4F01", // Orange -- high-emphasis CTA / alerts
        },
      },
      fontFamily: {
        // Times New Roman throughout -- it's a system font (no next/font
        // needed), with the usual serif fallbacks for machines that don't
        // have it installed.
        serif: ['"Times New Roman"', "Times", "Georgia", "serif"],
        sans: ['"Times New Roman"', "Times", "Georgia", "serif"],
        display: ['"Times New Roman"', "Times", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

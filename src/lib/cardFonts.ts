import { Cormorant_Garamond, Lora } from "next/font/google";

// Scoped to EntryCard only (via these two variables applied on the card's
// root element) -- the rest of the app stays on Times New Roman.
export const cardHeading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

export const cardBody = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

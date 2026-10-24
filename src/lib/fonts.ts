import { Bricolage_Grotesque, IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";

// latin-ext covers Turkish and Polish (ş, ğ, ı, ł, ą, ę…).
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

/** Arabic glyphs; listed after the Latin fonts, so it's only downloaded where Arabic text appears. */
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

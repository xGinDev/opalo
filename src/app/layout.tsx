import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { bricolage, manrope } from "@/lib/fonts";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ópalo — Todo lo que eres, en un solo enlace",
    template: "%s · Ópalo",
  },
  description:
    "Crea una página de perfil que se ve como tú: tu fondo, tu música, tus redes y tu estilo.",
};

export const viewport: Viewport = {
  themeColor: "#0d0b12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`dark ${bricolage.variable} ${manrope.variable}`}>
      <body>
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}

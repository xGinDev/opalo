import type { MetadataRoute } from "next";

/** Install metadata (home screen icon and colors). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ópalo",
    short_name: "Ópalo",
    description: "Todo lo que eres, en un solo enlace.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0b12",
    theme_color: "#0d0b12",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

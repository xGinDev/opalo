import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Public pages and profiles are indexable; private areas and endpoints are not. */
export default function robots(): MetadataRoute.Robots {
  const isProduction = siteUrl.startsWith("https://opalo.me");
  return {
    rules: isProduction
      ? {
          userAgent: "*",
          allow: "/",
          disallow: ["/panel", "/*/panel", "/admin", "/api/", "/auth/", "/dev/", "/recuperar", "/*/recuperar"],
        }
      : // Previews and local copies never get indexed.
        { userAgent: "*", disallow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

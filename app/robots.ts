import type { MetadataRoute } from "next";

// The tool page is public; the API routes are not pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: "https://wrap.metropointtech.com/sitemap.xml",
  };
}

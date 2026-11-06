import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://finda.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/search",
    "/become-artisan",
    "/missions",
    "/contact",
    "/support",
    "/cgu",
    "/confidentialite",
    "/mentions-legales",
  ]

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }))
}

import type { MetadataRoute } from "next";
import spicesData from "@/data/spices.json";

const baseUrl = "https://spiceatlas.starmap.quest";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = ["", "/browse", "/pairings"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const spiceRoutes: MetadataRoute.Sitemap = (spicesData as Array<{ slug: string }>).map((spice) => ({
    url: `${baseUrl}/spice/${spice.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...spiceRoutes];
}

import { MetadataRoute } from "next";
import { getAllProjectDocs } from "@/lib/projects-markdown";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tranquocdat.com";
  const projects = await getAllProjectDocs();

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/certificates`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...projects.map(
      (project) =>
        ({
          url: `${baseUrl}/projects/${project.slug}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        }) satisfies MetadataRoute.Sitemap[number]
    ),
  ];
}

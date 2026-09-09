import type { MetadataRoute } from "next";
import { schools } from "../data/schools";

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSlug(school: (typeof schools)[number]) {
  const base = normalize(school.shortName);

  const duplicates = schools.filter(
    (item) => normalize(item.shortName) === base
  );

  if (duplicates.length > 1) {
    return `${base}-${school.id}`;
  }

  return base;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const schoolPages: MetadataRoute.Sitemap = schools.map((school) => ({
    url: `https://quydoihsa.com/truong/${getSlug(school)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://quydoihsa.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...schoolPages,
  ];
}
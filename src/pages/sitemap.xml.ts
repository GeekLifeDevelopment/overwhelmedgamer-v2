import type { APIRoute } from "astro";
import { latestPodcastEpisodes as fallbackPodcastEpisodes } from "../data/media";
import { getLatestPodcastEpisodes } from "../lib/podcast";

type SitemapEntry = {
  loc: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: number;
  lastmod?: string;
};

const toIsoDate = (value?: string): string | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const renderEntry = (entry: SitemapEntry): string => {
  const fields = [
    `<loc>${escapeXml(entry.loc)}</loc>`,
    entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "",
    entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : "",
    typeof entry.priority === "number" ? `<priority>${entry.priority.toFixed(1)}</priority>` : ""
  ]
    .filter(Boolean)
    .join("");

  return `<url>${fields}</url>`;
};

export const GET: APIRoute = async () => {
  const siteUrl =
    (import.meta.env.PUBLIC_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
    "https://www.theoverwhelmedgamer.com";

  const staticEntries: SitemapEntry[] = [
    { loc: `${siteUrl}/`, changefreq: "daily", priority: 1.0 },
    { loc: `${siteUrl}/podcast`, changefreq: "daily", priority: 0.8 },
    { loc: `${siteUrl}/tools`, changefreq: "daily", priority: 0.8 },
    { loc: `${siteUrl}/merch`, changefreq: "weekly", priority: 0.6 },
    { loc: `${siteUrl}/contact`, changefreq: "monthly", priority: 0.5 }
  ];

  const fetchedEpisodes = await getLatestPodcastEpisodes(100);
  const episodes = (fetchedEpisodes.length > 0 ? fetchedEpisodes : fallbackPodcastEpisodes)
    .filter((episode) => episode.externalLink?.startsWith("/podcast/"));

  const episodeEntries: SitemapEntry[] = episodes.map((episode) => ({
    loc: `${siteUrl}${episode.externalLink}`,
    lastmod: toIsoDate(episode.date),
    changefreq: "weekly",
    priority: 0.7
  }));

  const entries = [...staticEntries, ...episodeEntries];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries
    .map((entry) => renderEntry(entry))
    .join("")}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
};

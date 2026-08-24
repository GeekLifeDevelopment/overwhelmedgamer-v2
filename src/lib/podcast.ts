import type { MediaCardItem } from "../data/media";

const DEFAULT_PODCAST_FEED_URL = "https://api.riverside.com/hosting/Rspwhe3G.rss";

export const PODCAST_PLATFORM_LINKS = {
  spotify: import.meta.env.PODCAST_SPOTIFY_URL as string | undefined,
  apple: import.meta.env.PODCAST_APPLE_URL as string | undefined,
  youtube: import.meta.env.PODCAST_YOUTUBE_URL as string | undefined,
  rss: import.meta.env.PODCAST_FEED_URL as string | undefined ?? DEFAULT_PODCAST_FEED_URL
};

const NOTES_CUTOFF_PATTERNS = [
  /watch the video podcast/i,
  /connect with jason/i,
  /streaming/i,
  /join the community/i,
  /socials?/i,
  /follow me on twitter/i,
  /like my facebook/i,
  /visit my website/i,
  /don.?t forget to subscribe/i
];

const NOTES_FALLBACK = "More notes for this episode are coming soon.";

function decodeHtmlEntities(input: string): string {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    quot: '"',
    lt: "<",
    gt: ">",
    nbsp: " "
  };

  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const codePoint = Number.parseInt(entity.slice(2), 16);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }

    if (entity.startsWith("#")) {
      const codePoint = Number.parseInt(entity.slice(1), 10);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }

    return namedEntities[entity] ?? match;
  });
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function normalizeText(input?: string): string {
  if (!input) return "";

  const withoutCdata = input.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  return normalizeWhitespace(decodeHtmlEntities(withoutCdata.replace(/<[^>]+>/g, " ")));
}

function stripHtmlToNotesText(input?: string): string {
  if (!input) return "";

  const withoutCdata = input.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  const withLineBreaks = withoutCdata
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/p\s*>/gi, "\n\n")
    .replace(/<\s*li\b[^>]*>/gi, "\n- ")
    .replace(/<\s*\/li\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  const decoded = decodeHtmlEntities(withLineBreaks)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/----more----/gi, "")
    .trim();

  return decoded;
}

function stripRawUrls(input: string): string {
  return input.replace(/(?:https?:\/\/|www\.)\S+/gi, " ");
}

function truncateAtWord(input: string, limit: number): string {
  if (input.length <= limit) return input;

  const window = input.slice(0, limit + 1);
  const splitAt = window.lastIndexOf(" ");
  const safeCut = splitAt > Math.floor(limit * 0.6) ? splitAt : limit;

  return `${window.slice(0, safeCut).trimEnd()}…`;
}

function sanitizeNotesText(raw?: string): string {
  const base = stripHtmlToNotesText(raw);
  if (!base) return NOTES_FALLBACK;

  let cleaned = base;

  for (const pattern of NOTES_CUTOFF_PATTERNS) {
    const matchIndex = cleaned.search(pattern);
    if (matchIndex > 120) {
      cleaned = cleaned.slice(0, matchIndex).trim();
      break;
    }
  }

  const normalized = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  return normalized || NOTES_FALLBACK;
}

function removeSummaryDuplication(notes: string, summary: string): string {
  const normalizedNotes = notes.toLowerCase();
  const normalizedSummary = summary.replace(/…$/, "").toLowerCase();

  if (normalizedSummary.length > 40 && normalizedNotes.startsWith(normalizedSummary)) {
    return notes.slice(summary.replace(/…$/, "").length).trimStart() || notes;
  }

  return notes;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function linkifyText(input: string): string {
  const escaped = escapeHtml(input);
  return escaped.replace(/(https?:\/\/[^\s<]+)/gi, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

function formatNotesHtml(notesText: string, summary: string): string {
  const deduped = removeSummaryDuplication(notesText, summary);
  const paragraphs = deduped
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return `<p>${escapeHtml(NOTES_FALLBACK)}</p>`;
  }

  return paragraphs
    .map((paragraph) => `<p>${linkifyText(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

function extractTagValue(source: string, tagName: string): string | undefined {
  const match = source.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match?.[1]?.trim();
}

function extractAttribute(source: string, tagName: string, attributeName: string): string | undefined {
  const match = source.match(
    new RegExp(`<${tagName}\\b[^>]*\\b${attributeName}="([^"]+)"`, "i")
  );
  return match?.[1]?.trim();
}

function slugify(input: string): string {
  return decodeHtmlEntities(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "episode";
}

function truncateText(input: string, limit = 180): string {
  if (input.length <= limit) return input;
  return `${input.slice(0, limit).trimEnd()}…`;
}

function formatPublishedDate(dateInput?: string): string {
  if (!dateInput) return "Unknown date";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export async function getLatestPodcastEpisodes(maxResults = 3): Promise<MediaCardItem[]> {
  const feedUrl = import.meta.env.PODCAST_FEED_URL as string | undefined ?? DEFAULT_PODCAST_FEED_URL;

  try {
    const response = await fetch(feedUrl);

    if (!response.ok) {
      console.warn(`[podcast] Feed request failed with ${response.status} — returning empty list.`);
      return [];
    }

    const xml = await response.text();
    const feedImage =
      extractAttribute(xml, "itunes:image", "href") ??
      extractTagValue(xml, "url") ??
      "/web-logo.png";

    const items = Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi))
      .map((match) => match[0])
      .sort((leftItem, rightItem) => {
        const leftDate = Date.parse(
          extractTagValue(leftItem, "pubDate") ?? extractTagValue(leftItem, "dc:date") ?? ""
        );
        const rightDate = Date.parse(
          extractTagValue(rightItem, "pubDate") ?? extractTagValue(rightItem, "dc:date") ?? ""
        );

        if (Number.isNaN(leftDate)) return 1;
        if (Number.isNaN(rightDate)) return -1;
        return rightDate - leftDate;
      })
      .slice(0, maxResults);

    return items
      .map((itemXml) => {
        const title = normalizeText(extractTagValue(itemXml, "title")) || "Untitled podcast episode";
        const notesSource =
          extractTagValue(itemXml, "content:encoded") ??
          extractTagValue(itemXml, "description") ??
          extractTagValue(itemXml, "itunes:summary") ??
          "";
        const link = normalizeText(extractTagValue(itemXml, "link"));
        const thumbnail =
          extractAttribute(itemXml, "itunes:image", "href") ??
          feedImage;
        const publishedAt = extractTagValue(itemXml, "pubDate") ?? extractTagValue(itemXml, "dc:date");
        const audioUrl = extractAttribute(itemXml, "enclosure", "url");
        const slug = slugify(title);
        const notesText = sanitizeNotesText(notesSource);
        const summarySource = normalizeWhitespace(stripRawUrls(notesText));
        const summary = truncateAtWord(summarySource || notesText, 250);
        const description = truncateAtWord(summarySource || notesText, 180);
        const notesHtml = formatNotesHtml(notesText, summary);

        return {
          title,
          description,
          thumbnail,
          date: formatPublishedDate(publishedAt),
          platform: "Riverside",
          externalLink: `/podcast/${slug}`,
          slug,
          audioUrl,
          excerpt: notesText,
          sourceLink: link || feedUrl,
          summary,
          notesText,
          notesHtml,
          links: PODCAST_PLATFORM_LINKS
        } satisfies MediaCardItem;
      })
      .filter((episode) => Boolean(episode.title));
  } catch (error) {
    console.warn("[podcast] Feed fetch failed:", error);
    return [];
  }
}
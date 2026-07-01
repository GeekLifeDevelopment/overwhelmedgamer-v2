import type { MediaCardItem } from "../data/media";

type Thumbnails = {
  maxres?: { url?: string };
  high?: { url?: string };
  medium?: { url?: string };
  standard?: { url?: string };
  default?: { url?: string };
};

type PlaylistItemsResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: Thumbnails;
      resourceId?: { videoId?: string };
    };
  }>;
};

function pickThumbnail(thumbnails: Thumbnails): string {
  return (
    thumbnails.maxres?.url ??
    thumbnails.high?.url ??
    thumbnails.standard?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    "/web-logo.png"
  );
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

type SearchListResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: Thumbnails;
    };
  }>;
};

function getYouTubeApiKey(): string | undefined {
  return (
    (import.meta.env.YOUTUBE_API_KEY as string | undefined) ??
    (import.meta.env.YOUTUBE_DATA_API_KEY as string | undefined)
  );
}

function getYouTubeChannelId(): string | undefined {
  return import.meta.env.YOUTUBE_CHANNEL_ID as string | undefined;
}

function getYouTubeReviewsPlaylistId(): string | undefined {
  return import.meta.env.YOUTUBE_REVIEWS_PLAYLIST_ID as string | undefined;
}

function getYouTubeLivestreamPlaylistId(): string | undefined {
  return import.meta.env.YOUTUBE_LIVESTREAMS_PLAYLIST_ID as string | undefined;
}

export async function getLatestLivestreams(maxResults = 6): Promise<MediaCardItem[]> {
  const apiKey = getYouTubeApiKey();
  const channelId = getYouTubeChannelId();
  const playlistId = getYouTubeLivestreamPlaylistId();

  if (!apiKey || (!channelId && !playlistId)) {
    console.warn(
      "[youtube] Missing YOUTUBE_API_KEY/YOUTUBE_DATA_API_KEY or YOUTUBE_CHANNEL_ID/YOUTUBE_LIVESTREAMS_PLAYLIST_ID — skipping livestream fetch."
    );
    return [];
  }

  const url = channelId
    ? `https://www.googleapis.com/youtube/v3/search?${new URLSearchParams({
        part: "snippet",
        channelId,
        key: apiKey,
        eventType: "completed",
        type: "video",
        order: "date",
        maxResults: String(maxResults)
      }).toString()}`
    : `https://www.googleapis.com/youtube/v3/playlistItems?${new URLSearchParams({
        part: "snippet",
        playlistId: playlistId ?? "",
        key: apiKey,
        maxResults: String(maxResults)
      }).toString()}`;

  let json: SearchListResponse;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[youtube] Livestreams API responded with ${response.status} — returning empty list.`);
      return [];
    }
    json = (await response.json()) as SearchListResponse;
  } catch (err) {
    console.warn("[youtube] Livestream fetch failed:", err);
    return [];
  }

  const items = json.items ?? [];

  return items
    .filter((item) => {
      const videoId = item.id?.videoId ?? item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title?.toLowerCase() ?? "";
      return Boolean(videoId) && title !== "private video" && title !== "deleted video";
    })
    .map((item) => ({
      title: decodeHtmlEntities(item.snippet?.title?.trim() || "Untitled stream"),
      description: decodeHtmlEntities(
        item.snippet?.description?.trim() || "Past livestream from The Overwhelmed Gamer."
      ),
      thumbnail: pickThumbnail(item.snippet?.thumbnails ?? {}),
      date: formatPublishedDate(item.snippet?.publishedAt),
      platform: "YouTube Live",
      externalLink: `https://www.youtube.com/watch?v=${item.id?.videoId ?? item.snippet?.resourceId?.videoId}`
    }));
}

export async function getLatestVideos(maxResults = 6): Promise<MediaCardItem[]> {
  const apiKey = getYouTubeApiKey();
  const playlistId = getYouTubeReviewsPlaylistId();

  if (!apiKey || !playlistId) {
    console.warn(
      "[youtube] Missing YOUTUBE_API_KEY/YOUTUBE_DATA_API_KEY or YOUTUBE_REVIEWS_PLAYLIST_ID — skipping API fetch. " +
      "Add these to your .env file to load live review videos."
    );
    return [];
  }

  const params = new URLSearchParams({
    part: "snippet",
    playlistId,
    maxResults: String(maxResults),
    key: apiKey
  });

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;

  let json: PlaylistItemsResponse;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[youtube] API responded with ${response.status} — returning empty list.`);
      return [];
    }
    json = (await response.json()) as PlaylistItemsResponse;
  } catch (err) {
    console.warn("[youtube] Fetch failed:", err);
    return [];
  }

  const items = json.items ?? [];

  return items
    .filter((item) => {
      const videoId = item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title?.toLowerCase() ?? "";
      return Boolean(videoId) && title !== "private video" && title !== "deleted video";
    })
    .map((item) => ({
      title: decodeHtmlEntities(item.snippet?.title?.trim() || "Untitled video"),
      description: decodeHtmlEntities(
        item.snippet?.description?.trim() || "New upload from The Overwhelmed Gamer."
      ),
      thumbnail: pickThumbnail(item.snippet?.thumbnails ?? {}),
      date: formatPublishedDate(item.snippet?.publishedAt),
      platform: "YouTube",
      externalLink: `https://www.youtube.com/watch?v=${item.snippet?.resourceId?.videoId}`
    }));
}

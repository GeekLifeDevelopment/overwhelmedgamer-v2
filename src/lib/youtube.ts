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

type PlaylistsResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
    };
  }>;
  nextPageToken?: string;
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

function getYouTubeLatestVideosPlaylistIds(): string[] {
  const csv = import.meta.env.YOUTUBE_LATEST_VIDEOS_PLAYLIST_IDS as string | undefined;
  const csvIds = csv
    ? csv
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const namedIds = [
    import.meta.env.YOUTUBE_GAMING_DISCUSSION_PLAYLIST_ID as string | undefined,
    import.meta.env.YOUTUBE_LATE_TO_THE_GAME_PLAYLIST_ID as string | undefined,
    (import.meta.env.YOUTUBE_HOMEBREW_INDIE_HEROS_PLAYLIST_ID as string | undefined) ??
      (import.meta.env.YOUTUBE_HOMEBREW_INDIE_HEROES_PLAYLIST_ID as string | undefined)
  ].filter((value): value is string => Boolean(value));

  return [...new Set([...csvIds, ...namedIds])];
}

const TARGET_LATEST_VIDEO_PLAYLIST_MATCHERS = [
  {
    role: "gaming-discussion",
    matches: (name: string) => name.includes("gaming") && name.includes("discussion")
  },
  {
    role: "late-to-the-game",
    matches: (name: string) => name.includes("late") && name.includes("game")
  },
  {
    role: "homebrew-indie-heros",
    matches: (name: string) =>
      name.includes("homebrew") &&
      name.includes("indie") &&
      (name.includes("heros") || name.includes("heroes"))
  }
] as const;

function normalizePlaylistName(name?: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function discoverLatestVideoPlaylistIds(
  apiKey: string,
  channelId: string
): Promise<string[]> {
  const discoveredByRole = new Map<string, string>();
  let pageToken: string | undefined;
  let pageCount = 0;

  while (pageCount < 4) {
    const params = new URLSearchParams({
      part: "snippet",
      channelId,
      maxResults: "50",
      key: apiKey
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const url = `https://www.googleapis.com/youtube/v3/playlists?${params.toString()}`;

    let json: PlaylistsResponse;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(
          `[youtube] Playlist discovery responded with ${response.status} — skipping discovery.`
        );
        return [];
      }

      json = (await response.json()) as PlaylistsResponse;
    } catch (err) {
      console.warn("[youtube] Playlist discovery failed:", err);
      return [];
    }

    for (const item of json.items ?? []) {
      const normalizedTitle = normalizePlaylistName(item.snippet?.title);
      const playlistId = item.id;
      if (!playlistId) {
        continue;
      }

      for (const matcher of TARGET_LATEST_VIDEO_PLAYLIST_MATCHERS) {
        if (matcher.matches(normalizedTitle)) {
          discoveredByRole.set(matcher.role, playlistId);
        }
      }
    }

    if (discoveredByRole.size === TARGET_LATEST_VIDEO_PLAYLIST_MATCHERS.length) {
      break;
    }

    pageToken = json.nextPageToken;
    if (!pageToken) {
      break;
    }

    pageCount += 1;
  }

  return [...new Set(discoveredByRole.values())];
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
  const channelId = getYouTubeChannelId();
  const configuredPlaylistIds = getYouTubeLatestVideosPlaylistIds();
  let playlistIds = configuredPlaylistIds;

  if (apiKey && channelId) {
    const discoveredPlaylistIds = await discoverLatestVideoPlaylistIds(apiKey, channelId);
    playlistIds = [...new Set([...configuredPlaylistIds, ...discoveredPlaylistIds])];
  }

  if (!apiKey || playlistIds.length === 0) {
    console.warn(
      "[youtube] Missing YOUTUBE_API_KEY/YOUTUBE_DATA_API_KEY or latest-videos playlist IDs — skipping API fetch. " +
      "Add YOUTUBE_LATEST_VIDEOS_PLAYLIST_IDS (comma-separated), set the three specific playlist vars, or provide YOUTUBE_CHANNEL_ID so playlists can be discovered by name."
    );
    return [];
  }

  const perPlaylistLimit = Math.max(maxResults, 6);
  const playlistResponses = await Promise.all(
    playlistIds.map(async (playlistId) => {
      const params = new URLSearchParams({
        part: "snippet",
        playlistId,
        maxResults: String(perPlaylistLimit),
        key: apiKey
      });

      const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(
            `[youtube] API responded with ${response.status} for playlist ${playlistId} — skipping this playlist.`
          );
          return [] as NonNullable<PlaylistItemsResponse["items"]>;
        }
        const json = (await response.json()) as PlaylistItemsResponse;
        return json.items ?? [];
      } catch (err) {
        console.warn(`[youtube] Fetch failed for playlist ${playlistId}:`, err);
        return [] as NonNullable<PlaylistItemsResponse["items"]>;
      }
    })
  );

  const dedupedVideos = new Map<
    string,
    {
      title: string;
      description: string;
      thumbnail: string;
      publishedAt?: string;
      externalLink: string;
    }
  >();

  for (const items of playlistResponses) {
    for (const item of items) {
      const videoId = item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title?.toLowerCase() ?? "";

      if (!videoId || title === "private video" || title === "deleted video") {
        continue;
      }

      if (dedupedVideos.has(videoId)) {
        continue;
      }

      dedupedVideos.set(videoId, {
        title: decodeHtmlEntities(item.snippet?.title?.trim() || "Untitled video"),
        description: decodeHtmlEntities(
          item.snippet?.description?.trim() || "New upload from The Overwhelmed Gamer."
        ),
        thumbnail: pickThumbnail(item.snippet?.thumbnails ?? {}),
        publishedAt: item.snippet?.publishedAt,
        externalLink: `https://www.youtube.com/watch?v=${videoId}`
      });
    }
  }

  return [...dedupedVideos.values()]
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, maxResults)
    .map((video) => ({
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      date: formatPublishedDate(video.publishedAt),
      platform: "YouTube",
      externalLink: video.externalLink
    }));
}

# The Overwhelmed Gamer Web

Astro + React + Tailwind homepage for The Overwhelmed Gamer.

## Local Development

Install dependencies and start the dev server:

```sh
npm install
npm run dev
```

## Build Commands

```sh
npm run build
npm run preview
```

## YouTube Data API Build-Time Integration

Homepage media sections are fetched at build time using playlist IDs:

- Latest Reviews
- Recent Livestreams
- Video Podcast Episodes

The build uses a local cache file at `.cache/youtube-homepage.json` to reduce API requests.

### Required Environment Variables

Copy `.env.example` to `.env` and fill values:

- `YOUTUBE_DATA_API_KEY`
- `YOUTUBE_REVIEWS_PLAYLIST_ID`
- `YOUTUBE_LIVESTREAMS_PLAYLIST_ID`
- `YOUTUBE_PODCAST_PLAYLIST_ID`

### Optional Environment Variables

- `YOUTUBE_HOMEPAGE_LIMIT`
	- Clamped between 3 and 6
	- Default is 3
- `YOUTUBE_CACHE_TTL_MINUTES`
	- Default is 45 minutes

If any required YouTube variable is missing or the API request fails, homepage sections fall back to local placeholder data in `src/data/media.ts`.

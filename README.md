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

- Latest Videos
- Recent Livestreams
- Video Podcast Episodes

The build uses a local cache file at `.cache/youtube-homepage.json` to reduce API requests.

### Required Environment Variables

Copy `.env.example` to `.env` and fill values:

- `YOUTUBE_API_KEY` or `YOUTUBE_DATA_API_KEY`
- One of:
	- `YOUTUBE_LATEST_VIDEOS_PLAYLIST_IDS` (comma-separated playlist IDs)
	- `YOUTUBE_GAMING_DISCUSSION_PLAYLIST_ID` + `YOUTUBE_LATE_TO_THE_GAME_PLAYLIST_ID` + `YOUTUBE_HOMEBREW_INDIE_HEROS_PLAYLIST_ID`
	- `YOUTUBE_CHANNEL_ID` (for auto-discovery of playlist IDs by playlist name)
- `YOUTUBE_CHANNEL_ID` or `YOUTUBE_LIVESTREAMS_PLAYLIST_ID`

### Optional Environment Variables

- `YOUTUBE_HOMEPAGE_LIMIT`
	- Clamped between 3 and 6
	- Default is 3
- `YOUTUBE_CACHE_TTL_MINUTES`
	- Default is 45 minutes

If any required YouTube variable is missing or the API request fails, homepage sections fall back to local placeholder data in `src/data/media.ts`.

The latest videos section combines videos from your configured playlists, sorts by publish date, and shows the newest uploads overall. If no latest-video playlist IDs are configured, it will attempt to discover the playlists by name from your channel: Gaming Discussion, Late to the Game, and Homebrew & Indie Heros. The recent livestreams section prefers the channel ID search API, but will fall back to the livestream playlist if you provide one instead.

export type MediaCardItem = {
  title: string;
  description: string;
  thumbnail: string;
  date: string;
  platform: string;
  externalLink: string;
  slug?: string;
  audioUrl?: string;
  excerpt?: string;
  sourceLink?: string;
  summary?: string;
  notesText?: string;
  notesHtml?: string;
};

export const latestYouTubeVideos: MediaCardItem[] = [
  {
    title: "5 Builds That Save You 10+ Hours This Week",
    description:
      "Loadout shortcuts and route decisions that help you progress faster on limited play time.",
    thumbnail: "/web-logo.png",
    date: "May 9, 2026",
    platform: "YouTube",
    externalLink: "#"
  },
  {
    title: "No-Spoiler First Impressions: Iron Horizon",
    description:
      "A quick buyer-readiness review focused on game feel, pacing, and quality-of-life details.",
    thumbnail: "/web-logo.png",
    date: "May 6, 2026",
    platform: "YouTube",
    externalLink: "#"
  },
  {
    title: "Weekend Raid Prep in Under 20 Minutes",
    description:
      "Build prep checklist and gear priorities for players trying to avoid wasted weekend sessions.",
    thumbnail: "/web-logo.png",
    date: "May 4, 2026",
    platform: "YouTube",
    externalLink: "#"
  }
];

export const recentLivestreams: MediaCardItem[] = [
  {
    title: "Backlog Rescue Live: 3 Games, 1 Winner",
    description:
      "Live decision framework for picking one game to focus this week and dropping the rest.",
    thumbnail: "/web-logo.png",
    date: "May 8, 2026",
    platform: "Twitch",
    externalLink: "#"
  },
  {
    title: "Build Clinic: Community Character Reviews",
    description:
      "Audience-submitted builds tuned live for better survivability, speed, and quality-of-life.",
    thumbnail: "/web-logo.png",
    date: "May 3, 2026",
    platform: "Kick",
    externalLink: "#"
  },
  {
    title: "Sunday Challenge Run: Zero Grind Route",
    description:
      "A full challenge session focused on clear goals and minimal filler gameplay.",
    thumbnail: "/web-logo.png",
    date: "Apr 27, 2026",
    platform: "Twitch",
    externalLink: "#"
  }
];

export const latestPodcastEpisodes: MediaCardItem[] = [
  {
    title: "Episode 42: Burnout-Proof Your Backlog",
    description:
      "A practical framework for deciding what to play, what to skip, and what to shelve guilt-free.",
    thumbnail: "/web-logo.png",
    date: "May 7, 2026",
    platform: "Spotify + Apple",
    externalLink: "/podcast"
  },
  {
    title: "Episode 41: Co-op Nights That Actually Work",
    description:
      "Simple planning patterns that keep friend groups active and reduce schedule chaos.",
    thumbnail: "/web-logo.png",
    date: "Apr 30, 2026",
    platform: "Spotify + Apple",
    externalLink: "/podcast"
  },
  {
    title: "Episode 40: Gear FOMO vs Real Progress",
    description:
      "How to avoid chasing hype drops when your current build already solves your core goals.",
    thumbnail: "/web-logo.png",
    date: "Apr 23, 2026",
    platform: "Spotify + Apple",
    externalLink: "/podcast"
  }
];

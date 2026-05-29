export type NavItem = {
  label: string;
  href: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  tag: string;
};

export type YouTubeVideo = {
  title: string;
  duration: string;
  published: string;
  views: string;
  href: string;
};

export type PodcastEpisode = {
  title: string;
  summary: string;
  length: string;
  platform: string;
  href: string;
};

export type StreamSlot = {
  day: string;
  time: string;
  focus: string;
};

export type ToolTeaser = {
  name: string;
  summary: string;
  status: string;
  ctaLabel: string;
  ctaHref: string;
};

export type PromoBlock = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export const siteMeta = {
  title: "The Overwhelmed Gamer",
  description:
    "A modern creator hub for guides, streams, podcasts, and practical tools built for busy gamers.",
  ctaLabel: "Watch Latest Drops",
  ctaHref: "#videos"
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Podcast", href: "/podcast" },
  { label: "Tools", href: "/tools" },
  { label: "Merch", href: "/merch" },
  { label: "SUPPORT", href: "/support" },
  { label: "Contact", href: "/contact" }
];

export const featuredModules: FeatureItem[] = [
  {
    title: "Quick-Start Builds",
    description: "Loadout snapshots and starter paths that help you jump in fast.",
    tag: "Builds"
  },
  {
    title: "Weekend Challenges",
    description: "Short challenge queues tuned for 1-3 hour sessions.",
    tag: "Challenges"
  },
  {
    title: "No-Spoiler Reviews",
    description: "Clear verdicts, performance notes, and accessibility callouts.",
    tag: "Reviews"
  }
];

export const youtubeVideos: YouTubeVideo[] = [
  {
    title: "5 Builds That Save You 10+ Hours This Week",
    duration: "12:44",
    published: "2 days ago",
    views: "18K views",
    href: "#"
  },
  {
    title: "No-Spoiler First Impressions: Iron Horizon",
    duration: "9:18",
    published: "5 days ago",
    views: "9.7K views",
    href: "#"
  },
  {
    title: "Weekend Raid Prep in Under 20 Minutes",
    duration: "14:07",
    published: "1 week ago",
    views: "22K views",
    href: "#"
  }
];

export const podcastFeature: PromoBlock = {
  title: "The Overwhelmed Gamer Podcast",
  description:
    "Weekly episodes about better game choices, healthier play habits, and creator-side lessons from the grind.",
  ctaLabel: "Listen to Latest",
  ctaHref: "/podcast"
};

export const podcastEpisodes: PodcastEpisode[] = [
  {
    title: "Episode 42: Burnout-Proof Your Backlog",
    summary: "A practical framework for deciding what to play, skip, or shelve.",
    length: "43 min",
    platform: "Spotify + Apple",
    href: "#"
  },
  {
    title: "Episode 41: Co-op Nights That Actually Work",
    summary: "Scheduling systems and social cues for smoother group sessions.",
    length: "37 min",
    platform: "Spotify + Apple",
    href: "#"
  }
];

export const streamSchedule: StreamSlot[] = [
  { day: "Tuesday", time: "7:30 PM ET", focus: "Backlog Rescue Live" },
  { day: "Thursday", time: "8:00 PM ET", focus: "Build Clinic + Q&A" },
  { day: "Sunday", time: "6:00 PM ET", focus: "Community Challenge Run" }
];

export const gamingTools: ToolTeaser[] = [
  {
    name: "What Should I Play Next?",
    summary:
      "An intent-based picker that recommends your next game using your available time, preferred pace, and platform.",
    status: "SEO Tool Preview",
    ctaLabel: "View Tool Outline",
    ctaHref: "#"
  },
  {
    name: "Random NES Game Picker",
    summary:
      "A searchable retro discovery tool that surfaces high-value NES picks with concise context before you commit.",
    status: "SEO Tool Preview",
    ctaLabel: "See Concept",
    ctaHref: "#"
  },
  {
    name: "Backlog Game Randomizer",
    summary:
      "Filter your backlog by genre, length, and mood to generate a practical shortlist instead of endless scrolling.",
    status: "SEO Tool Preview",
    ctaLabel: "Explore Roadmap",
    ctaHref: "#"
  }
];

export const ogCollectorPromo: PromoBlock = {
  title: "OG Collector",
  description:
    "A practical companion for gamers who want one place to track their collection, check price trends, keep backlog priorities visible, and decide what to play next.",
  ctaLabel: "Explore OG Collector",
  ctaHref: "#"
};

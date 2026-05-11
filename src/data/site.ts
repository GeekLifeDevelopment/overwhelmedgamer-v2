export type NavItem = {
  label: string;
  href: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  tag: string;
};

export const siteMeta = {
  title: "The Overwhelmed Gamer",
  description:
    "A focused place for busy gamers to find practical guides, quick wins, and weekend-ready recommendations.",
  ctaLabel: "Start Exploring",
  ctaHref: "#content-grid"
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Guides", href: "#guides" },
  { label: "Reviews", href: "#reviews" },
  { label: "Community", href: "#community" }
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

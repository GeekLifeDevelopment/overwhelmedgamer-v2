import React from "react";

interface PodcastListenButtonProps {
  platform: "spotify" | "apple" | "youtube" | "rss";
  url: string;
  label?: string;
  ariaLabel?: string;
}

const platformConfig = {
  spotify: {
    label: "Spotify",
    className: "podcast-listen-spotify",
    ariaLabel: "Listen to this episode on Spotify",
    svg: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.389-.645.643-1.11.667-.418.024-.816-.156-1.089-.46l-5.458-6.778a.896.896 0 0 0-.707-.279H6.464c-.497 0-.895.396-.895.893v2.855c0 .497.398.893.895.893h.718c.497 0 .895-.396.895-.893V9.77l5.313 6.633c.232.257.564.408.912.408.359 0 .696-.161.922-.432l5.27-6.156c.18-.22.294-.513.294-.82V4.622c0-.496-.398-.893-.895-.893h-.718c-.497 0-.896.397-.896.893v8.236z" />
      </svg>
    )
  },
  apple: {
    label: "Apple Podcasts",
    className: "podcast-listen-apple",
    ariaLabel: "Listen to this episode on Apple Podcasts",
    svg: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21H9v2h6v-2h-2v-3.08A7 7 0 0 0 19 11h-2Z" />
      </svg>
    )
  },
  youtube: {
    label: "YouTube",
    className: "podcast-listen-youtube",
    ariaLabel: "Listen to this episode on YouTube",
    svg: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )
  },
  rss: {
    label: "RSS Feed",
    className: "podcast-listen-rss",
    ariaLabel: "Subscribe via RSS Feed",
    svg: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
        <circle cx="5" cy="5" r="1" />
      </svg>
    )
  }
};

export const PodcastListenButton: React.FC<PodcastListenButtonProps> = ({
  platform,
  url,
  label,
  ariaLabel
}) => {
  const config = platformConfig[platform];
  const displayLabel = label || config.label;
  const displayAriaLabel = ariaLabel || config.ariaLabel;

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={displayAriaLabel}
      className={`podcast-listen-button ${config.className}`}
    >
      <span className="podcast-listen-icon">{config.svg}</span>
      <span>{displayLabel}</span>
    </a>
  );
};

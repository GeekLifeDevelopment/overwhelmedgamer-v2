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
        <path d="M18.94 9.857c-.073-1.623-.526-3.125-1.308-4.385C16.562 3.49 15.265 2.547 13.605 2.28c-1.536-.256-3.108-.137-4.59.338-1.482.475-2.853 1.188-4.066 2.114C3.636 5.757 2.647 7.206 2.117 8.807c-.53 1.6-.627 3.287-.289 4.924.338 1.637.986 3.188 1.924 4.563.938 1.376 2.138 2.516 3.54 3.345.805.483 1.666.872 2.562 1.167.896.295 1.83.502 2.77.618.941.116 1.894.14 2.836.074.942-.068 1.873-.268 2.77-.6.897-.332 1.759-.786 2.566-1.352.807-.566 1.547-1.24 2.195-1.998 1.297-1.515 2.164-3.443 2.514-5.494.35-2.051.176-4.164-.52-6.142zm-6.16 8.35c-1.12 0-2.14-.445-2.902-1.167-.762-.722-1.192-1.7-1.192-2.728 0-1.028.43-2.006 1.192-2.728.762-.722 1.783-1.167 2.902-1.167 1.12 0 2.14.445 2.902 1.167.762.722 1.192 1.7 1.192 2.728 0 1.028-.43 2.006-1.192 2.728-.762.722-1.783 1.167-2.902 1.167z" />
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
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-white transition-all duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${config.className}`}
    >
      {config.svg}
      <span>{displayLabel}</span>
    </a>
  );
};

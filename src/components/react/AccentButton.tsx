import type { PropsWithChildren } from "react";

type AccentButtonProps = PropsWithChildren<{
  href: string;
}>;

export default function AccentButton({ href, children }: AccentButtonProps) {
  return (
    <a href={href} className="accent-button">
      <span>{children}</span>
    </a>
  );
}

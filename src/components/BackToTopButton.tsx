"use client";

type Props = { label: string };

/**
 * Tiny client island for the footer's "back to top" button.
 * Kept separate so the rest of Footer stays a server component.
 */
export default function BackToTopButton({ label }: Props) {
  return (
    <button
      type="button"
      className="footer-back-to-top"
      onClick={() =>
        typeof window !== "undefined" &&
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    >
      ↑ {label}
    </button>
  );
}

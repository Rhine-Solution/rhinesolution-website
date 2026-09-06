import type { Metadata, Viewport } from "next";
import "../../styles/spendtracker/spendtracker.css";

export const metadata: Metadata = {
  title: "SpendTracker — Cute Money Tracker",
  description:
    "A pastel, pixel-art money log. Track spending and savings with a tiny kitty.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='4' fill='%23ffc4e1'/%3E%3Crect x='3.5' y='3.5' width='9' height='9' rx='2' fill='%23ffd76b'/%3E%3Crect x='5' y='5' width='2' height='2' fill='%23fffbf3'/%3E%3Crect x='9' y='5' width='2' height='2' fill='%23fffbf3'/%3E%3Crect x='7' y='8' width='2' height='2' fill='%232f2a44'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdfbf7",
};

export default function SpendTrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
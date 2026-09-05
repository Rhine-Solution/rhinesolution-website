import type { Metadata, Viewport } from "next";
import "../../styles/globals.css";
import { rijksSans, rijksHeading, rijksSerif } from "@/lib/fonts";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070e24",
};

export const metadata: Metadata = {
  title: "Rhine Solution",
  description: "Rhine Solution builds bespoke websites, portfolios, and digital experiences.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rijksSans.variable} ${rijksHeading.variable} ${rijksSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
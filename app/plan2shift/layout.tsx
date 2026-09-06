import type { Metadata, Viewport } from "next";
import "../../styles/globals.css";
import { rijksSans, rijksHeading, rijksSerif } from "@/lib/fonts";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070e24",
};

export const metadata: Metadata = {
  title: "PLAN2SHIFT — Product & Technical Book",
  description:
    "PLAN2SHIFT product and technical book: the pitch, product and technical layers — vision, market, roadmap, architecture, data model, security and operations.",
};

export default function Plan2ShiftLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rijksSans.variable} ${rijksHeading.variable} ${rijksSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
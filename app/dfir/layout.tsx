import type { Metadata } from "next";
import "../../styles/globals.css";
import { rijksSans, rijksHeading, rijksSerif } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "DFIR — Rhine Solution",
  description: "Digital forensics and incident response resources by Rhine Solution.",
};

export default function DfirLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rijksSans.variable} ${rijksHeading.variable} ${rijksSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
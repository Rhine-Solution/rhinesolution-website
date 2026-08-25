import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rhine Solution — Custom Web Development",
  description: "Rhine Solution builds custom web applications, portfolios, and digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

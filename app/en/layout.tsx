import type { Metadata } from "next";
import "../../styles/globals.css";
import { ThemeProvider } from "../../src/components/ThemeProvider";

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
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

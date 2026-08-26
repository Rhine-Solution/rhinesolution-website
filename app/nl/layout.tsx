import type { Metadata } from "next";
import "../../styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Rhine Solution — Aangepaste webontwikkeling",
  description: "Rhine Solution bouwt aangepaste webapplicaties, portfolio's en digitale ervaringen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "../../styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeScript } from "@/components/ThemeScript";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rhinesolution.com"),
  title: { default: "Rhine Solution — Custom Web Development", template: "%s | Rhine Solution" },
  description: "Custom web applications, portfolios, and digital experiences crafted with care.",
  openGraph: {
    type: "website",
    siteName: "Rhine Solution",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "nl" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.variable} ${cormorant.variable}`}>
        <a href="#main" className="skip-link">Skip to main content</a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

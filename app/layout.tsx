import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import SceneManager from "@/components/scene/SceneManager";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import CustomCursor from "@/components/CustomCursor";
import IntroLoader from "@/components/IntroLoader";
import JsonLd, { siteJsonLd } from "@/components/JsonLd";

const rijksSans = localFont({
  src: "../fonts/rijksoverheids-sans-text-regular.ttf",
  variable: "--font-rijks-sans",
});

const rijksHeading = localFont({
  src: "../fonts/rijksoverheids-heading-bold.ttf",
  variable: "--font-rijks-heading",
});

const rijksSerif = localFont({
  src: [
    {
      path: "../fonts/rijksoverheids-serif-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/rijksoverheids-serif-italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-rijks-serif",
});

const SITE = "https://rhinesolution.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070e24",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Rhine Solution",
    template: "%s — Rhine Solution",
  },
  description:
    "Rhine Solution builds bespoke websites, portfolios, and digital experiences. Custom development, motion design, and a touch of WebGL magic.",
  applicationName: "Rhine Solution",
  keywords: [
    "Rhine Solution",
    "web development",
    "portfolio",
    "digital experiences",
    "WebGL",
    "motion design",
    "custom websites",
  ],
  authors: [{ name: "Rhine Solution" }],
  creator: "Rhine Solution",
  publisher: "Rhine Solution",
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      nl: "/nl",
      de: "/de",
      fr: "/fr",
      es: "/es",
      it: "/it",
      zh: "/zh",
      "x-default": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Rhine Solution",
    title: "Rhine Solution",
    description:
      "Custom web development, portfolios, and digital experiences.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rhine Solution",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rhine Solution",
    description: "Custom web development, portfolios, and digital experiences.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rijksSans.variable} ${rijksHeading.variable} ${rijksSerif.variable}`} suppressHydrationWarning>
      <body>
        <JsonLd data={siteJsonLd()} />
        <SceneManager />
        <SmoothScrollProvider />
        <CustomCursor />
        <IntroLoader />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import SceneManager from "@/components/scene/SceneManager";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import AudioCues from "@/components/AudioCues";
import CustomCursor from "@/components/CustomCursor";
import IntroLoader from "@/components/IntroLoader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
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
        url: "/og-image.svg",
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
    images: ["/og-image.svg"],
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
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body>
        <SceneManager />
        <SmoothScrollProvider />
        <AudioCues />
        <CustomCursor />
        <IntroLoader />
        {children}
      </body>
    </html>
  );
}

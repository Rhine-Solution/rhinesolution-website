import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Rhine Solution",
  description: "Custom web development, portfolios, and digital experiences",
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
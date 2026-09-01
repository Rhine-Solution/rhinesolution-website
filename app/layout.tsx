import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";

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
        <script
          dangerouslySetInnerHTML={{
            __html: "(function(){try{var t=window.localStorage.getItem('rhine-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
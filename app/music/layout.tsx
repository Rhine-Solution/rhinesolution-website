import "../../styles/music/music.css";
import { Inter, Cormorant_Garamond } from "next/font/google";
import MusicNav from "./MusicNav";
import MusicFooter from "./MusicFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata = {
  title: "Music Trends Local — Rhine Solution",
  description:
    "Discover top songs, artists, and genres in electronic, synthwave, and cyberpunk music. Built by Rhine Solution.",
  keywords: ["music", "synthwave", "cyberpunk", "electronic", "music portal"],
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`music-body ${inter.variable} ${cormorant.variable}`}>
      <a
        href="#music-main"
        className="skip-link"
        style={{
          position: "absolute",
          top: "-100px",
          left: "1rem",
          background: "var(--color-accent)",
          color: "var(--color-primary-fg)",
          padding: "0.5rem 1rem",
          zIndex: 1000,
        }}
      >
        Skip to main content
      </a>
      <MusicNav />
      <main id="music-main" style={{ flex: 1 }}>
        {children}
      </main>
      <MusicFooter />
    </div>
  );
}
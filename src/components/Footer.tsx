import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <Link href="/" className="back-link">
          ← Back to Rhine Solution
        </Link>
        <ThemeToggle className="theme-toggle" />
      </div>
    </footer>
  );
}

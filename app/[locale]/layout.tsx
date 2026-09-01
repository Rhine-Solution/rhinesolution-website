import type { Metadata } from "next";
import "../../styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getContent } from "@/lib/i18n";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = getContent(locale);
  return {
    title: {
      default: "Rhine Solution",
      template: "%s — Rhine Solution",
    },
    description: content.brand.tagline,
  };
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
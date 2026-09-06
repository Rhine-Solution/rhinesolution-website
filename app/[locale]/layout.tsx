import type { Metadata, Viewport } from "next";
import "../../styles/globals.css";
import { getContent } from "@/lib/i18n";
import { rijksSans, rijksHeading, rijksSerif } from "@/lib/fonts";
import MobileHeader from "@/components/MobileHeader";
import MobileFooter from "@/components/MobileFooter";
import ChatWidget from "@/components/ChatWidget";
import CustomCursor from "@/components/CustomCursor";
import IntroLoader from "@/components/IntroLoader";
import JsonLd, { siteJsonLd } from "@/components/JsonLd";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070e24",
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

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  return (
    <html lang={locale} className={`${rijksSans.variable} ${rijksHeading.variable} ${rijksSerif.variable}`}>
      <body>
        <JsonLd data={siteJsonLd()} />
        <CustomCursor />
        <IntroLoader />
        <a className="skip-link" href="#main">
          {content.a11y.skip_to_content}
        </a>
        <MobileHeader locale={locale} />
        {children}
        <MobileFooter locale={locale} />
        <ChatWidget locale={locale} />
      </body>
    </html>
  );
}
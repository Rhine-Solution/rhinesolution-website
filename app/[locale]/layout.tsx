import type { Metadata } from "next";
import "../../styles/globals.css";
import { getContent } from "@/lib/i18n";
import MobileHeader from "@/components/MobileHeader";
import MobileFooter from "@/components/MobileFooter";
import ChatWidget from "@/components/ChatWidget";
import LocaleLang from "@/components/LocaleLang";

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

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  return (
    <>
      <LocaleLang locale={locale} />
      <a className="skip-link" href="#main">
        {content.a11y.skip_to_content}
      </a>
      <MobileHeader locale={locale} />
      {children}
      <MobileFooter locale={locale} />
      <ChatWidget locale={locale} />
    </>
  );
}

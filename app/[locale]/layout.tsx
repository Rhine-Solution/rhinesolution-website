import type { Metadata } from "next";
import "../../styles/globals.css";
import { getContent } from "@/lib/i18n";
import MobileHeader from "@/components/MobileHeader";
import MobileFooter from "@/components/MobileFooter";

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
  return (
    <>
      <MobileHeader locale={locale} />
      {children}
      <MobileFooter locale={locale} />
    </>
  );
}

import { getNewsFeedXml } from "@/lib/news";
import { getContent } from "@/lib/i18n";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const c = getContent(locale);
  const xml = getNewsFeedXml(locale, {
    title: c.news.title,
    description: c.news.subtitle,
  });
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
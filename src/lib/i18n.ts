import en from "../../content/en.json";
import nl from "../../content/nl.json";

export const locales = ["en", "nl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const contentByLocale: Record<Locale, typeof en> = { en, nl };

export function getContent(locale: string): typeof en {
  return isLocale(locale) ? contentByLocale[locale] : contentByLocale[defaultLocale];
}

export type ContentProject = {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  year: string;
  team?: string;
  live_url?: string;
};

export type ContentMember = {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  skills: string[];
  social: Record<string, string>;
};

const memberKeys: string[] = ["ragnarok", "zeromeister"];

export function getProjects(content: typeof en, keys: readonly string[]): ContentProject[] {
  return keys
    .map((key) => (content as unknown as Record<string, ContentProject | undefined>)[key])
    .filter((p): p is ContentProject => Boolean(p));
}

export function getProject(content: typeof en, slug: string): ContentProject | undefined {
  return getProjects(content, [`project_${slug}`])[0];
}

export function getMembers(content: typeof en): (ContentMember & { slug: string })[] {
  return memberKeys
    .map((key) => {
      const member = (content as unknown as Record<string, ContentMember | undefined>)[key];
      return member ? { ...member, slug: key } : undefined;
    })
    .filter((m): m is ContentMember & { slug: string } => Boolean(m));
}

export function getMember(content: typeof en, memberKey: string): ContentMember | undefined {
  return (content as unknown as Record<string, ContentMember | undefined>)[memberKey];
}
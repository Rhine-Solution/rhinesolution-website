export const socialNames: Record<string, string> = {
  github: "GitHub",
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  reddit: "Reddit",
  pinterest: "Pinterest",
};

export function socialLabel(name: string): string {
  return socialNames[name] ?? name;
}

export interface SocialEntry {
  name: string;
  href: string;
}

export function getCompanySocials(content: { brand: { social: Record<string, string> } }): SocialEntry[] {
  const social = content.brand?.social ?? {};
  return Object.entries(social).map(([name, href]) => ({ name, href }));
}
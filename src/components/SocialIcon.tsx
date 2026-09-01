import {
  FaGithub,
  FaXTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaRedditAlien,
  FaPinterestP,
} from "react-icons/fa6";

import type { IconType } from "react-icons";

const socialIcons: Record<string, IconType> = {
  github: FaGithub,
  x: FaXTwitter,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  reddit: FaRedditAlien,
  pinterest: FaPinterestP,
};

export default function SocialIcon({ name, size = 14 }: { name: string; size?: number }) {
  const Icon = socialIcons[name] ?? FaGithub;
  return <Icon size={size} aria-hidden="true" />;
}
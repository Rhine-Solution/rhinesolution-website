import type { IconType } from "react-icons";
import {
  FaWaveSquare,
  FaRobot,
  FaBolt,
  FaSkull,
  FaGhost,
  FaIndustry,
  FaPowerOff,
  FaRadio,
} from "react-icons/fa6";

const genreIcons: Record<string, IconType> = {
  synthwave: FaWaveSquare,
  cyberpunk: FaRobot,
  techno: FaBolt,
  darksynth: FaSkull,
  vaporwave: FaGhost,
  industrial: FaIndustry,
  ebm: FaPowerOff,
  retrowave: FaRadio,
};

export default function GenreIcon({ genreId, size = 32 }: { genreId: string; size?: number }) {
  const Icon = genreIcons[genreId] ?? FaWaveSquare;
  return <Icon size={size} aria-hidden="true" />;
}
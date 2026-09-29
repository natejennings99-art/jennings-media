import {
  Box,
  Camera,
  Clapperboard,
  Film,
  Globe,
  Images,
  KeyRound,
  LayoutTemplate,
  Moon,
  Plane,
  Ruler,
  Smartphone,
  Sparkles,
  Sunset,
  UserRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  plane: Plane,
  clapperboard: Clapperboard,
  film: Film,
  smartphone: Smartphone,
  box: Box,
  ruler: Ruler,
  sunset: Sunset,
  moon: Moon,
  globe: Globe,
  "layout-template": LayoutTemplate,
  "user-round": UserRound,
  images: Images,
  zap: Zap,
  "key-round": KeyRound,
};

export const ICON_NAMES = Object.keys(ICONS);

export function ServiceIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  const Icon = (name && ICONS[name]) || Sparkles;
  return <Icon className={className} aria-hidden strokeWidth={1.6} />;
}

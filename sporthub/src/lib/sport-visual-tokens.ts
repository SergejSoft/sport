import type { SportType as PrismaSportType } from "@prisma/client";

/**
 * Sport type union aligned with Prisma SportType enum.
 * Use this when typing class/API data.
 */
export type SportType = PrismaSportType;

/**
 * Keys for visual tokens: Prisma enum + sports that may be added to schema later.
 */
export type SportTypeKey =
  | SportType
  | "SURFING"
  | "SWIMMING"
  | "STANDUP_SUP";

export interface SportVisualToken {
  label: string;
  /** Icon identifier for UI (e.g. lucide or custom name). */
  icon: string;
  /** Filename (no extension) under public/sports, e.g. "padel" -> public/sports/padel.png */
  illustrationKey: string;
  /** Tailwind-compatible classes: background for badge/pill. */
  bgClass: string;
  /** Tailwind-compatible classes: text color. */
  textClass: string;
  /** Tailwind-compatible classes: border (optional). */
  borderClass: string;
}

/** Visual tokens per sport. Keys match Prisma SportType + future sports. */
export const SPORT_VISUAL_TOKENS: Record<SportTypeKey, SportVisualToken> = {
  PADEL: {
    label: "Padel",
    icon: "racket",
    illustrationKey: "padel",
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-800",
    borderClass: "border-emerald-200",
  },
  BEACH_TENNIS: {
    label: "Beach tennis",
    icon: "sun",
    illustrationKey: "beach-tennis",
    bgClass: "bg-amber-100",
    textClass: "text-amber-800",
    borderClass: "border-amber-200",
  },
  BEACH_VOLLEYBALL: {
    label: "Beach volleyball",
    icon: "volleyball",
    illustrationKey: "beach-volleyball",
    bgClass: "bg-orange-100",
    textClass: "text-orange-800",
    borderClass: "border-orange-200",
  },
  FOOTBALL: {
    label: "Football",
    icon: "football",
    illustrationKey: "football",
    bgClass: "bg-sky-100",
    textClass: "text-sky-800",
    borderClass: "border-sky-200",
  },
  YOGA: {
    label: "Yoga",
    icon: "flower",
    illustrationKey: "yoga",
    bgClass: "bg-violet-100",
    textClass: "text-violet-800",
    borderClass: "border-violet-200",
  },
  MOUNTAIN_BIKING: {
    label: "Mountain biking",
    icon: "bike",
    illustrationKey: "mountain-biking",
    bgClass: "bg-lime-100",
    textClass: "text-lime-800",
    borderClass: "border-lime-200",
  },
  HIKING: {
    label: "Hiking",
    icon: "mountain",
    illustrationKey: "hiking",
    bgClass: "bg-teal-100",
    textClass: "text-teal-800",
    borderClass: "border-teal-200",
  },
  DANCE_CLASSES: {
    label: "Dance classes",
    icon: "music",
    illustrationKey: "dance-classes",
    bgClass: "bg-pink-100",
    textClass: "text-pink-800",
    borderClass: "border-pink-200",
  },
  BRAZILIAN_JIUJITSU: {
    label: "Brazilian jiu-jitsu",
    icon: "shield",
    illustrationKey: "brazilian-jiujitsu",
    bgClass: "bg-slate-100",
    textClass: "text-slate-800",
    borderClass: "border-slate-200",
  },
  BOXING: {
    label: "Boxing",
    icon: "boxing",
    illustrationKey: "boxing",
    bgClass: "bg-red-100",
    textClass: "text-red-800",
    borderClass: "border-red-200",
  },
  SURFING: {
    label: "Surfing",
    icon: "waves",
    illustrationKey: "surfing",
    bgClass: "bg-cyan-100",
    textClass: "text-cyan-800",
    borderClass: "border-cyan-200",
  },
  SWIMMING: {
    label: "Swimming",
    icon: "waves",
    illustrationKey: "swimming",
    bgClass: "bg-blue-100",
    textClass: "text-blue-800",
    borderClass: "border-blue-200",
  },
  STANDUP_SUP: {
    label: "Stand-up paddle",
    icon: "waves",
    illustrationKey: "standup-sup",
    bgClass: "bg-indigo-100",
    textClass: "text-indigo-800",
    borderClass: "border-indigo-200",
  },
};

/** Default token when sport is unknown or not in map. Use for image fallback and labels. */
export const FALLBACK_SPORT_VISUAL: SportVisualToken = {
  label: "Fitness",
  icon: "activity",
  illustrationKey: "fitness-default",
  bgClass: "bg-gray-100",
  textClass: "text-gray-800",
  borderClass: "border-gray-200",
};

/**
 * Get visual token for a sport. Returns FALLBACK_SPORT_VISUAL for unknown sport.
 */
export function getSportVisual(sportType: string): SportVisualToken {
  const key = sportType as SportTypeKey;
  return SPORT_VISUAL_TOKENS[key] ?? FALLBACK_SPORT_VISUAL;
}

/** Path to sport illustration under public/sports (e.g. /sports/padel.png). */
export function getSportIllustrationPath(illustrationKey: string): string {
  return `/sports/${illustrationKey}.png`;
}

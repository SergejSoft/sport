import * as React from "react";
import { cn } from "@/lib/utils";

type IconProps = {
  className?: string
}

export function YogaIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <circle cx="20" cy="8" r="4" fill="currentColor" />
      <path
        d="M12 32L20 18L28 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 24H32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function BasketballIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="14"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path d="M6 20H34" stroke="currentColor" strokeWidth="2" />
      <path d="M20 6V34" stroke="currentColor" strokeWidth="2" />
      <path
        d="M10 9C14 14 14 26 10 31"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M30 9C26 14 26 26 30 31"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  )
}

export function RunningIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <circle cx="24" cy="6" r="3.5" fill="currentColor" />
      <path
        d="M16 16L20 12L26 14L30 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 28L18 20L22 22L28 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 36L16 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M22 36L28 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function TennisIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <circle
        cx="18"
        cy="18"
        r="12"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M8 12C12 18 12 24 6 30"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M28 6C22 12 22 24 30 24"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M28 28L36 36"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SwimmingIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M16 16L28 12L32 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 28Q8 24 12 28Q16 32 20 28Q24 24 28 28Q32 32 36 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4 34Q8 30 12 34Q16 38 20 34Q24 30 28 34Q32 38 36 34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function CyclingIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="28"
        r="7"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle
        cx="30"
        cy="28"
        r="7"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M10 28L18 14L26 14L30 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M18 14L22 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="22" cy="10" r="3" fill="currentColor" />
    </svg>
  )
}

export function BootcampIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <rect
        x="4"
        y="16"
        width="32"
        height="8"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect x="2" y="14" width="4" height="12" rx="2" fill="currentColor" />
      <rect x="34" y="14" width="4" height="12" rx="2" fill="currentColor" />
      <rect x="10" y="14" width="3" height="12" rx="1" fill="currentColor" />
      <rect x="27" y="14" width="3" height="12" rx="1" fill="currentColor" />
    </svg>
  )
}

export function AllSportsIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <path
        d="M20 6L24 14L32 15L26 21L28 30L20 26L12 30L14 21L8 15L16 14Z"
        fill="currentColor"
      />
    </svg>
  )
}

const iconMap: Record<string, React.FC<IconProps>> = {
  all: AllSportsIcon,
  yoga: YogaIcon,
  basketball: BasketballIcon,
  running: RunningIcon,
  tennis: TennisIcon,
  swimming: SwimmingIcon,
  cycling: CyclingIcon,
  bootcamp: BootcampIcon,
  // Prisma SportType enum (schema) – used by sporthub-preview categories
  PADEL: TennisIcon,
  BEACH_TENNIS: TennisIcon,
  BEACH_VOLLEYBALL: BasketballIcon,
  FOOTBALL: TennisIcon,
  YOGA: YogaIcon,
  MOUNTAIN_BIKING: CyclingIcon,
  HIKING: RunningIcon,
  DANCE_CLASSES: AllSportsIcon,
  BRAZILIAN_JIUJITSU: BootcampIcon,
  BOXING: BootcampIcon,
};

export function getSportIcon(sportId: string) {
  return iconMap[sportId] || AllSportsIcon;
}

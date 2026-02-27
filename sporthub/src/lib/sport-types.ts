import { SportType } from "@prisma/client";

export const SPORT_TYPE_LABELS: Record<SportType, string> = {
  PADEL: "Padel",
  BEACH_TENNIS: "Beach tennis",
  BEACH_VOLLEYBALL: "Beach volleyball",
  FOOTBALL: "Football",
  YOGA: "Yoga",
  MOUNTAIN_BIKING: "Mountain biking",
  HIKING: "Hiking",
  DANCE_CLASSES: "Dance classes",
  BRAZILIAN_JIUJITSU: "Brazilian jiu-jitsu",
  BOXING: "Boxing",
};

export const SPORT_TYPES = Object.entries(SPORT_TYPE_LABELS) as [SportType, string][];

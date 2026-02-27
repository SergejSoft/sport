export type SportCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type ActivityType =
  | "group-class"
  | "individual"
  | "bootcamp"
  | "tournament";

export type Activity = {
  id: string;
  title: string;
  type: ActivityType;
  sport: string;
  image: string;
  instructor: string;
  instructorAvatar: string;
  rating: number;
  reviewCount: number;
  location: string;
  date: string;
  time: string;
  duration: string;
  spotsLeft: number;
  totalSpots: number;
  price: number;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  description: string;
  tags: string[];
};

export type Booking = {
  id: string;
  activity: Activity;
  status: "upcoming" | "completed" | "cancelled";
  bookedAt: string;
};

/** Sport categories aligned with Prisma SportType enum (schema.prisma). */
export const categories: SportCategory[] = [
  { id: "all", name: "All", icon: "Flame", color: "bg-primary" },
  { id: "PADEL", name: "Padel", icon: "Padel", color: "bg-sport-teal" },
  { id: "BEACH_TENNIS", name: "Beach tennis", icon: "BeachTennis", color: "bg-sport-coral" },
  { id: "BEACH_VOLLEYBALL", name: "Beach volleyball", icon: "BeachVolleyball", color: "bg-sport-yellow" },
  { id: "FOOTBALL", name: "Football", icon: "Football", color: "bg-sport-teal" },
  { id: "YOGA", name: "Yoga", icon: "Yoga", color: "bg-sport-teal" },
  { id: "MOUNTAIN_BIKING", name: "Mountain biking", icon: "MountainBiking", color: "bg-sport-yellow" },
  { id: "HIKING", name: "Hiking", icon: "Hiking", color: "bg-sport-coral" },
  { id: "DANCE_CLASSES", name: "Dance classes", icon: "Dance", color: "bg-sport-coral" },
  { id: "BRAZILIAN_JIUJITSU", name: "Brazilian jiu-jitsu", icon: "BJJ", color: "bg-sport-navy" },
  { id: "BOXING", name: "Boxing", icon: "Boxing", color: "bg-sport-navy" },
];

export const activities: Activity[] = [
  {
    id: "1",
    title: "Morning Vinyasa Flow",
    type: "group-class",
    sport: "YOGA",
    image: "/images/yoga-class.jpg",
    instructor: "Sarah Chen",
    instructorAvatar: "SC",
    rating: 4.9,
    reviewCount: 128,
    location: "Zen Studio, Downtown",
    date: "Tomorrow",
    time: "7:00 AM",
    duration: "60 min",
    spotsLeft: 4,
    totalSpots: 20,
    price: 18,
    level: "All Levels",
    description:
      "Start your day with an energizing vinyasa flow class. We will move through sun salutations, standing poses, and balancing sequences to build strength and flexibility. Suitable for all levels with modifications offered.",
    tags: ["Flexibility", "Mindfulness", "Morning"],
  },
  {
    id: "2",
    title: "Padel Open Session",
    type: "group-class",
    sport: "PADEL",
    image: "/images/basketball.jpg",
    instructor: "Marcus Johnson",
    instructorAvatar: "MJ",
    rating: 4.7,
    reviewCount: 89,
    location: "Central Park Courts",
    date: "Today",
    time: "6:00 PM",
    duration: "90 min",
    spotsLeft: 6,
    totalSpots: 16,
    price: 12,
    level: "Intermediate",
    description:
      "Join our weekly pickup basketball league! Teams are balanced at the start of each session. Bring your A-game and meet fellow ballers in a friendly competitive environment.",
    tags: ["Team Sport", "Competitive", "Social"],
  },
  {
    id: "3",
    title: "HIIT Bootcamp Blast",
    type: "bootcamp",
    sport: "BOXING",
    image: "/images/bootcamp.jpg",
    instructor: "Jake Torres",
    instructorAvatar: "JT",
    rating: 4.8,
    reviewCount: 215,
    location: "Riverside Park",
    date: "Tomorrow",
    time: "6:30 AM",
    duration: "45 min",
    spotsLeft: 8,
    totalSpots: 30,
    price: 15,
    level: "All Levels",
    description:
      "High-intensity interval training in the great outdoors. Expect burpees, sprints, bodyweight exercises, and a whole lot of fun. All fitness levels welcome, we scale everything!",
    tags: ["HIIT", "Outdoor", "Full Body"],
  },
  {
    id: "4",
    title: "Beach Tennis Coaching",
    type: "individual",
    sport: "BEACH_TENNIS",
    image: "/images/tennis.jpg",
    instructor: "Ana Petrova",
    instructorAvatar: "AP",
    rating: 5.0,
    reviewCount: 64,
    location: "Green Valley Tennis Club",
    date: "Saturday",
    time: "10:00 AM",
    duration: "60 min",
    spotsLeft: 1,
    totalSpots: 1,
    price: 55,
    level: "Beginner",
    description:
      "One-on-one tennis coaching tailored to your skill level. Whether you are picking up a racket for the first time or refining your backhand, Ana will create a personalized plan to level up your game.",
    tags: ["1-on-1", "Personalized", "Skill Building"],
  },
  {
    id: "5",
    title: "Trail Hiking Group",
    type: "group-class",
    sport: "HIKING",
    image: "/images/running.jpg",
    instructor: "David Okafor",
    instructorAvatar: "DO",
    rating: 4.6,
    reviewCount: 176,
    location: "Harbor Trail",
    date: "Wednesday",
    time: "6:00 AM",
    duration: "45 min",
    spotsLeft: 15,
    totalSpots: 40,
    price: 8,
    level: "All Levels",
    description:
      "Join our community running group for a scenic 5K along the harbor. Pace groups available for all levels from walkers to speedsters. Coffee social after every run!",
    tags: ["Cardio", "Social", "Outdoor"],
  },
  {
    id: "6",
    title: "Brazilian Jiu-Jitsu Basics",
    type: "group-class",
    sport: "BRAZILIAN_JIUJITSU",
    image: "/images/swimming.jpg",
    instructor: "Coach Williams",
    instructorAvatar: "CW",
    rating: 4.5,
    reviewCount: 53,
    location: "Aquatic Center",
    date: "Thursday",
    time: "7:30 AM",
    duration: "60 min",
    spotsLeft: 10,
    totalSpots: 24,
    price: 14,
    level: "Intermediate",
    description:
      "Structured lap swimming with a coach on deck providing technique feedback and workout guidance. Lanes divided by pace. Great for improving your stroke and endurance.",
    tags: ["Endurance", "Technique", "Low Impact"],
  },
  {
    id: "7",
    title: "Mountain Biking Tour",
    type: "group-class",
    sport: "MOUNTAIN_BIKING",
    image: "/images/cycling.jpg",
    instructor: "Lisa Park",
    instructorAvatar: "LP",
    rating: 4.8,
    reviewCount: 142,
    location: "CycleFit Studio",
    date: "Today",
    time: "5:30 PM",
    duration: "50 min",
    spotsLeft: 3,
    totalSpots: 25,
    price: 20,
    level: "All Levels",
    description:
      "High-energy indoor cycling with pumping music and immersive lighting. Burn up to 600 calories in this rhythm-based ride. Clip-in shoes provided.",
    tags: ["Cardio", "High Energy", "Music"],
  },
  {
    id: "8",
    title: "Beach Volleyball Tournament",
    type: "tournament",
    sport: "BEACH_VOLLEYBALL",
    image: "/images/tennis.jpg",
    instructor: "Tournament Director",
    instructorAvatar: "TD",
    rating: 4.4,
    reviewCount: 38,
    location: "Green Valley Tennis Club",
    date: "Sunday",
    time: "9:00 AM",
    duration: "4 hrs",
    spotsLeft: 12,
    totalSpots: 32,
    price: 35,
    level: "Intermediate",
    description:
      "Singles round-robin tournament with prizes for top 3 finishers. Guaranteed minimum 3 matches. Light refreshments provided. USTA rated event.",
    tags: ["Competitive", "Tournament", "Prizes"],
  },
];

export const initialBookings: Booking[] = [
  {
    id: "b1",
    activity: activities[1],
    status: "upcoming",
    bookedAt: "2026-02-26T10:00:00Z",
  },
  {
    id: "b2",
    activity: activities[6],
    status: "upcoming",
    bookedAt: "2026-02-25T14:30:00Z",
  },
];

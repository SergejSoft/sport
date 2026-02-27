import Image from "next/image"
import { Search } from "lucide-react"

type HeroSectionProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function HeroSection({ searchQuery, onSearchChange }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-primary px-4 pb-10 pt-14">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-sport-yellow" />
        <div className="absolute -left-6 bottom-4 size-32 rounded-full bg-sport-teal" />
        <div className="absolute right-12 bottom-16 size-20 rounded-full bg-white" />
      </div>

      <div className="relative mx-auto max-w-lg">
        {/* Greeting */}
        <p className="mb-1 text-sm font-medium text-primary-foreground/70">
          Good morning, Alex
        </p>
        <h1 className="mb-2 text-2xl font-bold leading-tight text-primary-foreground text-balance">
          Find your next workout
        </h1>
        <p className="mb-6 text-sm text-primary-foreground/70">
          Group classes, training, and tournaments near you
        </p>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search sports, classes, locations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 w-full rounded-2xl border-0 bg-card pl-11 pr-4 text-sm text-card-foreground shadow-lg shadow-black/10 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sport-teal"
            aria-label="Search activities"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="relative mx-auto mt-6 flex max-w-lg justify-center gap-8">
        <div className="text-center">
          <p className="text-xl font-bold text-primary-foreground">200+</p>
          <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">
            Classes
          </p>
        </div>
        <div className="h-8 w-px bg-primary-foreground/20" />
        <div className="text-center">
          <p className="text-xl font-bold text-primary-foreground">50+</p>
          <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">
            Trainers
          </p>
        </div>
        <div className="h-8 w-px bg-primary-foreground/20" />
        <div className="text-center">
          <p className="text-xl font-bold text-primary-foreground">8</p>
          <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">
            Sports
          </p>
        </div>
      </div>
    </section>
  )
}

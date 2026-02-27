"use client"

import { categories } from "@/lib/data"
import { getSportIcon } from "@/components/sport-icons"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

type CategoryPillsProps = {
  selected: string
  onSelect: (id: string) => void
}

export function CategoryPills({ selected, onSelect }: CategoryPillsProps) {
  return (
    <ScrollArea className="w-full" aria-label="Sport categories">
      <div className="flex gap-2 px-4 pb-3 pt-1" role="tablist">
        {categories.map((cat) => {
          const Icon = getSportIcon(cat.id)
          const isActive = selected === cat.id
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(cat.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {cat.name}
            </button>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  )
}

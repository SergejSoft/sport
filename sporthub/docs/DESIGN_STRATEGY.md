# Design strategy

## Sport visual tokens

- **Source:** `src/lib/sport-visual-tokens.ts`
- **Purpose:** One place for sport-specific UI: label, icon name, illustration key, and Tailwind color classes (bg, text, border) so discovery and class detail stay consistent.
- **Usage:** `getSportVisual(sportType)` returns a token; use `token.label`, `token.bgClass`, `token.textClass`, `token.borderClass`, and `getSportIllustrationPath(token.illustrationKey)` for images.
- **Fallback:** Unknown or missing sport uses `FALLBACK_SPORT_VISUAL` (label "Fitness", illustrationKey `fitness-default`). Image fallback order: class image → category illustration → fitness-default path → inline placeholder.

## Assets

- **Illustrations:** `public/sports/` — PNGs named by `illustrationKey` (e.g. `padel.png`, `fitness-default.png`). See `public/sports/README.md`.

## Design system (future)

- **Tokens:** Extend `globals.css` / `@theme` with spacing, radii, shadows; keep sport tokens in `sport-visual-tokens.ts`.
- **Components:** Use `src/components/ui/` for primitives (Button, Card, Badge) that consume theme and sport tokens.
- **Icons:** Use the `icon` field from sport tokens when adding an icon library (e.g. Lucide) for consistent sport icons.

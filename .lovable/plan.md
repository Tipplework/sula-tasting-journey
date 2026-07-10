# Make "How to Taste" a fun interactive ritual

Right now the "How to taste" block on each wine card is a static 3-item list ("Swirl gently in the glass / Breathe in the aromas / Take a slow, thoughtful sip"). Someone actually at a tasting can't *do* anything with it — it reads as instructions on a page. The tiny uppercase "HOW TO TASTE" label on top also sits awkwardly against the bold serif tasting name and doesn't match the warmer, personal tone of the sommelier quote right above it.

## What changes

### 1. Turn the 3 steps into a guided ritual (interactive)

Replace the static `<ol>` in `src/components/WineCard.tsx` with a `TastingRitual` component that walks the taster through Swirl → Smell → Sip, one step at a time.

Behavior per step:
- **Big, tappable step card** — one step visible at a time, not all three at once. Full-width, ~110px tall, warm cream background, gold ring when active.
- **Animated glyph** on the left (Framer Motion):
  - Swirl → a wine glass icon that rotates gently in a loop
  - Smell → soft aroma "waves" rising from the glass (staggered opacity pulse)
  - Sip → a droplet that fills, then a subtle checkmark on completion
- **Verb + micro-coaching line**, e.g. "Swirl — 3 slow circles, wake it up." Copy stays short and second-person so it feels like the Sula Sun is next to them.
- **"Done" tap** advances to the next step. A slim 3-dot progress rail sits under the card. Tapping a completed dot lets them jump back.
- **On step 3 completion**, the card collapses into a compact "Ritual complete ✓ Swirl · Smell · Sip" summary chip and gently scrolls focus down to the quiz ("Which note stood out?"). This creates a real hand-off from *tasting* to *reflecting*.
- Progress persists per wine in `useTastingStore` (new `ritualStep` on the response) so going Back to a wine remembers where they were.
- Fully skippable — a subtle "Skip ritual" text link under the card for repeat tasters.

Accessibility: each step is a real `<button>` with `aria-label`, and the glyph animation respects `prefers-reduced-motion` (falls back to a static icon).

### 2. Fix the header copy

The current small-caps "HOW TO TASTE" label is generic and clashes with the elegant serif name above.

Replace it with a warmer, in-the-moment prompt tied to the ritual:

- Label above the ritual card: *"Your turn — 3 gentle steps"* (sentence case, italic serif, no all-caps)
- One-liner under it: *"Sula Sun will guide you. Tap Done when each feels right."*

This matches the sommelier voice already used in `SommelierQuote` and stops competing with the wine name typographically.

### 3. Mobile polish

- Ritual card sits inside the existing `px-5` content column so it aligns with everything else.
- Step glyph is 56×56, verb text is 17px semibold, coaching line 13px muted — comfortable on a 375px screen.
- "Done" button is the full width of the card's right column, min 44px tall.
- No layout thrash between steps: the card height is fixed so the page doesn't jump.

## Technical notes

- New file: `src/components/TastingRitual.tsx` — self-contained, receives `wineId` and `onComplete`, reads/writes ritual step via `useTastingStore`.
- Store change: add `ritualStep?: 0 | 1 | 2 | 3` to `WineResponse` in `src/store/tasting-store.ts` plus a `setRitualStep(wineId, step)` action. Existing sessions with no field default to step 0.
- `WineCard.tsx` swaps the old `<ol>` block for `<TastingRitual wineId={wine.id} onComplete={...} />` and drops the small-caps "How to taste" heading in favor of the new warmer label described above.
- Animations use `framer-motion` (already in the project) and `lucide-react` icons (`Wine`, `Wind`, `Droplet`, `Check`).
- No DB / backend changes. No changes to `wines.tastingSteps` data — the ritual uses a fixed Swirl/Smell/Sip sequence for consistency across all wines. The per-wine `tastingSteps` field is left in place for the admin catalogue.

## Out of scope for this round

- Haptics (would need a native shell)
- Timers per step ("hold for 5 seconds") — feels gimmicky; the taster sets the pace
- Reworking the sommelier quote card or the quiz section

Ready to build once you approve.

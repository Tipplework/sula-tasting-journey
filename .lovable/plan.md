

## Finalize Data Capture & Flow Logic

Strict patch — no UI changes. Updates the Sheets endpoint, makes rating fully optional (continue without it), adds Email as a mandatory final-form field, and ensures every step + final submission posts cleanly to Google Sheets.

### What changes

**1. Google Sheets endpoint (`src/lib/sheets-logger.ts`)**
- Replace the current `script.googleusercontent.com/macros/echo?...` URL with the new canonical endpoint:
  `https://script.google.com/macros/s/AKfycbybryQtmhHaX9W08ZCnIUC9uLCoXWpb8FDHzwRIp6rRCH3lhoiCoNFdO2KNAq1CaBB0/exec`
- Add `email` to the `SheetsPayload` interface.
- Keep `mode: "no-cors"`, no headers, fire-and-forget, localStorage retry queue — all unchanged.

**2. Rating becomes truly optional (`src/components/WineCard.tsx`)**
- Remove the two-tap "soft nudge that blocks once" pattern. Currently the first Continue tap with no rating shows a hint and returns without proceeding — this is a soft block.
- New behavior: if no rating, log a subtle inline hint (or one-time toast per wine) **but proceed immediately**. Mandatory check stays only on feelings.
- Pass `email` through to `logToSheets` from session (added below).

**3. Email field on final form (`src/pages/ResultsPage.tsx`)**
- Add an Email input directly under Name, matching the existing input styling, label pattern, spacing, and error treatment of the current Phone/City fields. No new components, no layout shift — slot into the same form column.
- Validation: required, standard email regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
- Submit button stays disabled until Name, Email, Phone (10 digits), City are all valid.
- On submit: call `logToSheets` with `name, email, phone, city` plus a `final_submit` event tag.

**4. Session store (`src/store/tasting-store.ts`)**
- Add `email?: string` to the session shape and a `setEmail` setter, mirroring the existing `setUserName` / `setPhone` / `setCity` pattern. No UI/store-shape upheaval — additive only.

**5. Scroll reset**
- Already handled via `useScrollTop` hook + `useEffect` on `wine.id` in `WineCard`. No change needed; verify it still fires on every step change after edits.

**6. Gesture + button parity**
- Already wired in `WineCard.tsx` — both `useSwipeNav.onSwipeLeft` and the Continue button call the same `handleContinue` (validation + log + scroll reset). No change needed.

### Files touched

```text
src/lib/sheets-logger.ts      → new endpoint URL, add email to payload type
src/store/tasting-store.ts    → add email field + setEmail setter
src/components/WineCard.tsx   → rating no longer blocks; pass email in logs
src/pages/ResultsPage.tsx     → add Email input, validate, include in submit
```

### Behavior matrix after patch

| Action | Feeling required | Rating required | API call |
|---|---|---|---|
| Continue / swipe on wine | Yes (toast block) | No (silent) | `event: wine_step` with wine, feeling, rating?, step |
| Final form submit | — | — | `event: final_submit` with name, email, phone, city |
| API failure | — | — | Queued in localStorage, retried silently next call |

### Out of scope (locked)

No changes to colors, typography, spacing, component structure, animations, or any other screen. Welcome, How-to-Enjoy, Flight Overview, Compare interstitial, and Admin pages are untouched.


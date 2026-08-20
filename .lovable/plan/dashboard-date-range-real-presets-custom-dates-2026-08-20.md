# Dashboard date range: real presets + custom dates

Right now the filter bar only offers Today / 7 days / 30 days / All, and "Today" is actually the last 24 hours. There's no way to look at a specific month or a custom window, and even on "All" the guest list is capped at the 200 most recent rows (that's why the bar reads "200 in view · 856 total guests").

## What changes

**Presets:** Today (calendar day, midnight to now), Yesterday, 7 days, 30 days, 90 days, This month, Last month, All time.

**Custom range:** a "Custom" chip opens two date inputs (From / To). Picking dates filters everything — tiles, funnel, ratings, wines, guest log, drawers — and the chip shows the chosen window, e.g. `1 Jul – 19 Aug`. To-date includes the whole day. Invalid ranges (from after to) are rejected with a toast.

**Range applies everywhere consistently:** the wine deep-dive drawer, guest log, recent events and all three CSV exports use the exact same window as the filter bar, including custom dates.

**Row caps raised:** the guest log now pulls up to 2,000 consent rows instead of 200, so a 30-day or all-time view isn't silently truncated. The counter reads `X guests (Y visits) in view · Z total` and warns when the cap is hit ("showing latest 2,000 — narrow the range or use CSV for the full set").

**Persistence:** the selected range (and custom dates) is remembered in the URL and on reload, so refreshing doesn't snap back to 7 days.

## Layout

```text
[⚲] Today  Yesterday  7d  30d  90d  This month  Last month  All  [ Custom: 1 Jul – 19 Aug ▾ ]
    All flights ▾   All devices ▾        135 guests (200 visits) in view · 856 total
```

## Technical notes

- `src/pages/AdminDashboard.tsx`: replace the `DateRange` string union with a `{ preset, from?, to? }` range object; rewrite `rangeStartIso` into a `rangeBounds()` helper returning `{ startIso, endIso }`, and apply both `gte`/`lte` to every query (overview fetch, exports, wine drawer).
- Consent overview `limit(200)` → `limit(2000)`; keep the exact head-count queries for the "total" figures.
- Range state synced to the URL query string (`?range=30d` / `?from=…&to=…`).
- No schema or backend change; all filtering stays in the existing queries.

## Out of scope

- No change to the CRM export columns added last turn.
- No change to how events are written.

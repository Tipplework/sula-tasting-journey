# Tasting Room Menu — four corrections

## 1. Vertical food photos stop breaking

The food photography is portrait, but every image frame in the menu is a wide 16:9 banner, so plates get cropped through the middle.

- Item detail panel: replace the 16:9 banner with a portrait-friendly frame (4:5 on mobile, capped by a max height so tall photos never push the text off screen), image centred with `object-cover` and a soft cream backdrop behind it.
- List tile thumbnail: keep it square (current 64px) but bump to a slightly taller 4:5 thumb so plated dishes read better, still centred.
- Keep the illustrated fallback art for items without photos, letterboxed inside the new frame.

## 2. Food comes right after Wine

Reorder the top-level menus everywhere to Wine → Food → Cocktails → Drinks:

- The four tiles on the menu selection screen.
- The sticky header switcher.
- The order categories appear in the Complete Menu view.

## 3. Registration is mandatory (no skip)

- Remove the "Skip to Menu" button from the welcome form.
- Require Name plus at least one contact — mobile number or email — and add an email field alongside the existing name/mobile fields (date of birth and marketing consent stay optional).
- Validation: name min 2 characters; if a mobile is entered it must be a valid 10-digit Indian number; if an email is entered it must be a valid address; show an inline error when neither contact is filled.
- The guest can only continue once the form saves. If the save call itself fails, show an error and let them retry rather than silently continuing.
- No dismiss-by-backdrop or Escape on this step, so the flow to the menu always passes through registration.

## 4. Landing screen matches the printed menu cover

Rebuild the landing to mirror the shared cover artwork:

- Cream background, small Tasting Room sun logo at top.
- Headline "TASTING ROOM" in the display face with "Menu" beneath it in the red/gold script, plus the gold underline stroke.
- Pouring bottle artwork top-right, the hand-holding-glass and vineyard-rows illustration filling the lower half edge to edge, matching the cover composition.
- Keep the existing "View Menu" button, the Nashik · Maharashtra · Est. 1999 line and the taxes/125 ml pour footnotes.
- Reuse the artwork already in the project (`art-tr-logo`, `art-cover-pour`, `art-glass-vineyard`, `art-hills`); no new colours or fonts.

## Technical notes

- Files touched: `src/pages/menu/MenuLandingPage.tsx`, `src/pages/menu/MenuSelectPage.tsx`, `src/components/menu/RegistrationModal.tsx`, `src/components/menu/MenuHeader.tsx`, `src/components/menu/MenuItemDetail.tsx`, `src/components/menu/MenuItemTile.tsx`, `src/lib/menu/groups.ts` (`SWITCHER_MODES` order only).
- Registration email is passed through the existing `log-guest` edge function payload; if the function does not yet accept an email field it gets added there and stored on the existing registrations table via a migration adding a nullable `email` column with the current grants/policies unchanged.
- No changes to scroll ownership, sticky offsets or the category rail behaviour.

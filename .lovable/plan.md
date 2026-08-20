# DPDP Privacy Consent on the Tasting Room Menu

Bring the same privacy-notice consent the wine flight welcome screen already has to the digital menu registration step.

## What the guest will see

On the menu registration screen (after tapping View Menu), below the Name / Mobile / Email fields:

- A required checkbox: "I agree to Sula Vineyards processing my information to personalise this tasting experience in accordance with the Privacy Notice." — "Privacy Notice" is an underlined link.
- Tapping the link opens the full Privacy Notice (Version 1.0.0 · Digital Personal Data Protection Act, 2023) as a scrollable sheet with the same nine sections used on the wine flight: About this tasting, Information we collect, Purpose, Storage, Retention, Your rights, Contact, Future integrations.
- The existing optional marketing checkbox ("I'd like to hear from Sula Vineyards…") stays as-is and remains optional.
- "Register & Continue" stays disabled until Name + one contact + the privacy consent are all present. If the box is unticked, an inline message asks the guest to accept the notice.

Styling stays in the menu's cream/gold/Oswald language — no redesign of the modal.

## Technical notes

- Reuse the notice copy: extract the section list from `src/components/PrivacyNoticeModal.tsx` into a shared constant so both the wine flight and the menu render identical text and version, then add a menu-styled `MenuPrivacyNotice` sheet that consumes it.
- `RegistrationModal.tsx`: add `privacyAccepted` state, gate submit on it, and render the checkbox + link.
- On successful registration, record consent through the existing `logConsent` helper (`src/lib/consent/log.ts`) with `source: "qr_digital_menu"` and the current privacy version, so menu consents land in the same `consent_logs` table the Privacy Center reads. The registration payload sent to the `log-guest` function also carries the privacy version and acceptance flag.
- No schema change is required for consent logging; the `log-guest` function keeps handling the guest PII write.

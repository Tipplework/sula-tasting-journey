/**
 * Single source of truth for the DPDP privacy notice copy, shared by the wine
 * flight welcome screen and the digital menu registration step so both always
 * present identical wording and version.
 */
export const PRIVACY_SECTIONS: { title: string; body: string }[] = [
  {
    title: "About this tasting",
    body: "This experience is offered by Sula Vineyards to personalise your in-venue wine tasting. It is an editorial guest experience, not a purchase or account signup.",
  },
  {
    title: "Information we collect",
    body: "The name you enter, the wine flight you choose, your tasting choices, and — with your consent — a phone number and email to send you future invitations. Optional analytics identify device type and language, never personal identifiers.",
  },
  {
    title: "Purpose",
    body: "To guide you through the tasting, remember your choices during this session, and — if you opt in — invite you to tastings, releases and events. We do not sell your data.",
  },
  {
    title: "Storage",
    body: "Session data lives in your browser. Any contact details you choose to share are stored securely on Sula Vineyards' managed infrastructure and access is restricted to authorised staff.",
  },
  {
    title: "Retention",
    body: "Session data is cleared when you clear your browser. Contact details are retained only while relevant to Sula Vineyards' hospitality and marketing programs and can be removed on request.",
  },
  {
    title: "Your rights",
    body: "You can request access to, correction of, or deletion of your personal information at any time. You can also withdraw consent for marketing communications.",
  },
  {
    title: "Contact",
    body: "For any privacy request, email privacy@sulavineyards.com — a member of our team will respond within a reasonable time.",
  },
  {
    title: "Future integrations",
    body: "Sula Vineyards may connect this experience with hospitality (HOST) or CRM systems to enhance guest service. Your consent choices carry across those systems and remain revocable.",
  },
];

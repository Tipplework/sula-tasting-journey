/**
 * Tracks how far a guest has come through the intro for this browsing session.
 * Session storage, so a fresh QR scan always sees the welcome once and never
 * twice within the same visit.
 */
const REGISTERED = "trMenuRegisteredV2";
const DISCLAIMER = "trMenuDisclaimerV2";

function read(key: string) {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function write(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* private browsing — the guest simply sees the step again */
  }
}

export const menuSession = {
  registrationDone: () => read(REGISTERED),
  markRegistrationDone: () => write(REGISTERED),
  disclaimerDone: () => read(DISCLAIMER),
  markDisclaimerDone: () => write(DISCLAIMER),
  introComplete: () => read(REGISTERED) && read(DISCLAIMER),
};

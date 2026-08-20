import { useState } from "react";
import { submitGuestRegistration } from "@/lib/menu/api";
import { toast } from "sonner";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { MenuPrivacyNotice } from "./MenuPrivacyNotice";
import { logConsent } from "@/lib/consent/log";
import { CURRENT_PRIVACY_VERSION } from "@/store/tasting-store";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Mandatory guest capture — the menu opens only once a name and at least one
 * contact (mobile or email) have been saved. There is no skip.
 */
export function RegistrationModal({ onDone }: { onDone: () => void }) {
  useScrollLock(true);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [consent, setConsent] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async () => {
    const next: Record<string, string> = {};
    const name = fullName.trim();
    const mail = email.trim();
    const digits = mobile.replace(/\D/g, "").slice(-10);
    if (name.length < 2) next.fullName = "Please enter your name.";
    if (!mobile.trim() && !mail)
      next.contact = "Please add a mobile number or an email address.";
    if (mobile.trim() && !/^[6-9]\d{9}$/.test(digits))
      next.mobile = "Enter a 10-digit Indian mobile number.";
    if (mail && !EMAIL_RE.test(mail)) next.email = "Enter a valid email address.";
    if ((day && !month) || (!day && month))
      next.birthday = "Please choose both a day and a month, or leave both blank.";
    if (!privacyAccepted)
      next.privacy = "Please accept the Privacy Notice to continue.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await submitGuestRegistration({
        fullName: name,
        mobile: mobile.trim() ? `+91${digits}` : null,
        email: mail || null,
        birthDay: day ? Number(day) : null,
        birthMonth: month ? Number(month) : null,
        marketingConsent: consent,
      });
      void logConsent({
        guestName: name,
        guestEmail: mail || undefined,
        guestPhone: mobile.trim() ? `+91${digits}` : undefined,
        flightId: null,
        consentVersion: CURRENT_PRIVACY_VERSION,
        privacyVersion: CURRENT_PRIVACY_VERSION,
        source: "qr_digital_menu",
      });
      toast.success("Thank you — enjoy your tasting.");
      onDone();
    } catch {
      toast.error("We couldn't save that. Please check your details and try again.");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "font-tr-body mt-1.5 min-h-12 w-full rounded-xl border border-tr-rule bg-white/70 px-4 text-[0.95rem] text-tr-ink outline-none placeholder:text-tr-body/45 focus:border-tr-gold";
  const label =
    "font-tr-display block text-[0.64rem] uppercase tracking-[0.2em] text-tr-black/65";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div aria-hidden="true" className="absolute inset-0 bg-tr-black/60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tr-reg-title"
        className="relative flex max-h-[92svh] w-full max-w-md flex-col rounded-t-3xl bg-tr-cream shadow-2xl sm:rounded-3xl"
      >
        <div className="px-6 pt-7">
          <h2
            id="tr-reg-title"
            className="font-tr-display text-[1.05rem] uppercase tracking-[0.14em] text-tr-black"
          >
            Welcome
          </h2>
          <p className="font-tr-body mt-1.5 text-[0.82rem] leading-relaxed text-tr-body">
            Please leave your details to view the menu — we'll also send you
            tasting invitations and harvest news.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          <div className="space-y-4">
            <div>
              <label className={label} htmlFor="tr-name">
                Full name
              </label>
              <input
                id="tr-name"
                className={field}
                value={fullName}
                autoComplete="name"
                maxLength={80}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
              {errors.fullName && (
                <p className="font-tr-body mt-1 text-[0.72rem] text-tr-red">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className={label} htmlFor="tr-mobile">
                Mobile number
              </label>
              <div className="mt-1.5 flex min-h-12 items-center gap-2 rounded-xl border border-tr-rule bg-white/70 px-4 focus-within:border-tr-gold">
                <span className="font-tr-body text-[0.95rem] text-tr-body">+91</span>
                <input
                  id="tr-mobile"
                  className="font-tr-body min-h-12 w-full bg-transparent text-[0.95rem] text-tr-ink outline-none placeholder:text-tr-body/45"
                  value={mobile}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={14}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="98765 43210"
                />
              </div>
              {errors.mobile && (
                <p className="font-tr-body mt-1 text-[0.72rem] text-tr-red">
                  {errors.mobile}
                </p>
              )}
            </div>

            <div>
              <label className={label} htmlFor="tr-email">
                Email address
              </label>
              <input
                id="tr-email"
                className={field}
                value={email}
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={200}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="font-tr-body mt-1 text-[0.72rem] text-tr-red">
                  {errors.email}
                </p>
              )}
            </div>

            {errors.contact && (
              <p className="font-tr-body text-[0.72rem] text-tr-red">
                {errors.contact}
              </p>
            )}

            <div>
              <span className={label}>Date of birth (optional)</span>
              <div className="flex gap-3">
                <select
                  aria-label="Birth day"
                  className={field}
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Birth month"
                  className={field}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              {errors.birthday && (
                <p className="font-tr-body mt-1 text-[0.72rem] text-tr-red">
                  {errors.birthday}
                </p>
              )}
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-tr-gold-deep"
                />
                <span className="font-tr-body text-[0.74rem] leading-relaxed text-tr-body">
                  I agree to Sula Vineyards processing my information to
                  personalise this tasting experience in accordance with the{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setPrivacyOpen(true);
                    }}
                    className="underline text-tr-ink"
                  >
                    Privacy Notice
                  </button>
                  .
                </span>
              </label>
              {errors.privacy && (
                <p className="font-tr-body mt-1 text-[0.72rem] text-tr-red">
                  {errors.privacy}
                </p>
              )}
            </div>

            <label className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-tr-olive"
              />
              <span className="font-tr-body text-[0.74rem] leading-relaxed text-tr-body">
                I'd like to hear from Sula Vineyards about tastings, events and
                offers.
              </span>
            </label>
          </div>
        </div>

        <div className="px-6 pb-7">
          <button
            type="button"
            disabled={busy || !privacyAccepted}
            onClick={submit}
            className="font-tr-display min-h-13 w-full rounded-full bg-tr-black py-4 text-[0.74rem] uppercase tracking-[0.2em] text-tr-cream disabled:opacity-60"
          >
            {busy ? "Saving…" : "Continue to Menu"}
          </button>
          <p className="font-tr-body mt-3 text-center text-[0.68rem] text-tr-body/70">
            Your details stay with Sula Vineyards.
          </p>
        </div>
      </div>
      {privacyOpen && <MenuPrivacyNotice onClose={() => setPrivacyOpen(false)} />}
    </div>
  );
}

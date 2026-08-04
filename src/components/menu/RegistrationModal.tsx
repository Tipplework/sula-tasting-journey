import { useState } from "react";
import { submitGuestRegistration } from "@/lib/menu/api";
import { toast } from "sonner";
import { useScrollLock } from "@/hooks/use-scroll-lock";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Entirely optional — a guest can always skip straight through to the menu. */
export function RegistrationModal({
  onDone,
}: {
  onDone: (registered: boolean) => void;
}) {
  useScrollLock(true);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async () => {
    const next: Record<string, string> = {};
    const name = fullName.trim();
    const digits = mobile.replace(/\D/g, "").slice(-10);
    if (name.length < 2) next.fullName = "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(digits))
      next.mobile = "Enter a 10-digit Indian mobile number.";
    if ((day && !month) || (!day && month))
      next.birthday = "Please choose both a day and a month, or leave both blank.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await submitGuestRegistration({
        fullName: name,
        mobile: `+91${digits}`,
        birthDay: day ? Number(day) : null,
        birthMonth: month ? Number(month) : null,
        marketingConsent: consent,
      });
      toast.success("Thank you — enjoy your tasting.");
      onDone(true);
    } catch {
      toast.error("We couldn't save that. Please continue to the menu.");
      onDone(false);
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
            Leave your details for tasting invitations and harvest news — or skip
            straight to the menu.
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
            disabled={busy}
            onClick={submit}
            className="font-tr-display min-h-13 w-full rounded-full bg-tr-black py-4 text-[0.74rem] uppercase tracking-[0.2em] text-tr-cream disabled:opacity-60"
          >
            {busy ? "Saving…" : "Register & Continue"}
          </button>
          <button
            type="button"
            onClick={() => onDone(false)}
            className="font-tr-display mt-2.5 min-h-12 w-full rounded-full border border-tr-rule py-3.5 text-[0.72rem] uppercase tracking-[0.2em] text-tr-body"
          >
            Skip to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

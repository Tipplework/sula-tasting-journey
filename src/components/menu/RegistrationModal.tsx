import { useState } from "react";
import { submitGuestRegistration } from "@/lib/menu/api";
import { toast } from "sonner";
import grapeDivider from "@/assets/menu/art-grape-divider.webp.asset.json";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Entirely optional — a guest can always skip straight through to the menu. */
export function RegistrationModal({
  onDone,
}: {
  onDone: (registered: boolean) => void;
}) {
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
    "font-tr-body w-full rounded-none border-0 border-b border-tr-rule bg-transparent px-0 py-2 text-[0.95rem] text-tr-ink outline-none placeholder:text-tr-body/50 focus:border-tr-gold";
  const label =
    "font-tr-display block text-[0.66rem] uppercase tracking-[0.2em] text-tr-black/70";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-tr-black/50 px-3 pb-3 pt-10 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tr-reg-title"
        className="max-h-full w-full max-w-md overflow-y-auto rounded-t-2xl bg-tr-cream p-6 shadow-2xl sm:rounded-2xl"
      >
        <img
          src={grapeDivider.url}
          alt=""
          aria-hidden="true"
          className="mx-auto mb-4 h-6 w-auto opacity-80"
        />
        <h2
          id="tr-reg-title"
          className="font-tr-display text-center text-[1.05rem] uppercase tracking-[0.16em] text-tr-black"
        >
          Join the Sula Family
        </h2>
        <p className="font-tr-body mt-2 text-center text-[0.8rem] leading-relaxed text-tr-body">
          Leave your details for tasting invitations and harvest news. Entirely
          optional.
        </p>

        <div className="mt-6 space-y-5">
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
              <p className="font-tr-body mt-1 text-[0.7rem] text-tr-red">
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className={label} htmlFor="tr-mobile">
              Mobile number
            </label>
            <div className="flex items-baseline gap-2">
              <span className="font-tr-body text-[0.95rem] text-tr-body">+91</span>
              <input
                id="tr-mobile"
                className={field}
                value={mobile}
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={14}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="98765 43210"
              />
            </div>
            {errors.mobile && (
              <p className="font-tr-body mt-1 text-[0.7rem] text-tr-red">
                {errors.mobile}
              </p>
            )}
          </div>

          <div>
            <span className={label}>Birthday (optional)</span>
            <div className="mt-1 flex gap-3">
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
              <p className="font-tr-body mt-1 text-[0.7rem] text-tr-red">
                {errors.birthday}
              </p>
            )}
          </div>

          <label className="flex items-start gap-2.5">
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

        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="font-tr-display mt-7 w-full rounded-full bg-tr-black px-6 py-3.5 text-[0.75rem] uppercase tracking-[0.22em] text-tr-cream disabled:opacity-60"
        >
          {busy ? "Saving…" : "Continue"}
        </button>
        <button
          type="button"
          onClick={() => onDone(false)}
          className="font-tr-body mt-3 w-full py-2 text-[0.78rem] tracking-wide text-tr-body underline underline-offset-4"
        >
          Skip to the menu
        </button>
      </div>
    </div>
  );
}

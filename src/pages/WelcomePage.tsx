import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTastingStore, CURRENT_PRIVACY_VERSION } from "@/store/tasting-store";
import { SommelierQuote } from "@/components/SommelierQuote";
import { FlightSelector } from "@/components/FlightSelector";
import { PrivacyNoticeModal } from "@/components/PrivacyNoticeModal";
import { CookieBanner } from "@/components/CookieBanner";
import { logConsent } from "@/lib/consent/log";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian mobile: optional +91 prefix, then a 10-digit number starting 6-9.
const PHONE_RE = /^(?:\+91)?[6-9]\d{9}$/;

function normalizePhone(raw: string): string {
  // Strip spaces, dashes, parentheses. Keep leading + only.
  const cleaned = raw.replace(/[\s\-()]/g, "");
  return cleaned;
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const { session, setSelectedFlight, setConsent, setGuestProfile } = useTastingStore();

  const [name, setName] = useState(session.userName);
  const [email, setEmail] = useState(session.email);
  const [phone, setPhone] = useState(session.phone);
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; phone?: boolean }>({});
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const errors = useMemo(() => {
    const e: { name?: string; email?: string; phone?: string } = {};
    const n = name.trim();
    if (!n) e.name = "Please enter your full name.";
    else if (n.length < 2) e.name = "Name must be at least 2 characters.";

    const em = email.trim();
    if (!em) e.email = "Please enter your email address.";
    else if (!EMAIL_RE.test(em)) e.email = "Enter a valid email address.";

    const ph = normalizePhone(phone);
    if (!ph) e.phone = "Please enter your mobile number.";
    else if (!/^\+?\d+$/.test(ph)) e.phone = "Numbers only (an optional +91 prefix is allowed).";
    else if (!PHONE_RE.test(ph)) e.phone = "Enter a 10-digit Indian mobile number.";

    return e;
  }, [name, email, phone]);

  const flightSelected = !!session.selectedFlightId;
  const consentGiven = session.consent.accepted;
  const formValid = !errors.name && !errors.email && !errors.phone;
  const canStart = flightSelected && formValid && consentGiven;

  const handleStart = () => {
    setTouched({ name: true, email: true, phone: true });
    if (!canStart) return;

    const clean = { name: name.trim(), email: email.trim(), phone: normalizePhone(phone) };
    setGuestProfile({ name: clean.name, email: clean.email, phone: clean.phone, city: session.city });

    void logConsent({
      guestName: clean.name,
      guestEmail: clean.email,
      guestPhone: clean.phone,
      flightId: session.selectedFlightId,
      consentVersion: CURRENT_PRIVACY_VERSION,
      privacyVersion: CURRENT_PRIVACY_VERSION,
    });
    navigate("/how-to-enjoy");
  };

  return (
    <>
      <div className="flex flex-col items-center min-h-screen px-6 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full space-y-8"
        >
          {/* Brand mark */}
          <div className="space-y-1">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-medium">
              Sula Vineyards
            </p>
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground/60">
              Tasting Room
            </p>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold leading-tight">
              Choose Your
              <br />
              Wine Flight
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Four journeys.
              <br />
              Sixteen exceptional pours.
              <br />
              Choose the experience that speaks to you.
            </p>
          </div>

          {/* Guide */}
          <div className="wine-card p-4 text-left border border-wine-gold-light/60">
            <SommelierQuote
              quote="I'll guide you through this tasting — one wine at a time."
              size="md"
              attribution=""
            />
          </div>

          {/* Flight Selection */}
          <FlightSelector
            selectedId={session.selectedFlightId}
            onSelect={(id) => setSelectedFlight(id)}
          />

          {/* Guest details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="space-y-3 text-left"
          >
            <div className="space-y-1">
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Full name"
                autoComplete="name"
                maxLength={80}
                aria-invalid={!!(touched.name && errors.name)}
                className="w-full text-center px-5 py-3.5 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-wine-gold/40 transition-all"
              />
              {touched.name && errors.name && (
                <p className="text-[0.7rem] text-destructive px-4">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="Email address"
                autoComplete="email"
                maxLength={120}
                aria-invalid={!!(touched.email && errors.email)}
                className="w-full text-center px-5 py-3.5 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-wine-gold/40 transition-all"
              />
              {touched.email && errors.email && (
                <p className="text-[0.7rem] text-destructive px-4">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <input
                type="tel"
                inputMode="tel"
                pattern="[0-9+]*"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="Mobile number (10 digits)"
                autoComplete="tel"
                maxLength={14}
                aria-invalid={!!(touched.phone && errors.phone)}
                className="w-full text-center px-5 py-3.5 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-wine-gold/40 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
              {touched.phone && errors.phone && (
                <p className="text-[0.7rem] text-destructive px-4">{errors.phone}</p>
              )}
            </div>

            {/* DPDP Consent */}
            <label className="flex items-start gap-2.5 px-1 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[oklch(0.83_0.14_88)] flex-shrink-0"
              />
              <span className="text-[0.7rem] leading-relaxed text-muted-foreground">
                I agree to Sula Vineyards processing my information to personalise this tasting
                experience in accordance with the{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPrivacyOpen(true);
                  }}
                  className="underline text-foreground/80 hover:text-foreground"
                >
                  Privacy Notice
                </button>
                .
              </span>
            </label>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="space-y-2"
          >
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className="btn-primary w-full text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Begin My Tasting
            </button>
            <p className="text-xs text-muted-foreground/70">4 wines • curated journey</p>
          </motion.div>
        </motion.div>
      </div>

      <PrivacyNoticeModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <CookieBanner />
    </>
  );
}

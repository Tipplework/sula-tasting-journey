import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTastingStore, CURRENT_PRIVACY_VERSION } from "@/store/tasting-store";
import { SommelierQuote } from "@/components/SommelierQuote";
import { FlightSelector } from "@/components/FlightSelector";
import { PrivacyNoticeModal } from "@/components/PrivacyNoticeModal";
import { CookieBanner } from "@/components/CookieBanner";
import { logConsent } from "@/lib/consent/log";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { session, setUserName, setSelectedFlight, setConsent } = useTastingStore();
  const [name, setName] = useState(session.userName);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const flightSelected = !!session.selectedFlightId;
  const nameEntered = name.trim().length > 0;
  const consentGiven = session.consent.accepted;
  const canStart = flightSelected && nameEntered && consentGiven;

  const handleStart = () => {
    if (!canStart) return;
    const clean = name.trim();
    setUserName(clean);
    // Fire-and-forget consent log
    void logConsent({
      guestName: clean,
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

          {/* Name input */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="space-y-3"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              maxLength={60}
              className="w-full text-center px-5 py-3.5 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-wine-gold/40 transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />

            {/* DPDP Consent */}
            <label className="flex items-start gap-2.5 text-left px-1 cursor-pointer">
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

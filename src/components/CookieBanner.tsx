import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTastingStore } from "@/store/tasting-store";

export function CookieBanner() {
  const { session, setCookiePrefs } = useTastingStore();
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(session.cookies.analytics);
  const [marketing, setMarketing] = useState(session.cookies.marketing);

  if (session.cookies.set) return null;

  const acceptAll = () => setCookiePrefs({ analytics: true, marketing: true });
  const rejectOptional = () => setCookiePrefs({ analytics: false, marketing: false });
  const savePrefs = () => setCookiePrefs({ analytics, marketing });

  return (
    <AnimatePresence>
      <motion.div
        key="cookie-banner"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4"
      >
        <div className="mx-auto max-w-lg wine-card-elevated bg-card border border-border/70 p-4 space-y-3">
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-muted-foreground">
              Cookies & Preferences
            </p>
            <p className="text-xs text-foreground/85 mt-1 leading-relaxed">
              We use essential cookies to run this experience. With your permission we'd also use
              analytics and marketing cookies to improve future tastings.
            </p>
          </div>

          {showPrefs && (
            <div className="space-y-2 pt-1 border-t border-border/60">
              <PrefRow label="Essential" description="Required for the tasting to work." locked />
              <PrefRow
                label="Analytics"
                description="Anonymous usage to improve the experience."
                checked={analytics}
                onChange={setAnalytics}
              />
              <PrefRow
                label="Marketing"
                description="Personalised invites and event news."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            {!showPrefs ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowPrefs(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
                >
                  Manage
                </button>
                <button
                  type="button"
                  onClick={rejectOptional}
                  className="btn-secondary !py-1.5 !px-3 !text-xs"
                >
                  Reject optional
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="btn-primary !py-1.5 !px-3 !text-xs"
                >
                  Accept
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowPrefs(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={savePrefs}
                  className="btn-primary !py-1.5 !px-3 !text-xs"
                >
                  Save preferences
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function PrefRow({
  label,
  description,
  checked,
  onChange,
  locked,
}: {
  label: string;
  description: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <label className="flex items-start justify-between gap-3 py-1.5 cursor-pointer">
      <span className="flex-1">
        <span className="text-xs font-medium block">{label}</span>
        <span className="text-[0.7rem] text-muted-foreground leading-relaxed">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={locked ? true : !!checked}
        disabled={locked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 accent-[oklch(0.83_0.14_88)] disabled:opacity-70"
      />
    </label>
  );
}

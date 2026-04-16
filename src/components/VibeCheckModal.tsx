import { motion, AnimatePresence } from "framer-motion";
import { useTastingStore } from "@/store/tasting-store";

interface VibeCheckModalProps {
  open: boolean;
  onClose: () => void;
}

const vibeOptions = [
  { label: "Light & Fresh", emoji: "🌿" },
  { label: "Fruity & Fun", emoji: "🍑" },
  { label: "Bold & Intense", emoji: "🔥" },
];

export function VibeCheckModal({ open, onClose }: VibeCheckModalProps) {
  const { session, setVibeCheck } = useTastingStore();

  const handleSelect = (vibe: string) => {
    setVibeCheck(vibe);
    setTimeout(onClose, 600);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/30 backdrop-blur-sm px-4 pb-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="wine-card-elevated w-full max-w-sm p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <p className="font-heading text-xl font-bold">
                What's your vibe so far?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Help us personalize your journey
              </p>
            </div>

            <div className="space-y-2.5">
              {vibeOptions.map((v) => (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => handleSelect(v.label)}
                  className={`w-full wine-tag justify-center text-base py-3.5 transition-all ${
                    session.vibeCheck === v.label
                      ? "!bg-wine-gold-light border border-wine-gold"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="mr-2">{v.emoji}</span>
                  {v.label}
                </button>
              ))}
            </div>

            {session.vibeCheck && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="wine-card p-4 text-center border border-wine-gold-light"
              >
                <p className="text-sm font-medium">Based on your taste…</p>
                <div className="mt-2.5 space-y-2">
                  <button
                    type="button"
                    className="btn-gold text-sm w-full"
                    onClick={onClose}
                  >
                    ✨ Upgrade to Premium Flight
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-sm w-full"
                    onClick={onClose}
                  >
                    🧀 Add Cheese Pairing
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

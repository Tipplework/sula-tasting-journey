import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Droplet, Wind, Wine as WineIcon } from "lucide-react";
import { useTastingStore } from "@/store/tasting-store";
import { logTastingEvent } from "@/lib/tasting-events";

interface TastingRitualProps {
  wineId: number;
  onComplete?: () => void;
}

type StepIndex = 0 | 1 | 2;

const STEPS = [
  {
    verb: "Swirl",
    coach: "Three slow circles — wake the wine up.",
    Icon: WineIcon,
  },
  {
    verb: "Smell",
    coach: "Nose in, breathe gently. What comes to mind?",
    Icon: Wind,
  },
  {
    verb: "Sip",
    coach: "A small sip. Let it rest on your tongue for a beat.",
    Icon: Droplet,
  },
] as const;

export function TastingRitual({ wineId, onComplete }: TastingRitualProps) {
  const { session, setRitualStep } = useTastingStore();
  const prefersReducedMotion = useReducedMotion();
  const stored = session.responses[wineId]?.ritualStep ?? 0;
  const [step, setStep] = useState<0 | 1 | 2 | 3>(stored);
  const completedFiredRef = useRef(false);
  const stepStartRef = useRef<number>(Date.now());

  // Sync when wine changes
  useEffect(() => {
    setStep(stored);
    completedFiredRef.current = stored === 3;
    stepStartRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wineId]);

  const persist = (next: 0 | 1 | 2 | 3) => {
    // Fire an event for each ritual step completed
    if (next > step) {
      const durationMs = Date.now() - stepStartRef.current;
      const completedIndex = next - 1; // step that just finished
      logTastingEvent({
        eventType: "ritual_step_complete",
        wineId,
        stepIndex: completedIndex,
        durationMs,
        metadata: {
          verb: completedIndex >= 0 && completedIndex < 3 ? STEPS[completedIndex].verb : "skip",
        },
      });
      stepStartRef.current = Date.now();
    }
    setStep(next);
    setRitualStep(wineId, next);
    if (next === 3 && !completedFiredRef.current) {
      completedFiredRef.current = true;
      onComplete?.();
    }
  };

  const handleDone = () => {
    const next = (step + 1) as 0 | 1 | 2 | 3;
    persist(next > 3 ? 3 : next);
  };

  const handleDotTap = (i: StepIndex) => {
    if (i <= step) persist(i);
  };

  const handleSkip = () => persist(3);
  const handleReset = () => persist(0);

  const isDone = step === 3;
  const activeStep = isDone ? 2 : (step as StepIndex);
  const { verb, coach, Icon } = STEPS[activeStep];

  const glyphAnim = useMemo(() => {
    if (prefersReducedMotion) return {};
    if (activeStep === 0) {
      return { rotate: [-8, 8, -8], transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const } };
    }
    if (activeStep === 1) {
      return { y: [0, -3, 0], transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" as const } };
    }
    return { scale: [1, 1.06, 1], transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const } };
  }, [activeStep, prefersReducedMotion]);

  return (
    <div className="space-y-3">
      {/* Warmer header */}
      <div className="space-y-1">
        <p className="font-heading italic text-[1.05rem] text-foreground leading-snug">
          Your turn — 3 gentle steps
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sula Sun will guide you. Tap <span className="font-medium text-foreground/80">Done</span> when each feels right.
        </p>
      </div>

      {/* Ritual card */}
      <div className="wine-card border border-wine-gold-light/60 p-4 min-h-[128px] flex items-center">
        <AnimatePresence mode="wait">
          {isDone ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              className="w-full flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-wine-gold-light flex items-center justify-center flex-shrink-0">
                <Check size={22} className="text-foreground" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-[1rem] font-semibold text-foreground leading-tight">
                  Ritual complete
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Swirl · Smell · Sip — now trust your palate.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[0.7rem] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 flex-shrink-0"
              >
                Redo
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`step-${activeStep}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
              className="w-full flex items-center gap-3.5"
            >
              <motion.div
                animate={glyphAnim}
                className="w-14 h-14 rounded-full bg-wine-gold-light border border-wine-gold/40 flex items-center justify-center flex-shrink-0"
                aria-hidden
              >
                <Icon size={26} strokeWidth={1.75} className="text-foreground" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-[1.05rem] font-semibold text-foreground leading-tight">
                  {verb}
                </p>
                <p className="text-[0.8rem] text-muted-foreground leading-snug mt-0.5">
                  {coach}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDone}
                aria-label={`Mark ${verb} as done`}
                className="btn-primary !py-2 !px-4 !text-xs flex-shrink-0 min-h-[44px]"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress dots + skip */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2" role="tablist" aria-label="Tasting ritual progress">
          {[0, 1, 2].map((i) => {
            const done = step > i;
            const current = !isDone && step === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDotTap(i as StepIndex)}
                aria-label={`Step ${i + 1}: ${STEPS[i].verb}`}
                aria-current={current ? "step" : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  current
                    ? "w-7 bg-wine-gold"
                    : done
                    ? "w-4 bg-wine-gold/70"
                    : "w-4 bg-border"
                }`}
              />
            );
          })}
          <span className="text-[0.65rem] text-muted-foreground ml-1.5 tracking-wide">
            {isDone ? "Done" : `${step + 1} of 3`}
          </span>
        </div>
        {!isDone && (
          <button
            type="button"
            onClick={handleSkip}
            className="text-[0.7rem] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Skip ritual
          </button>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Wine as WineIcon, X } from "lucide-react";
import { toast } from "sonner";
import type { Wine } from "@/data/wines";
import { StarRating } from "./StarRating";
import { SommelierQuote } from "./SommelierQuote";
import { useTastingStore } from "@/store/tasting-store";
import { logToSheets } from "@/lib/sheets-logger";
import { useSwipeNav } from "@/hooks/use-swipe-nav";
import vivinoLogo from "@/assets/vivino-logo.png";

interface WineCardProps {
  wine: Wine;
  onNext: (opts?: { skipValidation?: boolean }) => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentIndex: number;
  total: number;
}

export function WineCard({
  wine,
  onNext,
  onPrev,
  isFirst,
  isLast,
  currentIndex,
  total,
}: WineCardProps) {
  const { session, setWineRating, setQuizAnswer } = useTastingStore();
  const response = session.responses[wine.id];
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    response?.quizAnswer || []
  );
  const [vivinoPromptOpen, setVivinoPromptOpen] = useState(false);
  const [vivinoPromptShown, setVivinoPromptShown] = useState(false);
  const [ratingNudgeShown, setRatingNudgeShown] = useState(false);

  // Scroll reset whenever wine changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [wine.id]);

  const toggleOption = (option: string) => {
    const next = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option].slice(0, 3);
    setSelectedOptions(next);
    setQuizAnswer(wine.id, next);
  };

  const handleRating = (rating: number) => {
    setWineRating(wine.id, rating);
    if (!vivinoPromptShown) {
      setVivinoPromptOpen(true);
      setVivinoPromptShown(true);
    }
  };

  const handleContinue = () => {
    // Mandatory: at least one feeling
    if (!selectedOptions.length) {
      toast("Tell us what you felt before moving ahead");
      return;
    }
    const rating = response?.rating || 0;

    // Soft, non-blocking nudge once per wine if no rating
    if (!rating && !ratingNudgeShown) {
      setRatingNudgeShown(true);
      toast("Want to rate this wine?", {
        description: "Optional — tap a star anytime.",
      });
    }

    // Per-step data save (silent, background)
    logToSheets({
      event: "wine_step",
      step: currentIndex + 1,
      wine: wine.name,
      feeling: selectedOptions.join(", "),
      rating: rating || "",
      name: session.userName || "",
      email: session.email || "",
      phone: session.phone || "",
      city: session.city || "",
    });

    onNext();
  };

  const dismissVivinoPrompt = () => setVivinoPromptOpen(false);

  const openVivino = () => {
    window.open(wine.vivino, "_blank", "noopener,noreferrer");
    setVivinoPromptOpen(false);
  };

  // Swipe + button parity — both run the same validated continue
  useSwipeNav({
    onSwipeLeft: handleContinue,
    onSwipeRight: () => {
      if (!isFirst) onPrev();
    },
  });

  return (
    <motion.div
      key={wine.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col min-h-0 w-full max-w-full"
    >
      {/* Hero Image — bottle, contained, no clipping */}
      <div className="relative w-full max-w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-secondary flex items-center justify-center">
        <img
          src={wine.image}
          alt={wine.name}
          className="w-full h-full object-contain p-4"
          loading={currentIndex === 0 ? undefined : "lazy"}
        />
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
        <div className="absolute top-4 left-4">
          <span className="wine-badge">Wine {wine.id} • {wine.journeyTag}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-6 space-y-6 w-full max-w-full">
        {/* Name & Personality */}
        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold leading-tight tracking-tight">
            {wine.name}
          </h2>
          <span className="wine-badge">{wine.personalityLabel}</span>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {wine.personality}
          </p>
        </div>

        {/* Sommelier Note */}
        <div className="wine-card p-4 border border-wine-gold-light/60">
          <SommelierQuote quote={wine.sommelierNote} />
        </div>

        {/* Guided Tasting Steps */}
        <div className="space-y-2.5">
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            How to taste
          </h3>
          <ol className="space-y-1.5">
            {wine.tastingSteps.map((step, i) => (
              <li key={step} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-wine-gold-light text-foreground text-[0.7rem] font-semibold inline-flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tasting Notes */}
        <div className="space-y-2">
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Tasting Notes
          </h3>
          <p className="text-sm leading-[1.7] whitespace-pre-line">{wine.tastingNotes}</p>
        </div>

        {/* USP */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
          <WineIcon size={13} className="text-wine-gold flex-shrink-0 mt-0.5" />
          <span>{wine.usp}</span>
        </div>

        {/* Food Pairing */}
        <div className="space-y-2.5">
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Try this with…
          </h3>
          <div className="flex flex-wrap gap-2">
            {wine.foodPairing.map((food) => (
              <span key={food} className="wine-tag">
                {food}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/60" />

        {/* Quiz */}
        <div className="space-y-3">
          <p className="font-heading text-lg font-semibold">
            {wine.question}
          </p>
          <div className="flex flex-wrap gap-2">
            {wine.options.map((option) => (
              <motion.button
                key={option}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleOption(option)}
                className={`wine-tag transition-all duration-200 ${
                  selectedOptions.includes(option)
                    ? "!bg-wine-gold-light border border-wine-gold shadow-sm"
                    : "hover:bg-muted active:bg-muted"
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Star Rating */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Rate this wine
          </p>
          <StarRating
            value={response?.rating || 0}
            onChange={handleRating}
          />

          {/* Vivino inline prompt — one-time per wine */}
          <AnimatePresence>
            {vivinoPromptOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mt-3 wine-card p-3.5 border border-wine-gold-light/60 flex items-start gap-3">
                  <img
                    src={vivinoLogo}
                    alt="Vivino"
                    className="h-5 w-auto object-contain flex-shrink-0 mt-0.5 opacity-90"
                  />
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <p className="text-xs leading-relaxed text-foreground/85">
                      Want to share your rating on Vivino?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={openVivino}
                        className="btn-gold !py-1.5 !px-3 !text-xs"
                      >
                        Rate on Vivino
                      </button>
                      <button
                        type="button"
                        onClick={dismissVivinoPrompt}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
                      >
                        Maybe later
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={dismissVivinoPrompt}
                    aria-label="Dismiss"
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 -mt-1 -mr-1 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vivino — subtle inline */}
        <a
          href={wine.vivino}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 opacity-80 hover:opacity-100"
        >
          <img src={vivinoLogo} alt="Vivino" className="h-4 w-auto object-contain" />
          <span>View on Vivino</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Sticky Nav */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/60 px-5 py-3.5 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="btn-secondary text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <span className="text-xs text-muted-foreground font-medium tracking-wide">
          {currentIndex + 1} of {total}
        </span>
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary text-sm !px-5 !py-2.5"
        >
          {isLast ? "See Results" : "Continue →"}
        </button>
      </div>
    </motion.div>
  );
}

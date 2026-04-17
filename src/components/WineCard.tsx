import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Wine as WineIcon, Quote } from "lucide-react";
import type { Wine } from "@/data/wines";
import { StarRating } from "./StarRating";
import { useTastingStore } from "@/store/tasting-store";

interface WineCardProps {
  wine: Wine;
  onNext: () => void;
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

  const toggleOption = (option: string) => {
    const next = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option].slice(0, 3);
    setSelectedOptions(next);
    setQuizAnswer(wine.id, next);
  };

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
          <p className="text-xs font-medium text-foreground/80 flex items-start gap-2 leading-relaxed">
            <Quote size={14} className="text-wine-gold flex-shrink-0 mt-0.5" />
            <span className="italic">{wine.sommelierNote}</span>
          </p>
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
            onChange={(r) => setWineRating(wine.id, r)}
          />
        </div>

        {/* Vivino — subtle */}
        <a
          href={wine.vivino}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          View on Vivino
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
          onClick={onNext}
          className="btn-primary text-sm !px-5 !py-2.5"
        >
          {isLast ? "See Results" : "Continue →"}
        </button>
      </div>
    </motion.div>
  );
}

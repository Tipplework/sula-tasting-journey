import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Wine as WineIcon } from "lucide-react";
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
  const { session, setWineRating, setQuizAnswer, setUpsellClick } =
    useTastingStore();
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
      className="flex flex-col min-h-0"
    >
      {/* Hero Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl">
        <img
          src={wine.image}
          alt={wine.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="wine-badge">{wine.journeyTag}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Name & Personality */}
        <div>
          <h2 className="text-2xl font-heading font-bold leading-tight">
            {wine.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {wine.personality}
          </p>
        </div>

        {/* USP */}
        <div className="wine-card p-3.5 border border-wine-gold-light">
          <p className="text-xs font-medium text-wine-gold flex items-center gap-1.5">
            <WineIcon size={14} />
            {wine.usp}
          </p>
        </div>

        {/* Tasting Notes */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Tasting Notes
          </h3>
          <p className="text-sm leading-relaxed">{wine.tastingNotes}</p>
        </div>

        {/* Food Pairing */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Pairs beautifully with
          </h3>
          <div className="flex flex-wrap gap-2">
            {wine.foodPairing.map((food) => (
              <span key={food} className="wine-tag">
                {food}
              </span>
            ))}
          </div>
        </div>

        {/* Vivino */}
        <a
          href={wine.vivino}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View on Vivino
          <ExternalLink size={14} />
        </a>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Quiz */}
        <div>
          <p className="font-heading text-lg font-semibold mb-3">
            {wine.question}
          </p>
          <div className="flex flex-wrap gap-2">
            {wine.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className={`wine-tag transition-all ${
                  selectedOptions.includes(option)
                    ? "!bg-wine-gold-light border border-wine-gold"
                    : "hover:bg-muted"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Star Rating */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Rate this wine
          </p>
          <StarRating
            value={response?.rating || 0}
            onChange={(r) => setWineRating(wine.id, r)}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Upsell */}
        <div className="wine-card p-5 text-center space-y-3">
          <p className="font-heading text-lg">Enjoying this?</p>
          <div className="flex gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => setUpsellClick(wine.id, "glass")}
              className={`btn-secondary text-sm ${
                response?.upsellClicked === "glass"
                  ? "!bg-wine-gold-light !border-wine-gold"
                  : ""
              }`}
            >
              Order a glass
            </button>
            <button
              type="button"
              onClick={() => setUpsellClick(wine.id, "bottle")}
              className={`btn-gold text-sm ${
                response?.upsellClicked === "bottle"
                  ? "ring-2 ring-wine-gold ring-offset-2"
                  : ""
              }`}
            >
              Order a bottle
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Nav */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-5 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="btn-secondary text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <span className="text-xs text-muted-foreground font-medium">
          Wine {currentIndex + 1} of {total}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="btn-primary text-sm !px-5 !py-2.5"
        >
          {isLast ? "See Results" : "Next →"}
        </button>
      </div>
    </motion.div>
  );
}

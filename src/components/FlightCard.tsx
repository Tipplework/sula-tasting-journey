import { motion } from "framer-motion";
import { Wine, GlassWater, Grape, Sparkles } from "lucide-react";
import type { Flight } from "@/data/wines";

interface FlightCardProps {
  flight: Flight;
  selected: boolean;
  onSelect: (id: string) => void;
}

const glyphMap = {
  whites: GlassWater,
  reds: Wine,
  signature: Grape,
  sparkles: Sparkles,
  sparkling: Sparkles,
} as const;

export function FlightCard({ flight, selected, onSelect }: FlightCardProps) {
  const Icon = glyphMap[flight.glyph] ?? Wine;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={() => onSelect(flight.id)}
      className={[
        "text-left w-full rounded-2xl p-4 transition-all duration-200",
        "border bg-card",
        selected
          ? "border-wine-gold shadow-[0_8px_28px_-12px_oklch(0.83_0.14_88_/_0.55)] ring-1 ring-wine-gold/40"
          : "border-border hover:border-wine-gold-light hover:shadow-[0_6px_20px_-12px_oklch(0.15_0.01_60_/_0.15)]",
      ].join(" ")}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            selected ? "bg-wine-gold-light" : "bg-secondary",
          ].join(" ")}
        >
          <Icon size={18} className="text-foreground/80" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-heading text-base font-semibold leading-tight">{flight.name}</h3>
            <span className="text-[0.65rem] tracking-[0.15em] uppercase text-muted-foreground">
              4 Wines
            </span>
          </div>
          <p className="text-[0.7rem] tracking-[0.15em] uppercase text-wine-gold mt-0.5">
            {flight.subtitle}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {flight.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

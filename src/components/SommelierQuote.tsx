import { motion } from "framer-motion";
import sommelierImg from "@/assets/sommelier-rajeev.jpg";

interface SommelierQuoteProps {
  quote: string;
  size?: "sm" | "md";
  attribution?: string;
  className?: string;
}

export function SommelierQuote({
  quote,
  size = "sm",
  attribution,
  className = "",
}: SommelierQuoteProps) {
  const dim = size === "md" ? "w-12 h-12" : "w-9 h-9";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-start gap-3 ${className}`}
    >
      <img
        src={sommelierImg}
        alt="Rajeev Samant, Sula Vineyards"
        className={`${dim} rounded-full object-cover flex-shrink-0 border border-wine-gold-light/60`}
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed italic text-foreground/85">
          "{quote}"
        </p>
        {attribution !== undefined && (
          <p className="text-[0.65rem] tracking-[0.15em] uppercase text-muted-foreground mt-1">
            {attribution || "Rajeev Samant • Sula"}
          </p>
        )}
      </div>
    </motion.div>
  );
}

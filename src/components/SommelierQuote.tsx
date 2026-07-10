import { motion } from "framer-motion";
import sulaSun from "@/assets/sula-sun.png.asset.json";

interface SommelierQuoteProps {
  quote: string;
  size?: "sm" | "md";
  attribution?: string;
  className?: string;
}

/**
 * Sula Sun guide — the voice of the tasting.
 * Rendered as the guide avatar wherever a sommelier note appears.
 */
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
      <div
        className={`${dim} rounded-full flex-shrink-0 border border-wine-gold-light/60 bg-wine-warm flex items-center justify-center overflow-hidden`}
      >
        <img
          src={sulaSun.url}
          alt="The Sula Sun"
          className="w-[85%] h-[85%] object-contain"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed italic text-foreground/85">"{quote}"</p>
        {attribution !== undefined && (
          <p className="text-[0.65rem] tracking-[0.15em] uppercase text-muted-foreground mt-1">
            {attribution || "The Sula Sun • Your Guide"}
          </p>
        )}
      </div>
    </motion.div>
  );
}

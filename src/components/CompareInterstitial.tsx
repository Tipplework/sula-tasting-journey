import { motion } from "framer-motion";
import { SommelierQuote } from "./SommelierQuote";

interface CompareInterstitialProps {
  message: string;
  onContinue: () => void;
}

export function CompareInterstitial({ message, onContinue }: CompareInterstitialProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col min-h-[70vh] justify-center px-5 py-8 space-y-6 w-full max-w-full"
    >
      <div className="text-center space-y-1.5">
        <p className="text-[0.65rem] tracking-[0.25em] uppercase text-muted-foreground">
          A moment to compare
        </p>
        <h2 className="font-heading text-2xl font-bold leading-tight">
          Pause & taste again
        </h2>
      </div>

      <div className="wine-card p-5 border border-wine-gold-light/60">
        <SommelierQuote quote={message} size="md" />
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="btn-primary w-full"
      >
        Continue →
      </button>
    </motion.div>
  );
}

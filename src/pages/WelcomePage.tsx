import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTastingStore } from "@/store/tasting-store";
import { SommelierQuote } from "@/components/SommelierQuote";

export default function WelcomePage() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { setUserName } = useTastingStore();

  const handleStart = () => {
    if (name.trim()) setUserName(name.trim());
    navigate("/flight");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-sm w-full space-y-8"
      >
        {/* Logo mark */}
        <div className="space-y-1">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-medium">
            Sula Vineyards
          </p>
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground/60">
            Tasting Room
          </p>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold leading-tight">
            Sip. Savour.
            <br />
            Discover.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Your wines are in front of you.
            <br />
            We'll taste them together — one step at a time.
          </p>
        </div>

        {/* Sommelier intro */}
        <div className="wine-card p-4 text-left border border-wine-gold-light/60">
          <SommelierQuote
            quote="I'll guide you through this tasting."
            size="md"
            attribution=""
          />
        </div>

        {/* Name input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
            className="w-full text-center px-5 py-3.5 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-wine-gold/40 transition-all"
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="space-y-3"
        >
          <button
            type="button"
            onClick={handleStart}
            className="btn-primary w-full text-base"
          >
            Start Tasting
          </button>
          <p className="text-xs text-muted-foreground/60">
            5 wines • curated journey
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

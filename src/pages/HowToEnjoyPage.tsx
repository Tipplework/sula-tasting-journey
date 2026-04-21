import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const STEPS = [
  {
    title: "Start light, move bold",
    body: "Begin with Wine 1 and follow the flow. Each glass builds on the last.",
  },
  {
    title: "Smell before you sip",
    body: "Give it a swirl, take a quick smell, that's where the magic starts.",
  },
  {
    title: "Take your time",
    body: "A small sip is enough. Let it sit for a second and notice how it changes.",
  },
  {
    title: "Go back & compare",
    body: "Try wines again as you go, your palate evolves with every sip.",
  },
  {
    title: "No right or wrong",
    body: "Like what you like. This is your journey.",
  },
];

export default function HowToEnjoyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full max-w-[420px] mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6 w-full max-w-full"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Before we begin…
          </p>
          <h1 className="font-heading text-2xl font-bold leading-tight">
            How to enjoy your wine flight
          </h1>
          <p className="text-sm text-muted-foreground">
            The Sula way, five gentle pointers for the journey ahead.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
              className="wine-card p-4 flex items-start gap-3.5 w-full max-w-full"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-wine-gold-light text-foreground text-xs font-semibold inline-flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-heading font-semibold text-sm leading-snug">
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="pt-2"
        >
          <button
            type="button"
            onClick={() => navigate("/flight")}
            className="btn-primary w-full"
          >
            Let's Start Tasting
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

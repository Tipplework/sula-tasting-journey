import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { wines, journeyLabels } from "@/data/wines";

export const Route = createFileRoute("/flight")({
  component: FlightOverview,
  head: () => ({
    meta: [
      { title: "Your Wine Flight — Sula TR" },
      { name: "description", content: "5 curated wines from Fresh to Indulgent." },
    ],
  }),
});

function FlightOverview() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-5 py-8 max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Your Flight
          </p>
          <h1 className="font-heading text-2xl font-bold">The Journey</h1>
          <p className="text-sm text-muted-foreground">
            {journeyLabels.join(" → ")}
          </p>
        </div>

        {/* Wine List */}
        <div className="space-y-3">
          {wines.map((wine, i) => (
            <motion.div
              key={wine.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="wine-card flex items-center gap-4 p-3.5"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={wine.image}
                  alt={wine.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-sm truncate">
                  {wine.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {wine.subtitle}
                </p>
              </div>
              <span className="wine-badge text-[0.65rem]">
                {wine.journeyTag}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-1.5">
          {wines.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-border"
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-2"
        >
          <button
            type="button"
            onClick={() => navigate({ to: "/tasting" })}
            className="btn-primary w-full"
          >
            Begin Tasting
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

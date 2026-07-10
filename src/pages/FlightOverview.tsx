import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCatalogue } from "@/lib/catalogue/useCatalogue";
import { useTastingStore } from "@/store/tasting-store";

export default function FlightOverview() {
  const navigate = useNavigate();
  const { session } = useTastingStore();
  const { flights, getFlightWines } = useCatalogue();
  const flight = flights.find((f) => f.id === session.selectedFlightId) || null;
  const flightWines = getFlightWines(session.selectedFlightId);

  useEffect(() => {
    if (!flight) navigate("/", { replace: true });
  }, [flight, navigate]);

  if (!flight) return null;

  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <p className="text-[0.65rem] tracking-[0.25em] uppercase text-wine-gold">
            {flight.subtitle}
          </p>
          <h1 className="font-heading text-3xl font-bold">{flight.name}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{flight.description}</p>
          <p className="text-xs text-muted-foreground/80 italic pt-1">
            Four wines, curated for this journey.
          </p>
        </div>

        <div className="space-y-3">
          {flightWines.map((wine, i) => (
            <motion.div
              key={wine.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="wine-card flex items-center gap-4 p-3.5"
            >
              <div className="w-14 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                <img
                  src={wine.image}
                  alt={wine.name}
                  className="w-full h-full object-contain p-1 mix-blend-multiply"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.65rem] text-muted-foreground font-medium tracking-wider">
                  WINE {i + 1}
                </p>
                <p className="font-heading font-semibold text-sm truncate">{wine.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{wine.subtitle}</p>
              </div>
              <span className="wine-badge text-[0.65rem]">{wine.journeyTag}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-1.5">
          {flightWines.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-border" />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-2 space-y-2"
        >
          <button
            type="button"
            onClick={() => navigate("/tasting")}
            className="btn-primary w-full"
          >
            Begin Tasting
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn-secondary w-full !text-xs"
          >
            ← Change flight
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Wine as WineIcon } from "lucide-react";
import { wines, personalityResults } from "@/data/wines";
import { useTastingStore } from "@/store/tasting-store";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
  head: () => ({
    meta: [
      { title: "Your Wine Personality — Sula TR" },
      { name: "description", content: "Discover your wine personality." },
    ],
  }),
});

function ResultsPage() {
  const { session, getPersonality, setContactInfo } = useTastingStore();
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const personality = getPersonality();
  const result = personalityResults[personality as keyof typeof personalityResults];
  const favoriteWine = wines.find((w) => w.id === session.favoriteWineId) || wines[0];

  const handleSubmit = () => {
    if (contact.trim()) {
      setContactInfo(contact.trim());
      setSubmitted(true);
    }
  };

  const personalityEmojis: Record<string, string> = {
    Cheerful: "🥂",
    Refined: "🍷",
    Romantic: "🌹",
    "Bold Explorer": "🗺️",
    Playful: "✨",
  };

  return (
    <div className="min-h-screen px-5 py-8 max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Your Result
          </p>
          <h1 className="font-heading text-3xl font-bold">
            Your Wine Personality
          </h1>
        </div>

        {/* Personality Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="wine-card-elevated p-6 text-center space-y-3"
        >
          <div className="text-5xl">
            {personalityEmojis[personality] || "🍷"}
          </div>
          <div>
            <p className="wine-badge text-sm mb-2">{personality}</p>
            <h2 className="font-heading text-xl font-bold">{result.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.description}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="wine-card p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Favourite Wine
            </p>
            <p className="font-heading font-semibold text-sm">
              {favoriteWine.name}
            </p>
          </div>
          <div className="wine-card p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Recommended Next
            </p>
            <p className="text-sm leading-snug">
              {result.recommendedNext}
            </p>
          </div>
        </div>

        <div className="wine-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Suggested Food Pairing
          </p>
          <p className="text-sm">{result.suggestedPairing}</p>
        </div>

        {/* Contact Capture */}
        {!submitted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="wine-card p-5 space-y-3 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <WineIcon size={16} className="text-wine-gold" />
              <p className="font-heading font-semibold">
                Get your personalized wine profile
              </p>
            </div>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Phone or email"
              className="w-full text-center px-4 py-3 rounded-full bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-wine-gold/40"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary w-full"
            >
              Send My Profile
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="wine-card p-5 text-center border border-wine-gold-light"
          >
            <p className="text-wine-gold font-medium">
              ✓ Profile saved! Check your inbox soon.
            </p>
          </motion.div>
        )}

        {/* Share */}
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `I'm a ${personality} wine lover!`,
                text: result.description,
                url: window.location.href,
              });
            }
          }}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Share2 size={16} />
          Share your result
        </button>
      </motion.div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, ExternalLink, Star, Wine as WineIcon } from "lucide-react";
import { wines, personalityResults } from "@/data/wines";
import { useTastingStore } from "@/store/tasting-store";
import { SommelierQuote } from "@/components/SommelierQuote";

const SULA_INSTAGRAM = "https://www.instagram.com/sulavineyards/";
const SULA_GOOGLE_REVIEW = "https://www.google.com/search?q=sula+vineyards+nashik+reviews";

export default function ResultsPage() {
  const { session, getPersonality, setGuestProfile } = useTastingStore();
  const [phone, setPhone] = useState(session.phone || "");
  const [city, setCity] = useState(session.city || "");
  const [name, setName] = useState(session.userName || "");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(session.completed);

  const personality = getPersonality();
  const result = personalityResults[personality as keyof typeof personalityResults];
  const favoriteWine = wines.find((w) => w.id === session.favoriteWineId) || wines[0];

  const handleSubmit = () => {
    const cleanPhone = phone.trim();
    const cleanCity = city.trim();
    if (!/^[0-9+\-\s()]{7,20}$/.test(cleanPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (cleanCity.length < 2) {
      setError("Please enter your city.");
      return;
    }
    setError("");
    setGuestProfile({ phone: cleanPhone, city: cleanCity, name: name.trim() });
    setSubmitted(true);
  };

  const personalityEmojis: Record<string, string> = {
    Cheerful: "🥂",
    Refined: "🍷",
    Romantic: "🌹",
    "Bold Explorer": "🗺️",
    Playful: "✨",
  };

  const shareInstagram = () => {
    const text = `I'm a ${personality} wine lover at @SulaVineyards 🍷`;
    if (navigator.share) {
      navigator
        .share({
          title: `My Sula Wine Personality: ${personality}`,
          text,
          url: window.location.href,
        })
        .catch(() => window.open(SULA_INSTAGRAM, "_blank", "noopener"));
    } else {
      window.open(SULA_INSTAGRAM, "_blank", "noopener");
    }
  };

  return (
    <div className="min-h-screen px-5 py-8 max-w-sm mx-auto w-full">
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

        {/* Server prompt */}
        <div className="wine-card p-4 text-center border border-wine-gold-light/60">
          <p className="text-sm leading-relaxed">
            Enjoyed a wine? <span className="font-medium">Let your server know your favourite</span> for another pour.
          </p>
        </div>

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
              Your Next Pour
            </p>
            <p className="text-sm leading-snug font-medium">
              {favoriteWine.nextPour}
            </p>
          </div>
        </div>

        <div className="wine-card p-4 border border-wine-gold-light/60">
          <SommelierQuote
            quote={`Now that you know your palate, here's where I'd take you next. ${favoriteWine.nextPourReason}`}
          />
        </div>

        <div className="wine-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Suggested Food Pairing
          </p>
          <p className="text-sm">{result.suggestedPairing}</p>
        </div>

        {/* Data Capture */}
        {!submitted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="wine-card p-5 space-y-3"
          >
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <WineIcon size={16} className="text-wine-gold" />
                <p className="font-heading font-semibold">
                  Save your tasting profile
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Get invites to tastings, SulaFest & new releases
              </p>
            </div>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number *"
              maxLength={20}
              className="w-full text-center px-4 py-3 rounded-full bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-wine-gold/40"
            />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City *"
              maxLength={60}
              className="w-full text-center px-4 py-3 rounded-full bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-wine-gold/40"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (optional)"
              maxLength={60}
              className="w-full text-center px-4 py-3 rounded-full bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-wine-gold/40"
            />
            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary w-full"
            >
              Save My Profile
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="wine-card p-5 text-center border border-wine-gold-light"
          >
            <p className="text-wine-gold font-medium">
              ✓ Profile saved. See you at the next tasting.
            </p>
          </motion.div>
        )}

        {/* Before you leave — Feedback loop */}
        <div className="space-y-3">
          <div className="text-center space-y-1 pt-2">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              Before you leave…
            </p>
            <p className="text-xs text-muted-foreground/80">
              Tag <span className="font-medium">@SulaVineyards</span> to get featured
            </p>
          </div>

          {/* Vivino — primary */}
          <a
            href={favoriteWine.vivino}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold w-full flex items-center justify-center gap-2"
          >
            <Star size={16} />
            Rate {favoriteWine.name} on Vivino
          </a>

          <button
            type="button"
            onClick={shareInstagram}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Camera size={16} />
            Share on Instagram
          </button>

          <a
            href={SULA_GOOGLE_REVIEW}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Rate us on Google
            <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}

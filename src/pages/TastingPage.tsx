import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { getFlightWines } from "@/data/wines";
import { useTastingStore } from "@/store/tasting-store";
import { WineCard } from "@/components/WineCard";
import { ProgressBar } from "@/components/ProgressBar";
import { CompareInterstitial } from "@/components/CompareInterstitial";

const COMPARE_AFTER: Record<number, string> = {
  // After Wine 2 (index 1) — mid-journey comparison
  1: "Go back and try Wine 1 again. Notice how it feels different now — your palate has shifted.",
};

export default function TastingPage() {
  const navigate = useNavigate();
  const { session } = useTastingStore();
  const flightWines = getFlightWines(session.selectedFlightId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    if (!flightWines.length) navigate("/", { replace: true });
  }, [flightWines.length, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentIndex, showCompare]);

  if (!flightWines.length) return null;
  const wine = flightWines[currentIndex];

  const handleNext = () => {
    if (currentIndex === flightWines.length - 1) {
      navigate("/results");
      return;
    }
    if (COMPARE_AFTER[currentIndex] && !showCompare) {
      setShowCompare(true);
      return;
    }
    setShowCompare(false);
    setCurrentIndex(currentIndex + 1);
  };

  const handleCompareContinue = () => {
    setShowCompare(false);
    setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (showCompare) {
      setShowCompare(false);
      return;
    }
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col px-0">
      <div className="px-5 pt-4 pb-2">
        <ProgressBar current={currentIndex + 1} total={flightWines.length} />
        <p className="text-center text-[0.65rem] text-muted-foreground mt-1.5 tracking-wide">
          {wine.journeyTag} • Wine {currentIndex + 1} of {flightWines.length}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {showCompare ? (
            <CompareInterstitial
              key={`compare-${currentIndex}`}
              message={COMPARE_AFTER[currentIndex]}
              onContinue={handleCompareContinue}
            />
          ) : (
            <WineCard
              key={wine.id}
              wine={wine}
              onNext={handleNext}
              onPrev={handlePrev}
              isFirst={currentIndex === 0}
              isLast={currentIndex === flightWines.length - 1}
              currentIndex={currentIndex}
              total={flightWines.length}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { wines } from "@/data/wines";
import { WineCard } from "@/components/WineCard";
import { ProgressBar } from "@/components/ProgressBar";
import { VibeCheckModal } from "@/components/VibeCheckModal";

export default function TastingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showVibeCheck, setShowVibeCheck] = useState(false);
  const [vibeShown, setVibeShown] = useState(false);
  const navigate = useNavigate();

  const wine = wines[currentIndex];

  const handleNext = () => {
    if (currentIndex === wines.length - 1) {
      navigate("/results");
      return;
    }

    const nextIndex = currentIndex + 1;

    // Show vibe check after wine 2 (index 1 -> going to index 2)
    if (nextIndex === 2 && !vibeShown) {
      setShowVibeCheck(true);
      setVibeShown(true);
    }

    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="min-h-screen max-w-sm mx-auto flex flex-col">
      {/* Progress */}
      <div className="px-5 pt-4 pb-2">
        <ProgressBar current={currentIndex + 1} total={wines.length} />
        <p className="text-center text-[0.65rem] text-muted-foreground mt-1.5 tracking-wide">
          {wine.journeyTag} • Wine {currentIndex + 1} of {wines.length}
        </p>
      </div>

      {/* Wine Card */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <WineCard
            key={wine.id}
            wine={wine}
            onNext={handleNext}
            onPrev={handlePrev}
            isFirst={currentIndex === 0}
            isLast={currentIndex === wines.length - 1}
            currentIndex={currentIndex}
            total={wines.length}
          />
        </AnimatePresence>
      </div>

      {/* Vibe Check Modal */}
      <VibeCheckModal
        open={showVibeCheck}
        onClose={() => setShowVibeCheck(false)}
      />
    </div>
  );
}

import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.15 }}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="p-0.5 transition-colors duration-200"
        >
          <Star
            size={30}
            strokeWidth={1.5}
            className={`transition-all duration-200 ${
              star <= (hover || value)
                ? "fill-wine-gold text-wine-gold drop-shadow-[0_0_4px_oklch(0.83_0.14_88/0.4)]"
                : "text-border hover:text-muted-foreground"
            }`}
          />
        </motion.button>
      ))}
      {value > 0 && (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs text-muted-foreground ml-1"
        >
          {value}/5
        </motion.span>
      )}
    </div>
  );
}

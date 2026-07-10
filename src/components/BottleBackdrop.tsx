import { motion, useReducedMotion } from "framer-motion";

interface BottleBackdropProps {
  flightId: string | null | undefined;
}

/**
 * Per-flight mood backdrop behind the bottle.
 * Pure CSS/SVG. Kept warm/light so a `mix-blend-multiply`
 * on the bottle PNG dissolves the baked-in white plate.
 */
export function BottleBackdrop({ flightId }: BottleBackdropProps) {
  const reduce = useReducedMotion();
  const id = (flightId || "A").toUpperCase();

  // A = Crisp/Whites  · citrus + water ripple
  // B = Bold/Reds     · warm burgundy vignette + grape leaf
  // C = Refined       · champagne glow + rising bubbles
  // D = Sparkling     · peach/rose sun rays + bubbles
  if (id === "B") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 60%, hsl(0 45% 82% / 0.75), transparent 70%), radial-gradient(ellipse 100% 80% at 50% 100%, hsl(350 40% 68% / 0.35), transparent 75%)",
          }}
        />
        {/* Grape leaf silhouette */}
        <svg
          viewBox="0 0 200 200"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] opacity-[0.09]"
        >
          <path
            d="M100 20 C130 40 160 55 165 90 C170 120 150 145 120 150 C130 165 125 180 100 180 C75 180 70 165 80 150 C50 145 30 120 35 90 C40 55 70 40 100 20 Z"
            fill="hsl(350 55% 30%)"
          />
        </svg>
      </div>
    );
  }

  if (id === "C") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 50%, hsl(45 70% 88% / 0.85), transparent 70%), radial-gradient(ellipse 90% 40% at 50% 100%, hsl(38 55% 78% / 0.5), transparent 80%)",
          }}
        />
        {/* Rising bubbles */}
        {[
          { l: 42, s: 6, d: 0 },
          { l: 55, s: 4, d: 0.7 },
          { l: 48, s: 8, d: 1.4 },
          { l: 60, s: 5, d: 2.1 },
        ].map((b, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-wine-gold/40 border border-wine-gold/50"
            style={{ left: `${b.l}%`, bottom: "-6%", width: b.s, height: b.s }}
            animate={
              reduce
                ? undefined
                : { y: [0, -220], opacity: [0, 0.7, 0] }
            }
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: b.d,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (id === "D") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 55%, hsl(20 80% 88% / 0.85), transparent 70%), radial-gradient(ellipse 100% 50% at 50% 0%, hsl(340 60% 88% / 0.55), transparent 80%)",
          }}
        />
        {/* Sun rays behind bottle */}
        <svg
          viewBox="0 0 200 200"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] opacity-[0.13]"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x="99"
              y="0"
              width="2"
              height="100"
              fill="hsl(30 90% 55%)"
              transform={`rotate(${i * 30} 100 100)`}
            />
          ))}
        </svg>
        {/* Bubbles */}
        {[
          { l: 38, s: 5, d: 0 },
          { l: 62, s: 7, d: 0.9 },
          { l: 50, s: 4, d: 1.8 },
        ].map((b, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/60 border border-white/80"
            style={{ left: `${b.l}%`, bottom: "-6%", width: b.s, height: b.s }}
            animate={
              reduce ? undefined : { y: [0, -230], opacity: [0, 0.85, 0] }
            }
            transition={{
              duration: 4.5,
              repeat: Infinity,
              delay: b.d,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    );
  }

  // A · Crisp — citrus + water ripple (default)
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, hsl(75 60% 88% / 0.75), transparent 70%), radial-gradient(ellipse 100% 45% at 50% 100%, hsl(180 40% 82% / 0.45), transparent 80%)",
        }}
      />
      {/* Water ripple rings */}
      <svg
        viewBox="0 0 200 200"
        className="absolute left-1/2 bottom-4 -translate-x-1/2 w-[80%] opacity-[0.18]"
      >
        {[30, 45, 60].map((r) => (
          <ellipse
            key={r}
            cx="100"
            cy="100"
            rx={r}
            ry={r / 6}
            fill="none"
            stroke="hsl(190 60% 45%)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}

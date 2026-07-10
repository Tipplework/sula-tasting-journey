import { flights } from "@/data/wines";
import { FlightCard } from "./FlightCard";

interface FlightSelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function FlightSelector({ selectedId, onSelect }: FlightSelectorProps) {
  return (
    <div className="space-y-2.5">
      <div className="text-center">
        <p className="text-[0.65rem] tracking-[0.25em] uppercase text-muted-foreground">
          Choose Your Journey
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {flights
          .filter((f) => f.active)
          .map((f) => (
            <FlightCard
              key={f.id}
              flight={f}
              selected={selectedId === f.id}
              onSelect={onSelect}
            />
          ))}
      </div>
    </div>
  );
}

import { DIETARY_LABELS } from "@/data/tasting-room-menu";
import { DietaryIcon, DIETARY_ORDER } from "./DietaryIcon";

export function DietaryLegend() {
  return (
    <div className="mx-auto max-w-md">
      <p className="font-tr-display mb-3 text-center text-[0.7rem] uppercase tracking-[0.22em] text-tr-black/70">
        Menu Key
      </p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {DIETARY_ORDER.map((tag) => (
          <li key={tag} className="flex items-center gap-2">
            <DietaryIcon tag={tag} size={14} />
            <span className="font-tr-body text-[0.72rem] leading-tight text-tr-body">
              {DIETARY_LABELS[tag]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

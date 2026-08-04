import { X } from "lucide-react";
import type { DietaryTag } from "@/data/tasting-room-menu";
import { DIETARY_LABELS } from "@/data/tasting-room-menu";
import { DietaryIcon } from "./DietaryIcon";

const SHOW_ONLY: DietaryTag[] = [
  "vegetarian",
  "non_vegetarian",
  "seafood",
  "vegan",
  "gluten_free",
];
const HIDE_IF: DietaryTag[] = ["contains_dairy", "contains_nuts"];

export function DietaryFilterSheet({
  showOnly,
  hideIf,
  onToggleShowOnly,
  onToggleHideIf,
  onClear,
  onClose,
}: {
  showOnly: DietaryTag[];
  hideIf: DietaryTag[];
  onToggleShowOnly: (t: DietaryTag) => void;
  onToggleHideIf: (t: DietaryTag) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const chip = (
    tag: DietaryTag,
    active: boolean,
    toggle: (t: DietaryTag) => void,
  ) => (
    <button
      key={tag}
      type="button"
      aria-pressed={active}
      onClick={() => toggle(tag)}
      className={`font-tr-body flex items-center gap-2 rounded-full border px-3 py-2 text-[0.74rem] transition-colors ${
        active
          ? "border-tr-olive bg-tr-olive/12 text-tr-black"
          : "border-tr-rule text-tr-body"
      }`}
    >
      <DietaryIcon tag={tag} size={14} />
      {DIETARY_LABELS[tag]}
    </button>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-tr-black/40 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Dietary filters"
        className="w-full max-w-md rounded-t-2xl bg-tr-cream p-5 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-tr-display text-[0.8rem] uppercase tracking-[0.18em] text-tr-black">
            Dietary Filters
          </h2>
          <button type="button" onClick={onClose} aria-label="Close filters">
            <X className="h-5 w-5 text-tr-body" />
          </button>
        </div>

        <p className="font-tr-display mt-5 text-[0.64rem] uppercase tracking-[0.2em] text-tr-black/60">
          Show only
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SHOW_ONLY.map((t) => chip(t, showOnly.includes(t), onToggleShowOnly))}
        </div>

        <p className="font-tr-display mt-5 text-[0.64rem] uppercase tracking-[0.2em] text-tr-black/60">
          Hide items containing
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {HIDE_IF.map((t) => chip(t, hideIf.includes(t), onToggleHideIf))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClear}
            className="font-tr-display flex-1 rounded-full border border-tr-rule px-5 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-tr-body"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-tr-display flex-1 rounded-full bg-tr-black px-5 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-tr-cream"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

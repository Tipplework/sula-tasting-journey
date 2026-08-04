import { X } from "lucide-react";
import type { DietaryTag } from "@/data/tasting-room-menu";
import { DIETARY_LABELS } from "@/data/tasting-room-menu";
import { DietaryIcon } from "./DietaryIcon";
import { useScrollLock } from "@/hooks/use-scroll-lock";

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
  useScrollLock(true);

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
      className={`font-tr-body flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.78rem] transition-colors ${
        active
          ? "border-tr-olive bg-tr-olive/12 text-tr-black"
          : "border-tr-rule text-tr-body"
      }`}
    >
      <DietaryIcon tag={tag} size={16} />
      {DIETARY_LABELS[tag]}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-tr-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Dietary filters"
        className="relative flex max-h-[85svh] w-full max-w-md flex-col rounded-t-3xl bg-tr-cream shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between px-6 pb-2 pt-5">
          <h2 className="font-tr-display text-[0.8rem] uppercase tracking-[0.18em] text-tr-black">
            Dietary Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-full p-1.5 text-tr-body"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-2">
          <p className="font-tr-display mt-3 text-[0.62rem] uppercase tracking-[0.2em] text-tr-black/55">
            Show only
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {SHOW_ONLY.map((t) => chip(t, showOnly.includes(t), onToggleShowOnly))}
          </div>

          <p className="font-tr-display mt-6 text-[0.62rem] uppercase tracking-[0.2em] text-tr-black/55">
            Hide items containing
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {HIDE_IF.map((t) => chip(t, hideIf.includes(t), onToggleHideIf))}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-4">
          <button
            type="button"
            onClick={onClear}
            className="font-tr-display min-h-12 flex-1 rounded-full border border-tr-rule px-5 text-[0.72rem] uppercase tracking-[0.18em] text-tr-body"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-tr-display min-h-12 flex-1 rounded-full bg-tr-black px-5 text-[0.72rem] uppercase tracking-[0.18em] text-tr-cream"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

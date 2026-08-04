import { MENU_FOOTNOTES } from "@/data/tasting-room-menu";
import { useScrollLock } from "@/hooks/use-scroll-lock";

/** Shown once per session before the menu, carrying the printed notes. */
export function DisclaimerModal({ onAccept }: { onAccept: () => void }) {
  useScrollLock(true);

  const notes = [
    ...MENU_FOOTNOTES,
    "Alcohol is served only to guests aged 21 and above. Please drink responsibly and never drink and drive.",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div aria-hidden="true" className="absolute inset-0 bg-tr-black/60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tr-note-title"
        className="relative flex max-h-[90svh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-tr-cream shadow-2xl sm:rounded-3xl"
      >
        <div className="bg-tr-black px-6 py-5">
          <h2
            id="tr-note-title"
            className="font-tr-display text-[0.95rem] uppercase tracking-[0.18em] text-tr-cream"
          >
            Please Note
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          <ul className="space-y-3">
            {notes.map((note) => (
              <li key={note} className="flex gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-tr-gold"
                />
                <span className="font-tr-body text-[0.8rem] leading-relaxed text-tr-body">
                  {note}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 pb-7">
          <button
            type="button"
            onClick={onAccept}
            className="font-tr-display w-full rounded-full bg-tr-black py-4 text-[0.74rem] uppercase tracking-[0.2em] text-tr-cream"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

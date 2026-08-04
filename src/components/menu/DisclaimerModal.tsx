import { MENU_FOOTNOTES } from "@/data/tasting-room-menu";
import sunArt from "@/assets/menu/art-sun.webp.asset.json";

/** Shown once before the menu, carrying the printed allergen and tax notes. */
export function DisclaimerModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-tr-black/50 px-3 pb-3 pt-10 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tr-note-title"
        className="max-h-full w-full max-w-md overflow-y-auto rounded-t-2xl bg-tr-cream p-6 shadow-2xl sm:rounded-2xl"
      >
        <img
          src={sunArt.url}
          alt=""
          aria-hidden="true"
          className="mx-auto mb-3 h-12 w-auto"
        />
        <h2
          id="tr-note-title"
          className="font-tr-display text-center text-[1.05rem] uppercase tracking-[0.16em] text-tr-black"
        >
          Please Note
        </h2>
        <ul className="mt-5 space-y-2.5">
          {MENU_FOOTNOTES.map((note) => (
            <li key={note} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-tr-gold"
              />
              <span className="font-tr-body text-[0.78rem] leading-relaxed text-tr-body">
                {note}
              </span>
            </li>
          ))}
          <li className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-tr-gold"
            />
            <span className="font-tr-body text-[0.78rem] leading-relaxed text-tr-body">
              Alcohol is served only to guests aged 21 and above. Please drink
              responsibly and never drink and drive.
            </span>
          </li>
        </ul>
        <button
          type="button"
          onClick={onAccept}
          className="font-tr-display mt-7 w-full rounded-full bg-tr-black px-6 py-3.5 text-[0.75rem] uppercase tracking-[0.22em] text-tr-cream"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}

import { X } from "lucide-react";
import { PRIVACY_SECTIONS } from "@/lib/consent/privacy-notice";
import { CURRENT_PRIVACY_VERSION } from "@/store/tasting-store";

/** Menu-styled privacy notice sheet (same copy as the wine flight notice). */
export function MenuPrivacyNotice({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close privacy notice"
        onClick={onClose}
        className="absolute inset-0 bg-tr-black/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tr-privacy-title"
        className="relative flex max-h-[90svh] w-full max-w-md flex-col rounded-t-3xl bg-tr-cream shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-tr-rule px-6 pb-4 pt-6">
          <div>
            <p className="font-tr-display text-[0.6rem] uppercase tracking-[0.24em] text-tr-gold-deep">
              Sula Vineyards
            </p>
            <h2
              id="tr-privacy-title"
              className="font-tr-display mt-1 text-[1.05rem] uppercase tracking-[0.14em] text-tr-black"
            >
              Privacy Notice
            </h2>
            <p className="font-tr-body mt-1 text-[0.68rem] text-tr-body/80">
              Version {CURRENT_PRIVACY_VERSION} · Digital Personal Data
              Protection Act, 2023
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-1.5 p-1.5 text-tr-body hover:text-tr-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5">
          {PRIVACY_SECTIONS.map((s) => (
            <div key={s.title}>
              <h3 className="font-tr-display text-[0.72rem] uppercase tracking-[0.14em] text-tr-ink">
                {s.title}
              </h3>
              <p className="font-tr-body mt-1 text-[0.78rem] leading-relaxed text-tr-body">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <div className="px-6 pb-7 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="font-tr-display min-h-12 w-full rounded-full border border-tr-rule py-3.5 text-[0.72rem] uppercase tracking-[0.2em] text-tr-body"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

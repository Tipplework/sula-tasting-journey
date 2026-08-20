import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { CURRENT_PRIVACY_VERSION } from "@/store/tasting-store";
import { PRIVACY_SECTIONS as sections } from "@/lib/consent/privacy-notice";

interface PrivacyNoticeModalProps {
  open: boolean;
  onClose: () => void;
}

export function PrivacyNoticeModal({ open, onClose }: PrivacyNoticeModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="privacy"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-3 sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-title"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="wine-card-elevated w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-border/60">
              <div>
                <p className="text-[0.65rem] tracking-[0.25em] uppercase text-muted-foreground">
                  Sula Vineyards
                </p>
                <h2 id="privacy-title" className="font-heading text-xl font-bold mt-1">
                  Privacy Notice
                </h2>
                <p className="text-[0.65rem] text-muted-foreground mt-1">
                  Version {CURRENT_PRIVACY_VERSION} · Digital Personal Data Protection Act, 2023
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 -m-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-4">
              {sections.map((s) => (
                <div key={s.title}>
                  <h3 className="font-heading text-sm font-semibold">{s.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground mt-1">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3.5 border-t border-border/60 flex justify-end">
              <button type="button" onClick={onClose} className="btn-primary text-sm !py-2 !px-5">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

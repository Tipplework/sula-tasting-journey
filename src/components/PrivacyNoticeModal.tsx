import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { CURRENT_PRIVACY_VERSION } from "@/store/tasting-store";

interface PrivacyNoticeModalProps {
  open: boolean;
  onClose: () => void;
}

const sections: { title: string; body: string }[] = [
  {
    title: "About this tasting",
    body: "This experience is offered by Sula Vineyards to personalise your in-venue wine tasting. It is an editorial guest experience, not a purchase or account signup.",
  },
  {
    title: "Information we collect",
    body: "The name you enter, the wine flight you choose, your tasting choices, and — with your consent — a phone number and email to send you future invitations. Optional analytics identify device type and language, never personal identifiers.",
  },
  {
    title: "Purpose",
    body: "To guide you through the tasting, remember your choices during this session, and — if you opt in — invite you to tastings, releases and events. We do not sell your data.",
  },
  {
    title: "Storage",
    body: "Session data lives in your browser. Any contact details you choose to share are stored securely on Sula Vineyards' managed infrastructure and access is restricted to authorised staff.",
  },
  {
    title: "Retention",
    body: "Session data is cleared when you clear your browser. Contact details are retained only while relevant to Sula Vineyards' hospitality and marketing programs and can be removed on request.",
  },
  {
    title: "Your rights",
    body: "You can request access to, correction of, or deletion of your personal information at any time. You can also withdraw consent for marketing communications.",
  },
  {
    title: "Contact",
    body: "For any privacy request, email privacy@sulavineyards.com — a member of our team will respond within a reasonable time.",
  },
  {
    title: "Future integrations",
    body: "Sula Vineyards may connect this experience with hospitality (HOST) or CRM systems to enhance guest service. Your consent choices carry across those systems and remain revocable.",
  },
];

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

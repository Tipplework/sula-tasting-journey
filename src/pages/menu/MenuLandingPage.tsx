import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MenuCanvas, useMenuMeta } from "./MenuCanvas";
import { RegistrationModal } from "@/components/menu/RegistrationModal";
import { DisclaimerModal } from "@/components/menu/DisclaimerModal";
import { menuSession } from "@/lib/menu/session";
import { prefetchMenu } from "@/lib/menu/useMenu";
import trLogo from "@/assets/menu/art-tr-logo.webp";
import coverPour from "@/assets/menu/art-cover-pour.webp";
import glassVineyard from "@/assets/menu/art-glass-vineyard.webp";
import hills from "@/assets/menu/art-hills.webp";

type Step = "landing" | "register" | "disclaimer";

export default function MenuLandingPage() {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("landing");
  useMenuMeta(
    "The Tasting Room Menu | Sula Vineyards",
    "Wines, cocktails and small plates served at The Tasting Room, Sula Vineyards, Nashik.",
  );

  useEffect(() => {
    prefetchMenu();
  }, []);

  const start = () => {
    if (menuSession.introComplete()) return nav("/menu/select");
    if (!menuSession.registrationDone()) return setStep("register");
    setStep("disclaimer");
  };

  return (
    <MenuCanvas>
      <div className="relative flex min-h-[100svh] flex-col overflow-hidden bg-tr-cover">
        {/* Cover composition, mirroring the printed Tasting Room menu. */}
        <img
          src={coverPour}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-4 w-[52%] max-w-[300px] opacity-95"
        />
        <img
          src={glassVineyard}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[16%] mx-auto w-[92%] max-w-[460px] opacity-95"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 w-full"
        >
          <img src={hills} alt="" loading="lazy" className="w-full opacity-55" />
          <span className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-tr-cover to-transparent" />
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col items-center px-7 pb-9 pt-[7vh] text-center">
          <img
            src={trLogo}
            alt="The Tasting Room at Sula Vineyards"
            className="w-[42%] max-w-[168px]"
          />

          <h1 className="font-tr-display mt-7 text-[2.5rem] uppercase leading-[0.92] tracking-[0.01em] text-tr-black sm:text-[3rem]">
            Tasting Room
          </h1>
          <p className="font-tr-script -mt-1 text-[2.6rem] leading-none text-tr-red sm:text-[3rem]">
            Menu
          </p>
          <span
            aria-hidden="true"
            className="mt-2 block h-[3px] w-20 rounded-full bg-tr-gold"
          />

          <div className="mt-auto w-full pt-[46vh]">
            <p className="font-tr-display mb-2 text-[0.62rem] uppercase tracking-[0.28em] text-tr-ink/60">
              Nashik · Maharashtra · Est. 1999
            </p>
            <div className="font-tr-body mb-3 flex items-center justify-between gap-3 text-[0.6rem] text-tr-body/70">
              <span>Taxes will be charged as applicable</span>
              <span>125 ml pour per wine glass</span>
            </div>
            <button
              type="button"
              onClick={start}
              className="font-tr-display w-full rounded-full bg-tr-black py-4.5 text-[0.8rem] uppercase tracking-[0.24em] text-tr-cream shadow-xl transition-transform active:scale-[0.98]"
            >
              View Menu
            </button>
          </div>
        </div>
      </div>

      {step === "register" && (
        <RegistrationModal
          onDone={() => {
            menuSession.markRegistrationDone();
            if (menuSession.disclaimerDone()) nav("/menu/select");
            else setStep("disclaimer");
          }}
        />
      )}
      {step === "disclaimer" && (
        <DisclaimerModal
          onAccept={() => {
            menuSession.markDisclaimerDone();
            nav("/menu/select");
          }}
        />
      )}
    </MenuCanvas>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MenuCanvas, useMenuMeta } from "./MenuCanvas";
import { RegistrationModal } from "@/components/menu/RegistrationModal";
import { DisclaimerModal } from "@/components/menu/DisclaimerModal";
import { menuSession } from "@/lib/menu/session";
import { prefetchMenu } from "@/lib/menu/useMenu";
import trLogo from "@/assets/menu/art-tr-logo.webp.asset.json";
import coverPour from "@/assets/menu/art-cover-pour.webp.asset.json";
import coverSwirl from "@/assets/menu/art-cover-swirl.webp.asset.json";
import hills from "@/assets/menu/art-hills.webp.asset.json";

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
        <img
          src={coverSwirl.url}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-14 -top-6 w-[46%] max-w-[280px] opacity-70"
        />
        <img
          src={coverPour.url}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-4 w-[42%] max-w-[260px] opacity-95"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 w-full"
        >
          <img
            src={hills.url}
            alt=""
            loading="lazy"
            className="w-full opacity-60"
          />
          <span className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-tr-cover to-transparent" />
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col items-center px-7 pb-9 pt-[13vh] text-center">
          <img
            src={trLogo.url}
            alt="The Tasting Room at Sula Vineyards"
            className="w-[48%] max-w-[190px]"
          />

          <p className="font-tr-display mt-8 text-[0.66rem] uppercase tracking-[0.32em] text-tr-gold-deep">
            Welcome to
          </p>
          <h1 className="font-tr-display mt-2 text-[2.5rem] uppercase leading-[0.92] tracking-[0.02em] text-tr-black sm:text-[3rem]">
            The Tasting
            <br />
            Room
          </h1>
          <span
            aria-hidden="true"
            className="mt-4 block h-[3px] w-16 rounded-full bg-tr-gold"
          />
          <p className="font-tr-script mt-4 text-[1.4rem] leading-tight text-tr-gold-deep">
            Home of Indian Wine Tourism
          </p>

          <div className="mt-auto w-full pt-14">
            <p className="font-tr-display mb-4 text-[0.62rem] uppercase tracking-[0.28em] text-tr-ink/60">
              Nashik · Maharashtra · Est. 1999
            </p>
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

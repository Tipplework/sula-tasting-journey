import sulaLogo from "@/assets/menu/art-sula-logo.webp.asset.json";
import vineyardFooter from "@/assets/menu/art-vineyard-footer.webp.asset.json";
import { DietaryLegend } from "./DietaryLegend";
import { MENU_FOOTNOTES } from "@/data/tasting-room-menu";

export function MenuFooter() {
  return (
    <footer className="mt-8 border-t border-tr-rule/50 bg-tr-cover/40 px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <DietaryLegend />


        <ul className="mt-6 space-y-1">
          {MENU_FOOTNOTES.map((note) => (
            <li
              key={note}
              className="font-tr-body text-[0.68rem] leading-relaxed text-tr-body/80"
            >
              {note}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-tr-rule/50 pt-6">
          <div>
            <p className="font-tr-display text-[0.72rem] uppercase tracking-[0.2em] text-tr-black">
              The Tasting Room
            </p>
            <p className="font-tr-script mt-1 text-[1.05rem] leading-none text-tr-gold-deep">
              Home of Indian Wine Tourism
            </p>
          </div>
          <img
            src={sulaLogo.url}
            alt="Sula Vineyards"
            loading="lazy"
            className="h-8 w-auto"
          />
        </div>

        <nav
          aria-label="Footer"
          className="font-tr-body mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[0.7rem] text-tr-body"
        >
          <a className="underline underline-offset-4" href="https://sulavineyards.com" target="_blank" rel="noreferrer">
            Website
          </a>
          <a className="underline underline-offset-4" href="https://sulavineyards.com/privacy-policy" target="_blank" rel="noreferrer">
            Privacy
          </a>
          <a className="underline underline-offset-4" href="https://sulavineyards.com/terms-conditions" target="_blank" rel="noreferrer">
            Terms
          </a>
          <span>Drink responsibly · 21+</span>
        </nav>
      </div>
    </footer>
  );
}

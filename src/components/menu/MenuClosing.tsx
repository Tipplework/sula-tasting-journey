import barrels from "@/assets/menu/art-barrels.webp.asset.json";
import sulaLogo from "@/assets/menu/art-sula-logo.webp.asset.json";
import { DietaryLegend } from "./DietaryLegend";
import { MENU_FOOTNOTES } from "@/data/tasting-room-menu";

export function MenuClosing() {
  return (
    <footer className="mt-10 px-5 pb-12">
      <DietaryLegend />

      <ul className="mx-auto mt-8 max-w-md space-y-1.5">
        {MENU_FOOTNOTES.map((note) => (
          <li
            key={note}
            className="font-tr-body text-center text-[0.68rem] leading-relaxed text-tr-body/85"
          >
            {note}
          </li>
        ))}
      </ul>

      <img
        src={barrels.url}
        alt=""
        aria-hidden="true"
        className="mx-auto mt-8 w-full max-w-sm"
      />

      <p className="font-tr-script mt-4 text-center text-[1.5rem] leading-tight text-tr-gold-deep">
        Thank you for visiting
      </p>
      <img
        src={sulaLogo.url}
        alt="Sula Vineyards"
        className="mx-auto mt-4 h-9 w-auto"
      />
    </footer>
  );
}

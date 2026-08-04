import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed, Wine } from "lucide-react";
import { MenuCanvas, useMenuMeta } from "./MenuCanvas";
import { menuSession } from "@/lib/menu/session";
import { prefetchMenu } from "@/lib/menu/useMenu";
import trLogo from "@/assets/menu/art-tr-logo.webp.asset.json";
import glassVineyard from "@/assets/menu/art-glass-vineyard.webp.asset.json";
import barrels from "@/assets/menu/art-barrels.webp.asset.json";
import { MenuFooter } from "@/components/menu/MenuFooter";

const CARDS = [
  {
    to: "/menu/wine",
    Icon: Wine,
    title: "Wine Menu",
    cta: "View Wine Menu",
    art: glassVineyard.url,
    sections: ["Sparkling", "White", "Rosé", "Red", "Dessert Wine"],
  },
  {
    to: "/menu/food",
    Icon: UtensilsCrossed,
    title: "Food Menu",
    cta: "View Food Menu",
    art: barrels.url,
    sections: ["Cocktails", "Small Plates", "Quick Bites", "Pizza", "Desserts"],
  },
];


export default function MenuSelectPage() {
  const nav = useNavigate();
  useMenuMeta(
    "Menu | The Tasting Room, Sula Vineyards",
    "Choose the wine list or the food menu at The Tasting Room, Sula Vineyards.",
  );

  useEffect(() => {
    prefetchMenu();
    if (!menuSession.introComplete()) nav("/menu", { replace: true });
  }, [nav]);

  return (
    <MenuCanvas>
      <div className="min-h-[100svh]">
        <header className="border-b border-tr-rule/50 bg-tr-cream/95 px-5 py-3.5">
          <img
            src={trLogo.url}
            alt="The Tasting Room at Sula Vineyards"
            className="mx-auto h-9 w-auto"
          />
        </header>

        <main className="mx-auto max-w-3xl px-5 pb-10 pt-9">
          <h1 className="font-tr-display text-center text-[1.5rem] uppercase leading-none tracking-[0.14em] text-tr-black">
            View Menu
          </h1>
          <p className="font-tr-body mt-2.5 text-center text-[0.85rem] text-tr-body">
            Select what you'd like to explore.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {CARDS.map((card) => (
              <Link
                key={card.to}
                to={card.to}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-tr-rule/60 bg-white/55 p-6 shadow-sm transition-transform active:scale-[0.99]"
              >
                <img
                  src={card.art}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="pointer-events-none absolute -bottom-3 -right-4 w-32 opacity-15"
                />
                <span aria-hidden="true" className="text-[1.7rem] leading-none">
                  {card.emoji}
                </span>
                <h2 className="font-tr-display mt-4 text-[1.05rem] uppercase tracking-[0.16em] text-tr-black">
                  {card.title}
                </h2>
                <ul className="font-tr-body relative mt-3 space-y-1 text-[0.8rem] text-tr-body">
                  {card.sections.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <span className="font-tr-display mt-6 inline-flex items-center justify-center rounded-full bg-tr-black px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-tr-cream">
                  {card.cta}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-7 text-center">
            <Link
              to="/menu/all"
              className="font-tr-display text-[0.68rem] uppercase tracking-[0.2em] text-tr-gold-deep underline underline-offset-4"
            >
              View Complete Menu
            </Link>
          </div>
        </main>

        <MenuFooter />
      </div>
    </MenuCanvas>
  );
}

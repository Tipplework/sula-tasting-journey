import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Coffee, Martini, UtensilsCrossed, Wine } from "lucide-react";
import { MenuCanvas, useMenuMeta } from "./MenuCanvas";
import { menuSession } from "@/lib/menu/session";
import { prefetchMenu } from "@/lib/menu/useMenu";
import trLogo from "@/assets/menu/art-tr-logo.webp";
import glassVineyard from "@/assets/menu/art-glass-vineyard.webp";
import barrels from "@/assets/menu/art-barrels.webp";
import swirl from "@/assets/menu/art-swirl.webp";
import grapeDivider from "@/assets/menu/art-grape-divider.webp";
import { MenuFooter } from "@/components/menu/MenuFooter";
import { MODE_META } from "@/lib/menu/groups";

const CARDS = [
  {
    to: MODE_META.wine.path,
    Icon: Wine,
    title: "Wine",
    copy: MODE_META.wine.kicker,
    art: glassVineyard,
  },
  {
    to: MODE_META.food.path,
    Icon: UtensilsCrossed,
    title: "Food",
    copy: MODE_META.food.kicker,
    art: barrels,
  },
  {
    to: MODE_META.cocktails.path,
    Icon: Martini,
    title: "Cocktails",
    copy: MODE_META.cocktails.kicker,
    art: swirl,
  },
  {
    to: MODE_META.drinks.path,
    Icon: Coffee,
    title: "Drinks",
    copy: MODE_META.drinks.kicker,
    art: grapeDivider,
  },
];

export default function MenuSelectPage() {
  const nav = useNavigate();
  useMenuMeta(
    "Menu | The Tasting Room, Sula Vineyards",
    "Choose wine, cocktails, drinks or food at The Tasting Room, Sula Vineyards.",
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
            src={trLogo}
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

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {CARDS.map((card) => (
              <Link
                key={card.to}
                to={card.to}
                className="tr-tile group relative flex items-center gap-4 overflow-hidden"
              >
                <img
                  src={card.art}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="pointer-events-none absolute -right-6 -top-4 w-28 opacity-[0.1]"
                />
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tr-olive/[0.12] text-tr-olive">
                  <card.Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="font-tr-display block text-[1rem] uppercase tracking-[0.16em] text-tr-black">
                    {card.title}
                  </span>
                  <span className="font-tr-body mt-1 block text-[0.78rem] leading-relaxed text-tr-body">
                    {card.copy}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="relative h-4 w-4 shrink-0 text-tr-black/40 transition-transform group-hover:translate-x-0.5"
                />
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

import { useEffect, useState } from "react";
import { fetchMenu, SEED_MENU, type MenuCategoryView } from "@/lib/menu/api";
import { MenuCover } from "@/components/menu/MenuCover";
import { RegistrationModal } from "@/components/menu/RegistrationModal";
import { DisclaimerModal } from "@/components/menu/DisclaimerModal";
import { MenuScreen } from "@/components/menu/MenuScreen";

type Stage = "cover" | "register" | "disclaimer" | "menu";

const SEEN_KEY = "trMenuIntroSeen";

export default function TastingRoomMenuPage() {
  const [stage, setStage] = useState<Stage>("cover");
  const [categories, setCategories] = useState<MenuCategoryView[]>(SEED_MENU);

  useEffect(() => {
    document.title = "The Tasting Room Menu | Sula Vineyards";
    const desc =
      "Explore the wines, cocktails and small plates served at The Tasting Room, Sula Vineyards, Nashik.";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    const previousTitle = document.title;
    meta.content = desc;
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    let live = true;
    fetchMenu().then((res) => {
      if (live) setCategories(res.categories);
    });
    return () => {
      live = false;
    };
  }, []);

  const openMenu = () => {
    const seen =
      typeof window !== "undefined" && localStorage.getItem(SEEN_KEY) === "1";
    setStage(seen ? "menu" : "register");
  };

  const finishIntro = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private browsing — the intro simply shows again */
    }
    setStage("menu");
  };

  return (
    <div className="tr-scope">
      {stage === "cover" && <MenuCover onOpen={openMenu} />}
      {stage === "register" && (
        <>
          <MenuCover onOpen={openMenu} />
          <RegistrationModal onDone={() => setStage("disclaimer")} />
        </>
      )}
      {stage === "disclaimer" && (
        <>
          <MenuCover onOpen={openMenu} />
          <DisclaimerModal onAccept={finishIntro} />
        </>
      )}
      {stage === "menu" && <MenuScreen categories={categories} />}
    </div>
  );
}

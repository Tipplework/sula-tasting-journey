import coverPour from "@/assets/menu/art-cover-pour.webp.asset.json";
import coverGlass from "@/assets/menu/art-cover-glass.webp.asset.json";
import coverSwirl from "@/assets/menu/art-cover-swirl.webp.asset.json";
import trLogo from "@/assets/menu/art-tr-logo.webp.asset.json";

export function MenuCover({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-tr-cover">
      <img
        src={coverSwirl.url}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-0 w-[52%] max-w-[320px] opacity-90"
      />
      <img
        src={coverPour.url}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 top-2 w-[46%] max-w-[300px]"
      />

      <div className="relative flex min-h-[100svh] flex-col items-center px-6 pb-4 pt-[16vh]">
        <img
          src={trLogo.url}
          alt="The Tasting Room at Sula Vineyards"
          className="w-[58%] max-w-[260px]"
        />

        <h1 className="mt-8 text-center">
          <span className="font-tr-display block text-[2.6rem] uppercase leading-[0.92] tracking-[0.02em] text-tr-black sm:text-[3.4rem]">
            Tasting
          </span>
          <span className="font-tr-display block text-[2.6rem] uppercase leading-[0.92] tracking-[0.02em] text-tr-black sm:text-[3.4rem]">
            Room
          </span>
          <span className="font-tr-script mt-1 block text-[2.6rem] leading-none text-tr-red sm:text-[3.2rem]">
            Menu
          </span>
        </h1>

        <span
          aria-hidden="true"
          className="mt-3 block h-[3px] w-24 rounded-full bg-tr-gold"
        />

        <p className="font-tr-script mt-5 text-center text-[1.35rem] leading-tight text-tr-gold-deep">
          Home of Indian Wine Tourism
        </p>

        <div className="mt-auto w-full pt-8">
          <button
            type="button"
            onClick={onOpen}
            className="font-tr-display mx-auto block rounded-full bg-tr-black px-9 py-3.5 text-[0.78rem] uppercase tracking-[0.24em] text-tr-cream transition-transform active:scale-[0.98]"
          >
            View Menu
          </button>
          <img
            src={coverGlass.url}
            alt=""
            aria-hidden="true"
            className="pointer-events-none mt-4 w-full select-none"
          />
        </div>
      </div>
    </div>
  );
}

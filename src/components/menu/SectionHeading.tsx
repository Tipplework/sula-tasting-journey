/**
 * Section heading in the printed style: a hand-drawn yellow "ghost" copy of the
 * word sits behind the black condensed title, exactly as on the printed pages.
 */
export function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="relative mb-5 select-none text-center">
      <span
        aria-hidden="true"
        className="font-tr-brush pointer-events-none absolute inset-x-0 top-2 translate-x-2 text-tr-ghost text-[2.1rem] leading-none tracking-tight opacity-75 sm:text-[2.6rem]"
      >
        {children}

      </span>
      <span className="font-tr-display relative block text-[1.35rem] uppercase leading-none tracking-[0.18em] text-tr-black sm:text-[1.6rem]">
        {children}
      </span>
    </h2>
  );
}

export function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="mb-3 flex items-center gap-3">
      <span className="font-tr-display shrink-0 text-[0.82rem] uppercase leading-none tracking-[0.22em] text-tr-black">
        {children}
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-tr-rule/70" />
    </h2>
  );
}

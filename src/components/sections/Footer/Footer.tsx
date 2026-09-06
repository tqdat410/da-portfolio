"use client";

export function Footer() {
  return (
    <footer
      id="footer"
      className="w-screen overflow-hidden border-t border-[var(--brand-fg)] bg-[var(--brand-bg)] px-2 py-10 md:px-4"
    >
      <div className="flex w-full justify-end">
        <span className="block text-right text-4xl leading-none font-bold text-[var(--brand-fg)] md:text-6xl lg:text-8xl">
          Tran Quoc Dat.
        </span>
      </div>
    </footer>
  );
}

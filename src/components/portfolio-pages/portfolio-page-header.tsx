import Link from "next/link";

interface PortfolioPageHeaderProps {
  active?: "projects" | "certificates";
}

const navigation = [
  { label: "Projects", href: "/projects", id: "projects" },
  { label: "Certificates", href: "/certificates", id: "certificates" },
] as const;

export function PortfolioPageHeader({ active }: PortfolioPageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-[4.8125rem] border-b border-[var(--brand-bg)]/15 bg-[var(--brand-fg)] md:h-[4.75rem]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="focus-ring flex items-center font-luxurious-roman text-sm font-bold tracking-[-0.02em] text-[var(--brand-bg)] sm:text-base"
        >
          Da&apos;portfolio
        </Link>

        <nav aria-label="Portfolio pages">
          <ul className="flex items-center gap-1 sm:gap-3">
            {navigation.map((item) => {
              const isActive = item.id === active;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`focus-ring relative flex min-h-11 items-center px-2 text-xs font-medium text-[var(--brand-bg)] transition-opacity duration-300 sm:px-3 sm:text-sm ${
                      isActive ? "font-bold" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {item.label}
                    {isActive ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2 bottom-1.5 h-px bg-[var(--brand-bg)] sm:inset-x-3"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

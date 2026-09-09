import type { CertificateDocument } from "@/lib/certificates-markdown";

interface CertificateIndexProps {
  document: CertificateDocument;
}

export function CertificateIndex({ document }: CertificateIndexProps) {
  return (
    <div className="border-t border-[var(--brand-bg)]">
      {document.categories.map((category) => (
        <section
          key={category.name}
          aria-labelledby={`certificate-group-${category.name.replaceAll(" ", "-").toLowerCase()}`}
          className="grid border-b border-[var(--brand-bg)] py-8 md:grid-cols-[minmax(10rem,0.45fr)_minmax(0,1fr)] md:gap-10 md:py-12"
        >
          <header className="mb-6 md:mb-0">
            <h2
              id={`certificate-group-${category.name.replaceAll(" ", "-").toLowerCase()}`}
              className="text-2xl font-bold tracking-[-0.03em] text-[var(--brand-bg)]"
            >
              {category.name}
            </h2>
            <p className="mt-2 font-mono text-xs text-[var(--brand-bg)]/50">
              {category.items.length} credentials
            </p>
          </header>

          <ol>
            {category.items.map((certificate, index) => {
              const content = (
                <>
                  <span className="font-mono text-xs opacity-45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base leading-6 font-bold sm:text-lg">
                      {certificate.title}
                    </span>
                    <span className="mt-1 block text-sm leading-5 opacity-60">
                      {certificate.provider}
                    </span>
                  </span>
                  <span className="col-start-2 font-mono text-[0.7rem] tracking-[0.1em] uppercase opacity-55 sm:col-start-3 sm:justify-self-end">
                    {certificate.url ? "View ↗" : "Unavailable"}
                  </span>
                </>
              );

              return (
                <li
                  key={certificate.title}
                  className="border-t border-[var(--brand-bg)]/20 first:border-t-0"
                >
                  {certificate.url ? (
                    <a
                      href={certificate.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group focus-ring grid min-h-24 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-1 py-5 text-[var(--brand-bg)] transition-colors duration-500 hover:bg-[var(--brand-bg)] hover:text-[var(--brand-fg)] focus-visible:bg-[var(--brand-bg)] focus-visible:text-[var(--brand-fg)] sm:grid-cols-[2.5rem_minmax(0,1fr)_6rem] sm:px-3"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="grid min-h-24 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-1 py-5 text-[var(--brand-bg)]/45 sm:grid-cols-[2.5rem_minmax(0,1fr)_6rem] sm:px-3">
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

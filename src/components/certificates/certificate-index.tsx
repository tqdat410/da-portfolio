import type { CertificateDocument } from "@/lib/certificates-markdown";

interface CertificateIndexProps {
  document: CertificateDocument;
}

export function CertificateIndex({ document }: CertificateIndexProps) {
  return (
    <div className="border-t border-[var(--brand-bg)]/20">
      {document.categories.map((category) => {
        const categoryId = `certificate-group-${category.name.replaceAll(" ", "-").toLowerCase()}`;

        return (
          <section
            key={category.name}
            aria-labelledby={categoryId}
            className="border-b border-[var(--brand-bg)]/20 py-6"
          >
            <h2
              id={categoryId}
              className="mb-2 text-base leading-7 font-semibold text-[var(--brand-bg)]"
            >
              {category.name}
            </h2>

            <ol>
              {category.items.map((certificate) => {
                const content = (
                  <>
                    <span className="block text-sm leading-6 font-medium underline-offset-4 group-hover:underline group-focus-visible:underline">
                      {certificate.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[var(--brand-bg)]/70">
                      {certificate.provider}
                    </span>
                    {!certificate.url && (
                      <span className="mt-1 block text-xs leading-5 text-[var(--brand-bg)]/70">
                        Unavailable
                      </span>
                    )}
                  </>
                );

                return (
                  <li key={certificate.title} className="py-1">
                    {certificate.url ? (
                      <a
                        href={certificate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group focus-ring block py-3 text-[var(--brand-bg)]"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="py-3 text-[var(--brand-bg)]">{content}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

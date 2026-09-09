import type { Metadata } from "next";
import { CertificateIndex } from "@/components/certificates/certificate-index";
import { PortfolioPageHeader } from "@/components/portfolio-pages/portfolio-page-header";
import { getCertificatesDoc } from "@/lib/certificates-markdown";

export const metadata: Metadata = {
  title: "Certificates",
  description: "Professional, technical, and academic credentials earned by Tran Quoc Dat.",
  alternates: { canonical: "/certificates" },
};

export default async function CertificatesPage() {
  const document = await getCertificatesDoc();
  const total = document.categories.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <div className="min-h-screen bg-[var(--brand-fg)] text-[var(--brand-bg)]">
      <PortfolioPageHeader active="certificates" />
      <main className="mx-auto max-w-7xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20 lg:px-10 lg:pt-28">
        <header className="grid gap-8 pb-14 md:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.5fr)] md:items-end md:pb-20">
          <h1 className="text-[clamp(3.4rem,12vw,6rem)] leading-[0.86] font-bold tracking-[-0.04em] text-balance">
            Certificates
          </h1>
          <div className="max-w-sm md:justify-self-end">
            <p className="text-base leading-7 text-[var(--brand-bg)]/65">
              A concise record of professional training, technical study, and academic achievement.
            </p>
            <p className="mt-5 font-mono text-xs tracking-[0.12em] uppercase">
              {total} credentials
            </p>
          </div>
        </header>
        <CertificateIndex document={document} />
      </main>
    </div>
  );
}

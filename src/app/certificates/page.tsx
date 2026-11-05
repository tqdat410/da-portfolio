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

  return (
    <div className="min-h-screen bg-[var(--brand-fg)] text-[var(--brand-bg)]">
      <PortfolioPageHeader active="certificates" />
      <main className="mx-auto max-w-4xl px-6 pt-12 pb-20 sm:pt-16">
        <header className="pb-8">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight">Certificates</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--brand-bg)]/70">
            Courses and training I&apos;ve completed along the way.
          </p>
        </header>
        <CertificateIndex document={document} />
      </main>
    </div>
  );
}

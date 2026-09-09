import type { Metadata } from "next";
import { PortfolioPageHeader } from "@/components/portfolio-pages/portfolio-page-header";
import { ProjectsIndex } from "@/components/projects/projects-index";
import { getAllProjectDocs } from "@/lib/projects-markdown";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected software, product, and university work by Tran Quoc Dat.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getAllProjectDocs();

  return (
    <div className="min-h-screen bg-[var(--brand-fg)] text-[var(--brand-bg)]">
      <PortfolioPageHeader active="projects" />
      <main className="mx-auto max-w-7xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20 lg:px-10 lg:pt-28">
        <header className="grid gap-8 pb-14 md:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.5fr)] md:items-end md:pb-20">
          <h1 className="text-[clamp(4rem,13vw,6rem)] leading-[0.86] font-bold tracking-[-0.04em] text-balance">
            Selected
            <br />
            projects
          </h1>
          <div className="max-w-sm md:justify-self-end">
            <p className="text-base leading-7 text-[var(--brand-bg)]/65">
              Projects across enterprise software, product delivery, and full-stack development.
            </p>
            <p className="mt-5 font-mono text-xs tracking-[0.12em] uppercase">
              {projects.length} case studies
            </p>
          </div>
        </header>
        <ProjectsIndex projects={projects} />
      </main>
    </div>
  );
}

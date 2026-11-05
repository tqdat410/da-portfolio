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
      <main className="mx-auto max-w-4xl px-6 pt-12 pb-20 sm:pt-16">
        <header className="pb-8">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight">Projects</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--brand-bg)]/70">
            A few things I&apos;ve worked on, independently and with a team.
          </p>
        </header>
        <ProjectsIndex projects={projects} />
      </main>
    </div>
  );
}

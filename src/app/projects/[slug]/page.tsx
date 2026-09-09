import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioPageHeader } from "@/components/portfolio-pages/portfolio-page-header";
import { ProjectArticle } from "@/components/projects/project-article";
import { getAllProjectDocs, getProjectDocBySlug } from "@/lib/projects-markdown";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getAllProjectDocs();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectDocBySlug(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectDocBySlug(slug);

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-[var(--brand-fg)] text-[var(--brand-bg)]">
      <PortfolioPageHeader active="projects" />
      <ProjectArticle project={project} />
    </div>
  );
}

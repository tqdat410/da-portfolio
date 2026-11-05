import Link from "next/link";
import type { ProjectMarkdownDoc } from "@/lib/projects-markdown";

const GITHUB_REPOSITORIES_URL = "https://github.com/tqdat410?tab=repositories";

interface ProjectsIndexProps {
  projects: ProjectMarkdownDoc[];
}

export function ProjectsIndex({ projects }: ProjectsIndexProps) {
  return (
    <ol className="border-t border-[var(--brand-bg)]/20">
      {projects.map((project) => (
        <li key={project.slug} className="border-b border-[var(--brand-bg)]/20">
          <Link
            href={`/projects/${project.slug}`}
            className="group focus-ring block py-6 text-[var(--brand-bg)]"
          >
            <span className="block text-lg leading-7 font-medium underline-offset-4 group-hover:underline group-focus-visible:underline">
              {project.title}
            </span>
            <span className="mt-2 block max-w-2xl text-sm leading-6 text-[var(--brand-bg)]/70">
              {project.summary}
            </span>
          </Link>
        </li>
      ))}

      <li className="border-b border-[var(--brand-bg)]/20">
        <a
          href={GITHUB_REPOSITORIES_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Others — GitHub repositories"
          className="group focus-ring block py-6 text-[var(--brand-bg)]"
        >
          <span className="block text-lg leading-7 font-medium underline-offset-4 group-hover:underline group-focus-visible:underline">
            Others
          </span>
          <span className="mt-2 block text-sm leading-6 text-[var(--brand-bg)]/70">
            Smaller experiments, utilities, and public source code.
          </span>
        </a>
      </li>
    </ol>
  );
}

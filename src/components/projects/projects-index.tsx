import Link from "next/link";
import type { ProjectMarkdownDoc } from "@/lib/projects-markdown";

const GITHUB_REPOSITORIES_URL = "https://github.com/tqdat410?tab=repositories";

interface ProjectsIndexProps {
  projects: ProjectMarkdownDoc[];
}

export function ProjectsIndex({ projects }: ProjectsIndexProps) {
  return (
    <ol className="border-t border-[var(--brand-bg)]">
      {projects.map((project, index) => {
        return (
          <li key={project.slug} className="border-b border-[var(--brand-bg)]">
            <Link
              href={`/projects/${project.slug}`}
              className="group focus-ring grid min-h-36 grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 px-1 py-7 text-[var(--brand-bg)] transition-colors duration-500 hover:bg-[var(--brand-bg)] hover:text-[var(--brand-fg)] focus-visible:bg-[var(--brand-bg)] focus-visible:text-[var(--brand-fg)] sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:px-3 md:grid-cols-[4rem_minmax(0,1fr)] md:items-center md:gap-6 lg:min-h-44"
            >
              <span className="font-mono text-xs opacity-60">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0">
                <span className="block text-[clamp(1.65rem,5vw,3.6rem)] leading-[0.98] font-bold tracking-[-0.04em] text-balance">
                  {project.title}
                </span>
                <span className="mt-4 block max-w-2xl text-sm leading-6 opacity-65 sm:text-base">
                  {project.summary}
                </span>
              </span>
            </Link>
          </li>
        );
      })}

      <li className="border-b border-[var(--brand-bg)]">
        <a
          href={GITHUB_REPOSITORIES_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Others — GitHub repositories"
          className="group focus-ring grid min-h-32 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 px-1 py-7 text-[var(--brand-bg)] transition-colors duration-500 hover:bg-[var(--brand-bg)] hover:text-[var(--brand-fg)] focus-visible:bg-[var(--brand-bg)] focus-visible:text-[var(--brand-fg)] sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:px-3 md:grid-cols-[4rem_minmax(0,1fr)] md:gap-6"
        >
          <span className="font-mono text-xs opacity-60">
            {String(projects.length + 1).padStart(2, "0")}
          </span>
          <span>
            <span className="block text-[clamp(1.65rem,5vw,3.6rem)] leading-none font-bold tracking-[-0.04em]">
              Others
            </span>
            <span className="mt-3 block text-sm leading-6 opacity-65 sm:text-base">
              Smaller experiments, utilities, and public source code.
            </span>
          </span>
        </a>
      </li>
    </ol>
  );
}

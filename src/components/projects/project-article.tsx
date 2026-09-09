import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ProjectMarkdownDoc } from "@/lib/projects-markdown";

interface ProjectArticleProps {
  project: ProjectMarkdownDoc;
}

export function ProjectArticle({ project }: ProjectArticleProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 pt-16 pb-28 sm:px-6 sm:pt-24 lg:px-10 lg:pt-32">
      <header className="border-b border-[var(--brand-bg)] pb-12 sm:pb-16">
        <h1 className="max-w-4xl text-[clamp(3rem,10vw,6rem)] leading-[0.92] font-bold tracking-[-0.045em] text-[var(--brand-bg)] text-balance">
          {project.title}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--brand-bg)]/65 sm:text-xl sm:leading-9">
          {project.summary}
        </p>
      </header>

      <article className="max-w-2xl py-14 text-[var(--brand-bg)] sm:py-20">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => (
              <h2 className="mt-16 mb-6 border-t border-[var(--brand-bg)]/20 pt-8 text-2xl leading-tight font-bold tracking-[-0.025em] text-balance first:mt-0 first:border-t-0 first:pt-0 sm:text-3xl">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-12 mb-4 text-xl leading-tight font-bold text-balance sm:text-2xl">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="my-6 [overflow-wrap:anywhere] text-base leading-8 text-[var(--brand-bg)]/75 sm:text-lg sm:leading-9">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="my-7 list-disc space-y-3 pl-5 text-base leading-8 text-[var(--brand-bg)]/75 sm:text-lg sm:leading-9">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-7 list-decimal space-y-3 pl-5 text-base leading-8 text-[var(--brand-bg)]/75 sm:text-lg sm:leading-9">
                {children}
              </ol>
            ),
            a: ({ href, children }) => {
              const isExternal = href?.startsWith("http");

              return (
                <a
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="focus-ring font-medium underline decoration-1 underline-offset-4"
                >
                  {children}
                </a>
              );
            },
            code: ({ children }) => (
              <code className="break-words bg-[var(--brand-bg)]/8 px-1 py-0.5 font-mono text-[0.9em]">
                {children}
              </code>
            ),
            table: ({ children }) => (
              <div className="my-8 overflow-x-auto">
                <table className="w-full min-w-xl border-collapse text-left">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border-b border-[var(--brand-bg)] p-3 text-sm font-bold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-[var(--brand-bg)]/20 p-3 align-top text-sm">
                {children}
              </td>
            ),
          }}
        >
          {project.rawMarkdown}
        </ReactMarkdown>
      </article>
    </main>
  );
}

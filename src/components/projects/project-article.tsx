import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ProjectMarkdownDoc } from "@/lib/projects-markdown";

interface ProjectArticleProps {
  project: ProjectMarkdownDoc;
}

export function ProjectArticle({ project }: ProjectArticleProps) {
  return (
    <main className="mx-auto max-w-4xl px-6 pt-12 pb-20 sm:pt-16">
      <header className="border-b border-[var(--brand-bg)]/20 pb-8">
        <h1 className="max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-[var(--brand-bg)] text-balance">
          {project.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--brand-bg)]/70">
          {project.summary}
        </p>
      </header>

      <article className="max-w-2xl py-8 text-[var(--brand-bg)]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => (
              <h2 className="mt-10 mb-4 text-xl leading-7 font-semibold tracking-tight first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-6 mb-3 text-base leading-7 font-semibold">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="my-4 [overflow-wrap:anywhere] text-base leading-7 text-[var(--brand-bg)]/80">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="my-4 list-disc space-y-2 pl-5 text-base leading-7 text-[var(--brand-bg)]/80">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-4 list-decimal space-y-2 pl-5 text-base leading-7 text-[var(--brand-bg)]/80">
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
                  className="focus-ring inline-block min-h-11 max-w-full py-2 font-medium break-words underline decoration-1 underline-offset-4"
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

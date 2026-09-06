"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FolderViewPanel,
  type FolderViewModel,
} from "@/components/projects-explorer/folder-view-panel";
import { ImagePreviewModal } from "@/components/projects-explorer/image-preview-modal";
import type { ProjectMarkdownDoc, ProjectsTreeCategory } from "@/lib/projects-markdown";

type ViewerMode = "preview" | "raw";
type RowKind = "back" | "folder" | "file" | "image";

interface TreeRow {
  id: string;
  label: string;
  kind: RowKind;
  depth: number;
  parentId: string | null;
  pathLabel: string;
  childCount?: number;
  isExpanded?: boolean;
  fileSlug?: string;
  imageName?: string;
  imageUrl?: string;
}

interface ProjectsExplorerPageClientProps {
  docs: ProjectMarkdownDoc[];
  tree: ProjectsTreeCategory[];
}

function FolderNameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-current" fill="none" aria-hidden="true">
      <path
        d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function MarkdownNameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-current" fill="none" aria-hidden="true">
      <path
        d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ImageNameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-current" fill="none" aria-hidden="true">
      <path
        d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="13" r="1.4" fill="currentColor" />
      <path
        d="M8.5 18l3.2-3.2 2.3 2.3 1.5-1.5 1.5 1.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildRows(tree: ProjectsTreeCategory[], expanded: Set<string>): TreeRow[] {
  const rows: TreeRow[] = [
    {
      id: "back",
      label: "...",
      kind: "back",
      depth: 0,
      parentId: null,
      pathLabel: "...",
    },
    {
      id: "root:projects",
      label: "projects",
      kind: "folder",
      depth: 0,
      parentId: null,
      pathLabel: "projects",
      childCount: tree.length,
      isExpanded: expanded.has("root:projects"),
    },
  ];

  if (!expanded.has("root:projects")) return rows;

  for (const category of tree) {
    const categoryId = `category:${category.name}`;
    const isCategoryExpanded = expanded.has(categoryId);

    rows.push({
      id: categoryId,
      label: category.name,
      kind: "folder",
      depth: 1,
      parentId: "root:projects",
      pathLabel: `projects/${category.name}`,
      childCount: category.projects.length,
      isExpanded: isCategoryExpanded,
    });

    if (!isCategoryExpanded) continue;

    for (const project of category.projects) {
      const projectId = `project:${project.slug}`;
      const isProjectExpanded = expanded.has(projectId);

      rows.push({
        id: projectId,
        label: project.title,
        kind: "folder",
        depth: 2,
        parentId: categoryId,
        pathLabel: `projects/${category.name}/${project.title}`,
        childCount: 1 + project.images.length,
        isExpanded: isProjectExpanded,
      });

      if (!isProjectExpanded) continue;

      rows.push({
        id: `file:${project.slug}`,
        label: project.fileName,
        kind: "file",
        depth: 3,
        parentId: projectId,
        pathLabel: `projects/${category.name}/${project.title}/${project.fileName}`,
        fileSlug: project.slug,
      });

      for (const image of project.images) {
        rows.push({
          id: `image:${project.slug}:${encodeURIComponent(image.name)}`,
          label: image.name,
          kind: "image",
          depth: 3,
          parentId: projectId,
          pathLabel: `projects/${category.name}/${project.title}/${image.name}`,
          fileSlug: project.slug,
          imageName: image.name,
          imageUrl: image.url,
        });
      }
    }
  }

  return rows;
}

function getAncestorsToExpandForFile(slug: string, tree: ProjectsTreeCategory[]): string[] {
  for (const category of tree) {
    const project = category.projects.find((item) => item.slug === slug);
    if (project) {
      return ["root:projects", `category:${category.name}`, `project:${project.slug}`];
    }
  }
  return ["root:projects"];
}

function getAncestorsToExpandForFolder(folderId: string, tree: ProjectsTreeCategory[]): string[] {
  if (folderId === "root:projects") return ["root:projects"];
  if (folderId.startsWith("category:")) return ["root:projects", folderId];

  if (folderId.startsWith("project:")) {
    const slug = folderId.replace("project:", "");
    for (const category of tree) {
      if (category.projects.some((project) => project.slug === slug)) {
        return ["root:projects", `category:${category.name}`, folderId];
      }
    }
  }

  return ["root:projects"];
}

function buildFolderModel(folderId: string, tree: ProjectsTreeCategory[]): FolderViewModel | null {
  if (folderId === "root:projects") {
    return {
      id: folderId,
      title: "projects",
      pathLabel: "projects",
      description: "Root directory containing all project categories.",
      childCount: tree.length,
      children: tree.map((category) => ({
        id: `category:${category.name}`,
        label: category.name,
        kind: "folder",
        pathLabel: `projects/${category.name}`,
      })),
    };
  }

  if (folderId.startsWith("category:")) {
    const categoryName = folderId.replace("category:", "");
    const category = tree.find((item) => item.name === categoryName);
    if (!category) return null;

    return {
      id: folderId,
      title: category.name,
      pathLabel: `projects/${category.name}`,
      description: "Category folder containing project directories.",
      childCount: category.projects.length,
      children: category.projects.map((project) => ({
        id: `project:${project.slug}`,
        label: project.title,
        kind: "folder",
        pathLabel: `projects/${category.name}/${project.title}`,
      })),
    };
  }

  if (folderId.startsWith("project:")) {
    const slug = folderId.replace("project:", "");
    for (const category of tree) {
      const project = category.projects.find((item) => item.slug === slug);
      if (!project) continue;

      return {
        id: folderId,
        title: project.title,
        pathLabel: `projects/${category.name}/${project.title}`,
        description: "Project folder containing markdown documentation.",
        childCount: 1 + project.images.length,
        children: [
          {
            id: `file:${project.slug}`,
            label: project.fileName,
            kind: "file",
            pathLabel: `projects/${category.name}/${project.title}/${project.fileName}`,
            slug: project.slug,
          },
          ...project.images.map((image) => ({
            id: `image:${project.slug}:${encodeURIComponent(image.name)}`,
            label: image.name,
            kind: "image" as const,
            pathLabel: `projects/${category.name}/${project.title}/${image.name}`,
            slug: project.slug,
            imageName: image.name,
            imageUrl: image.url,
          })),
        ],
      };
    }
  }

  return null;
}

export function ProjectsExplorerPageClient({ docs, tree }: ProjectsExplorerPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFileSlug = searchParams.get("file");
  const activeFolderId = searchParams.get("folder");
  const activeImageKey = searchParams.get("image");
  const mode: ViewerMode = searchParams.get("view") === "raw" ? "raw" : "preview";

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (activeFileSlug) return `file:${activeFileSlug}`;
    if (activeImageKey) return `image:${activeImageKey}`;
    if (activeFolderId) return activeFolderId;
    return null;
  });

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>(["root:projects"]);
    if (activeFileSlug) {
      for (const id of getAncestorsToExpandForFile(activeFileSlug, tree)) {
        initial.add(id);
      }
    } else if (activeImageKey) {
      const [imageProjectSlug] = activeImageKey.split(":");
      for (const id of getAncestorsToExpandForFile(imageProjectSlug, tree)) {
        initial.add(id);
      }
    } else if (activeFolderId) {
      for (const id of getAncestorsToExpandForFolder(activeFolderId, tree)) {
        initial.add(id);
      }
    }
    return initial;
  });

  useEffect(() => {
    const projectParam = searchParams.get("project");
    const fileParam = searchParams.get("file");
    if (!projectParam || fileParam) return;

    const matched = docs.find((doc) => doc.title === projectParam);
    if (!matched) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("project");
    params.delete("folder");
    params.set("file", matched.slug);
    params.set("view", "preview");
    router.replace(`${pathname}?${params.toString()}`);
  }, [docs, pathname, router, searchParams]);

  const rows = useMemo(() => buildRows(tree, expanded), [expanded, tree]);

  const selectedDoc = useMemo(
    () => docs.find((doc) => doc.slug === activeFileSlug) ?? null,
    [activeFileSlug, docs]
  );

  const selectedImage = useMemo(() => {
    if (!activeImageKey) return null;
    const [projectSlug, ...nameParts] = activeImageKey.split(":");
    const imageName = decodeURIComponent(nameParts.join(":"));
    const project = docs.find((doc) => doc.slug === projectSlug);
    if (!project) return null;
    const image = project.images?.find((item) => item.name === imageName);
    if (!image) return null;
    return { key: activeImageKey, projectSlug, name: image.name, url: image.url };
  }, [activeImageKey, docs]);

  const selectedFolder = useMemo(
    () => (activeFolderId ? buildFolderModel(activeFolderId, tree) : null),
    [activeFolderId, tree]
  );

  const updateQuery = useCallback(
    (next: {
      file?: string | null;
      folder?: string | null;
      image?: string | null;
      view?: ViewerMode;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.file === null) params.delete("file");
      if (typeof next.file === "string") params.set("file", next.file);
      if (next.folder === null) params.delete("folder");
      if (typeof next.folder === "string") params.set("folder", next.folder);
      if (next.image === null) params.delete("image");
      if (typeof next.image === "string") params.set("image", next.image);

      if (next.view) params.set("view", next.view);
      if (!params.get("view")) params.set("view", "preview");

      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const openFile = useCallback(
    (slug: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        for (const id of getAncestorsToExpandForFile(slug, tree)) {
          next.add(id);
        }
        return next;
      });
      updateQuery({ file: slug, folder: null, image: null, view: mode });
      setSelectedId(`file:${slug}`);
    },
    [mode, tree, updateQuery]
  );

  const openFolder = useCallback(
    (folderId: string) => {
      updateQuery({ folder: folderId, file: null, image: null });
      setSelectedId(folderId);
    },
    [updateQuery]
  );

  const openImage = useCallback(
    (projectSlug: string, imageName: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        for (const id of getAncestorsToExpandForFile(projectSlug, tree)) {
          next.add(id);
        }
        return next;
      });
      const imageKey = `${projectSlug}:${encodeURIComponent(imageName)}`;
      updateQuery({ image: imageKey });
      setSelectedId(`image:${imageKey}`);
    },
    [tree, updateQuery]
  );

  const toggleFolder = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const openRow = useCallback(
    (row: TreeRow) => {
      if (row.kind === "back") {
        router.push("/tqdat410");
        return;
      }
      if (row.kind === "file" && row.fileSlug) {
        openFile(row.fileSlug);
        return;
      }
      if (row.kind === "image" && row.fileSlug && row.imageName) {
        openImage(row.fileSlug, row.imageName);
        return;
      }
      if (row.kind === "folder") {
        openFolder(row.id);
      }
    },
    [openFile, openFolder, openImage, router]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (rows.length === 0) return;
    const currentIndex = selectedId ? rows.findIndex((row) => row.id === selectedId) : -1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = currentIndex < rows.length - 1 ? currentIndex + 1 : 0;
      setSelectedId(rows[nextIndex].id);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = currentIndex > 0 ? currentIndex - 1 : rows.length - 1;
      setSelectedId(rows[nextIndex].id);
      return;
    }

    if (event.key === "ArrowRight" && currentIndex >= 0) {
      event.preventDefault();
      const row = rows[currentIndex];
      if (row.kind === "folder" && !row.isExpanded) {
        toggleFolder(row.id);
      }
      return;
    }

    if (event.key === "ArrowLeft" && currentIndex >= 0) {
      event.preventDefault();
      const current = rows[currentIndex];
      if (current.kind === "folder" && current.isExpanded) {
        toggleFolder(current.id);
        return;
      }
      if (current.parentId) {
        setSelectedId(current.parentId);
      }
      return;
    }

    if (event.key === "Enter" && currentIndex >= 0) {
      event.preventDefault();
      openRow(rows[currentIndex]);
    }
  };

  return (
    <div className="reverse-scrollbar h-dvh bg-[var(--brand-fg)] text-[var(--brand-bg)]">
      <div className="flex h-full flex-col md:flex-row">
        <aside className="flex h-[44dvh] flex-col border-b border-[var(--brand-bg)]/15 md:h-full md:w-[340px] md:border-b-0 md:border-r">
          <div
            className="flex-1 overflow-auto p-2"
            role="tree"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={(event) => {
              if (event.target === event.currentTarget) setSelectedId(null);
            }}
          >
            {rows.map((row) => {
              const isSelected = row.id === selectedId;

              return (
                <div
                  key={row.id}
                  role="treeitem"
                  aria-expanded={row.kind === "folder" ? row.isExpanded : undefined}
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedId(row.id);
                    if (row.kind === "folder") {
                      openFolder(row.id);
                    }
                  }}
                  onDoubleClick={() => {
                    if (row.kind === "folder") {
                      toggleFolder(row.id);
                      return;
                    }
                    openRow(row);
                  }}
                  className={clsx(
                    "flex w-full cursor-default items-center gap-1 rounded px-2 py-1 text-left text-sm outline-none",
                    isSelected
                      ? "bg-[#0A84FF] text-white"
                      : "text-[var(--brand-bg)] hover:bg-[var(--brand-bg)]/8"
                  )}
                  style={{ paddingLeft: `${8 + row.depth * 16}px` }}
                >
                  {row.kind === "folder" ? (
                    <button
                      type="button"
                      aria-label={row.isExpanded ? `Collapse ${row.label}` : `Expand ${row.label}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFolder(row.id);
                      }}
                      className="inline-flex h-4 w-4 items-center justify-center rounded text-xs"
                    >
                      {row.isExpanded ? "▾" : "▸"}
                    </button>
                  ) : (
                    <span className="inline-flex h-4 w-4" aria-hidden="true" />
                  )}

                  {row.kind === "folder" || row.kind === "back" ? (
                    <FolderNameIcon />
                  ) : row.kind === "image" ? (
                    <ImageNameIcon />
                  ) : (
                    <MarkdownNameIcon />
                  )}
                  <span className="truncate">{row.label}</span>
                </div>
              );
            })}
          </div>

          <footer className="border-t border-[var(--brand-bg)]/10 px-4 py-2 text-xs text-[var(--brand-bg)]/70">
            total projects: {docs.length}
          </footer>
        </aside>

        <section className="flex min-h-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[var(--brand-bg)]/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">
                {selectedDoc?.fileName ??
                  selectedFolder?.title ??
                  selectedImage?.name ??
                  "No selection"}
              </p>
            </div>

            {selectedDoc ? (
              <div className="inline-flex rounded-md border border-[var(--brand-bg)]/20 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => updateQuery({ view: "preview" })}
                  className={clsx(
                    "rounded px-2 py-1",
                    mode === "preview"
                      ? "bg-[var(--brand-bg)] text-[var(--brand-fg)]"
                      : "text-[var(--brand-bg)]"
                  )}
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => updateQuery({ view: "raw" })}
                  className={clsx(
                    "rounded px-2 py-1",
                    mode === "raw"
                      ? "bg-[var(--brand-bg)] text-[var(--brand-fg)]"
                      : "text-[var(--brand-bg)]"
                  )}
                >
                  Raw
                </button>
              </div>
            ) : null}
          </header>

          <div className="min-h-0 flex-1 overflow-auto px-5 py-5">
            {selectedDoc ? (
              mode === "raw" ? (
                <pre className="whitespace-pre-wrap rounded-lg border border-[var(--brand-bg)]/10 bg-white p-4 text-sm leading-6 text-[var(--brand-bg)]">
                  {selectedDoc.rawMarkdown}
                </pre>
              ) : (
                <article className="w-full rounded-lg border border-[var(--brand-bg)]/10 bg-white p-6">
                  <h1 className="mb-2 text-2xl font-bold">{selectedDoc.title}</h1>
                  <div className="space-y-4 text-sm leading-7">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ children }) => (
                          <h2 className="mb-2 mt-6 text-lg font-semibold">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-4 text-base font-semibold">{children}</h3>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc space-y-1 pl-5">{children}</ul>
                        ),
                        p: ({ children }) => (
                          <p className="text-[var(--brand-bg)]/90">{children}</p>
                        ),
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {selectedDoc.rawMarkdown}
                    </ReactMarkdown>
                  </div>
                </article>
              )
            ) : selectedFolder ? (
              <FolderViewPanel
                key={selectedFolder.id}
                model={selectedFolder}
                onOpenFolder={openFolder}
                onOpenFile={openFile}
                onOpenImage={openImage}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--brand-bg)]/60">
                Double click a folder or markdown file to open.
              </div>
            )}
          </div>
        </section>
      </div>
      {selectedImage ? (
        <ImagePreviewModal
          key={selectedImage.key}
          open={true}
          imageName={selectedImage.name}
          imageUrl={selectedImage.url}
          onClose={() => updateQuery({ image: null })}
        />
      ) : null}
    </div>
  );
}

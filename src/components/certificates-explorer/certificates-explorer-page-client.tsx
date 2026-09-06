"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type {
  CertificateMarkdownDoc,
  CertificatePdfItem,
  CertificatesTreeCategory,
} from "@/lib/certificates-markdown";

type ViewerMode = "preview" | "raw";
type RowKind = "back" | "folder" | "file" | "pdf";

interface TreeRow {
  id: string;
  label: string;
  kind: RowKind;
  depth: number;
  parentId: string | null;
  pathLabel: string;
  isExpanded?: boolean;
  fileName?: string;
  fileUrl?: string;
}

interface FolderViewItem {
  id: string;
  kind: "folder" | "file" | "pdf";
  label: string;
  fileName?: string;
  fileUrl?: string;
}

interface FolderViewModel {
  id: string;
  children: FolderViewItem[];
}

interface CertificatesExplorerPageClientProps {
  doc: CertificateMarkdownDoc;
  tree: CertificatesTreeCategory[];
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

function PdfNameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-current" fill="none" aria-hidden="true">
      <path
        d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function compactFileLabel(label: string, maxLength = 24): string {
  if (label.length <= maxLength) return label;
  const dotIndex = label.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === label.length - 1) {
    return `${label.slice(0, maxLength - 1)}…`;
  }

  const ext = label.slice(dotIndex);
  const base = label.slice(0, dotIndex);
  const baseMax = Math.max(6, maxLength - ext.length - 1);
  return `${base.slice(0, baseMax)}…${ext}`;
}

function buildRows(tree: CertificatesTreeCategory[], expanded: Set<string>): TreeRow[] {
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
      id: "root:certificates",
      label: "certificates",
      kind: "folder",
      depth: 0,
      parentId: null,
      pathLabel: "certificates",
      isExpanded: expanded.has("root:certificates"),
    },
  ];

  if (!expanded.has("root:certificates")) return rows;

  rows.push({
    id: "file:certificates.md",
    label: "certificates.md",
    kind: "file",
    depth: 1,
    parentId: "root:certificates",
    pathLabel: "certificates/certificates.md",
    fileName: "certificates.md",
  });

  for (const category of tree) {
    const categoryId = `category:${category.name}`;
    const isExpanded = expanded.has(categoryId);
    rows.push({
      id: categoryId,
      label: category.name,
      kind: "folder",
      depth: 1,
      parentId: "root:certificates",
      pathLabel: `certificates/${category.name}`,
      isExpanded,
    });

    if (!isExpanded) continue;

    for (const item of category.items) {
      rows.push({
        id: `pdf:${category.name}:${encodeURIComponent(item.name)}`,
        label: item.name,
        kind: "pdf",
        depth: 2,
        parentId: categoryId,
        pathLabel: `certificates/${category.name}/${item.name}`,
        fileName: item.name,
        fileUrl: item.url,
      });
    }
  }

  return rows;
}

function buildFolderModel(
  folderId: string,
  tree: CertificatesTreeCategory[]
): FolderViewModel | null {
  if (folderId === "root:certificates") {
    return {
      id: folderId,
      children: [
        {
          id: "file:certificates.md",
          kind: "file",
          label: "certificates.md",
          fileName: "certificates.md",
        },
        ...tree.map((category) => ({
          id: `category:${category.name}`,
          kind: "folder" as const,
          label: category.name,
        })),
      ],
    };
  }

  if (folderId.startsWith("category:")) {
    const name = folderId.replace("category:", "");
    const category = tree.find((item) => item.name === name);
    if (!category) return null;

    return {
      id: folderId,
      children: category.items.map((item) => ({
        id: `pdf:${category.name}:${encodeURIComponent(item.name)}`,
        kind: "pdf" as const,
        label: item.name,
        fileName: item.name,
        fileUrl: item.url,
      })),
    };
  }

  return null;
}

function getPdfByRowId(rowId: string, tree: CertificatesTreeCategory[]): CertificatePdfItem | null {
  if (!rowId.startsWith("pdf:")) return null;
  const [, categoryName, encodedFileName] = rowId.split(":");
  if (!categoryName || !encodedFileName) return null;
  const fileName = decodeURIComponent(encodedFileName);
  const category = tree.find((item) => item.name === categoryName);
  if (!category) return null;
  return category.items.find((item) => item.name === fileName) ?? null;
}

export function CertificatesExplorerPageClient({ doc, tree }: CertificatesExplorerPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFile = searchParams.get("file");
  const activeFolderId = searchParams.get("folder");
  const mode: ViewerMode = searchParams.get("view") === "raw" ? "raw" : "preview";

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (activeFile) return `file:${activeFile}`;
    if (activeFolderId) return activeFolderId;
    return null;
  });
  const [folderViewSelectedId, setFolderViewSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["root:certificates"]));

  const rows = useMemo(() => buildRows(tree, expanded), [tree, expanded]);
  const selectedRowLabel = useMemo(
    () => rows.find((row) => row.id === selectedId)?.label ?? null,
    [rows, selectedId]
  );
  const selectedFolder = useMemo(
    () => (activeFolderId ? buildFolderModel(activeFolderId, tree) : null),
    [activeFolderId, tree]
  );

  const totalPdfCount = useMemo(
    () => tree.reduce((sum, category) => sum + category.items.length, 0),
    [tree]
  );

  const updateQuery = useCallback(
    (next: { file?: string | null; folder?: string | null; view?: ViewerMode }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.file === null) params.delete("file");
      if (typeof next.file === "string") params.set("file", next.file);
      if (next.folder === null) params.delete("folder");
      if (typeof next.folder === "string") params.set("folder", next.folder);

      if (next.view) params.set("view", next.view);
      if (!params.get("view")) params.set("view", "preview");

      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const openFile = useCallback(
    (fileName: string) => {
      updateQuery({ file: fileName, folder: null, view: mode });
      setSelectedId(`file:${fileName}`);
    },
    [mode, updateQuery]
  );

  const openFolder = useCallback(
    (id: string) => {
      updateQuery({ folder: id, file: null });
      setSelectedId(id);
      setFolderViewSelectedId(null);
    },
    [updateQuery]
  );

  const openPdfRow = useCallback(
    (rowId: string) => {
      const pdf = getPdfByRowId(rowId, tree);
      if (!pdf || !pdf.url) return;
      window.open(pdf.url, "_blank", "noopener,noreferrer");
      setSelectedId(rowId);
    },
    [tree]
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
      if (row.kind === "folder") {
        openFolder(row.id);
        return;
      }
      if (row.kind === "file" && row.fileName) {
        openFile(row.fileName);
        return;
      }
      if (row.kind === "pdf") {
        openPdfRow(row.id);
      }
    },
    [openFile, openFolder, openPdfRow, router]
  );

  const handleTreeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
            onKeyDown={handleTreeKeyDown}
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
                      className="inline-flex h-4 w-4 items-center justify-center text-xs"
                    >
                      {row.isExpanded ? "▾" : "▸"}
                    </button>
                  ) : (
                    <span className="inline-flex h-4 w-4" aria-hidden="true" />
                  )}

                  {row.kind === "folder" || row.kind === "back" ? (
                    <FolderNameIcon />
                  ) : row.kind === "pdf" ? (
                    <PdfNameIcon />
                  ) : (
                    <MarkdownNameIcon />
                  )}
                  <span className="truncate" title={row.label}>
                    {row.kind === "file" || row.kind === "pdf"
                      ? compactFileLabel(row.label)
                      : row.label}
                  </span>
                </div>
              );
            })}
          </div>
          <footer className="border-t border-[var(--brand-bg)]/10 px-4 py-2 text-xs text-[var(--brand-bg)]/70">
            total certificates: {totalPdfCount}
          </footer>
        </aside>

        <section className="flex min-h-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[var(--brand-bg)]/10 px-4 py-3">
            <p className="text-sm font-semibold">
              {activeFile ?? selectedRowLabel ?? "No selection"}
            </p>
            {activeFile ? (
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
            {activeFile === "certificates.md" ? (
              mode === "raw" ? (
                <pre className="whitespace-pre-wrap rounded-lg border border-[var(--brand-bg)]/10 bg-white p-4 text-sm leading-6 text-[var(--brand-bg)]">
                  {doc.rawMarkdown}
                </pre>
              ) : (
                <article className="w-full rounded-lg border border-[var(--brand-bg)]/10 bg-white p-6">
                  <h1 className="mb-2 text-2xl font-bold">{doc.title}</h1>
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
                      }}
                    >
                      {doc.rawMarkdown}
                    </ReactMarkdown>
                  </div>
                </article>
              )
            ) : selectedFolder ? (
              <article className="w-full p-2">
                <div className="space-y-1">
                  {selectedFolder.children.length === 0 ? (
                    <p className="px-2 py-1 text-sm text-[var(--brand-bg)]/60">
                      No files in this folder.
                    </p>
                  ) : (
                    selectedFolder.children.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFolderViewSelectedId(item.id)}
                        onDoubleClick={() => {
                          if (item.kind === "folder") {
                            openFolder(item.id);
                            return;
                          }
                          if (item.kind === "file" && item.fileName) {
                            openFile(item.fileName);
                            return;
                          }
                          if (item.kind === "pdf" && item.fileUrl) {
                            window.open(item.fileUrl, "_blank", "noopener,noreferrer");
                          }
                        }}
                        className={clsx(
                          "flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm transition-colors",
                          folderViewSelectedId === item.id
                            ? "bg-[#0A84FF] text-white"
                            : "text-[var(--brand-bg)] hover:bg-[var(--brand-bg)]/8"
                        )}
                      >
                        {item.kind === "folder" ? (
                          <FolderNameIcon />
                        ) : item.kind === "pdf" ? (
                          <PdfNameIcon />
                        ) : (
                          <MarkdownNameIcon />
                        )}
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      </button>
                    ))
                  )}
                </div>
              </article>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--brand-bg)]/60">
                Click a folder to browse, or open certificates.md.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

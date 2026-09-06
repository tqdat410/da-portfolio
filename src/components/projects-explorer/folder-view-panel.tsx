"use client";

import { useState } from "react";

export interface FolderViewChild {
  id: string;
  label: string;
  kind: "folder" | "file" | "image";
  pathLabel: string;
  slug?: string;
  imageName?: string;
  imageUrl?: string;
}

export interface FolderViewModel {
  id: string;
  title: string;
  pathLabel: string;
  description: string;
  childCount: number;
  children: FolderViewChild[];
}

interface FolderViewPanelProps {
  model: FolderViewModel;
  onOpenFolder: (id: string) => void;
  onOpenFile: (slug: string) => void;
  onOpenImage: (projectSlug: string, imageName: string) => void;
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-[var(--brand-bg)]"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function MarkdownFileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-[var(--brand-bg)]"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ImageFileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-[var(--brand-bg)]"
      fill="none"
      aria-hidden="true"
    >
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

export function FolderViewPanel({
  model,
  onOpenFolder,
  onOpenFile,
  onOpenImage,
}: FolderViewPanelProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  return (
    <article className="w-full p-2">
      <div className="space-y-1">
        {model.children.map((child) => (
          <button
            key={child.id}
            type="button"
            onClick={() => setSelectedChildId(child.id)}
            onDoubleClick={() => {
              if (child.kind === "folder") {
                onOpenFolder(child.id);
                return;
              }
              if (child.kind === "file" && child.slug) {
                onOpenFile(child.slug);
                return;
              }
              if (child.kind === "image" && child.slug && child.imageName) {
                onOpenImage(child.slug, child.imageName);
              }
            }}
            className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm transition-colors ${
              selectedChildId === child.id
                ? "bg-[#0A84FF] text-white"
                : "text-[var(--brand-bg)] hover:bg-[var(--brand-bg)]/8"
            }`}
          >
            {child.kind === "folder" ? (
              <FolderIcon />
            ) : child.kind === "image" ? (
              <ImageFileIcon />
            ) : (
              <MarkdownFileIcon />
            )}
            <span className="min-w-0 flex-1 truncate">{child.label}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

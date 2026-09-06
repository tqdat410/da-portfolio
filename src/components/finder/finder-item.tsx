"use client";

import type { FinderLaunchItem } from "./types";

interface FinderItemProps {
  item: FinderLaunchItem;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

function FolderIcon() {
  return (
    <svg className="h-12 w-12 md:h-14 md:w-14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id="folderBody"
          x1="12"
          y1="6.8"
          x2="12"
          y2="20.4"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6CB3FF" />
          <stop offset="1" stopColor="#3D8CFF" />
        </linearGradient>
        <linearGradient
          id="folderTop"
          x1="12"
          y1="4.8"
          x2="12"
          y2="10.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#98CBFF" />
          <stop offset="1" stopColor="#75B9FF" />
        </linearGradient>
      </defs>
      <path
        d="M2.8 9.3c0-1.2.98-2.2 2.2-2.2h4.45c.32 0 .62-.12.84-.34l.95-.95c.31-.31.73-.49 1.17-.49h2.24c1.22 0 2.2.98 2.2 2.2v.55h1.15c1.27 0 2.3 1.03 2.3 2.3v7.35A2.35 2.35 0 0 1 18 20.05H5.15a2.35 2.35 0 0 1-2.35-2.35V9.3Z"
        fill="url(#folderBody)"
      />
      <path
        d="M4.25 8.15a1.8 1.8 0 0 1 1.8-1.8h3.26c.3 0 .58-.12.8-.33l1-1c.27-.26.62-.42.99-.42h2.08a1.8 1.8 0 0 1 1.8 1.8v1.7H4.25v-1.95Z"
        fill="url(#folderTop)"
      />
      <path
        d="M3.5 10.15c0-.88.72-1.6 1.6-1.6h13.8c.88 0 1.6.72 1.6 1.6"
        stroke="#E8F3FF"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="h-12 w-12 md:h-14 md:w-14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id="fileBody"
          x1="12.5"
          y1="3.8"
          x2="12.5"
          y2="21.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#ECECEC" />
        </linearGradient>
      </defs>
      <path
        d="M7.05 3.8h7.45l4.2 4.2v11.9a1.85 1.85 0 0 1-1.85 1.85H7.05A1.85 1.85 0 0 1 5.2 19.9V5.65A1.85 1.85 0 0 1 7.05 3.8Z"
        fill="url(#fileBody)"
        stroke="#D2D2D2"
        strokeWidth="0.9"
      />
      <path d="M14.5 3.8V8h4.2" stroke="#D2D2D2" strokeWidth="0.9" />
      <path
        d="M8.8 11.25h6.4M8.8 14.25h6.4"
        stroke="#B8B8B8"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FinderItem({ item, isSelected, onClick, onDoubleClick }: FinderItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      aria-label={`${item.label} ${item.kind}`}
      className="group flex w-full max-w-[180px] flex-col items-center gap-2 rounded-lg px-2 py-2 text-center text-[var(--brand-bg)] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#0A84FF] focus-visible:outline-offset-2 md:max-w-[200px]"
    >
      <div
        className={`rounded-xl px-4 py-2 transition-all duration-150 ${
          isSelected ? "bg-[#00000012]" : "group-hover:bg-[#00000008]"
        }`}
      >
        <div className="transition-transform duration-150 group-hover:scale-[1.02]">
          {item.kind === "folder" ? <FolderIcon /> : <FileIcon />}
        </div>
      </div>
      <span
        className={`max-w-full truncate rounded-md px-2 py-0.5 text-sm font-medium ${
          isSelected ? "bg-[#0A84FF] text-white" : "text-[var(--brand-bg)]"
        }`}
      >
        {item.label}
      </span>
    </button>
  );
}

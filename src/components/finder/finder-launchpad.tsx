"use client";

import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { FinderItem } from "./finder-item";
import type { FinderLaunchItem } from "./types";

const ITEMS: FinderLaunchItem[] = [
  {
    id: "portfolio-exe",
    label: "da-portfolio.exe",
    kind: "file",
    target: "/",
    openMode: "same-tab",
  },
  {
    id: "projects-folder",
    label: "projects",
    kind: "folder",
    target: "/tqdat410/projects",
    openMode: "same-tab",
  },
  {
    id: "certificates-folder",
    label: "certificates",
    kind: "folder",
    target: "/tqdat410/certificates",
    openMode: "same-tab",
  },
];

export function FinderLaunchpad() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

  const isTouchLikeDevice = () => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  };

  const openItem = (item: FinderLaunchItem) => {
    if (item.openMode === "new-tab") {
      window.open(item.target, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(item.target);
  };

  const selectItem = (index: number) => setSelectedIndex(index);

  const handleItemClick = (index: number) => {
    selectItem(index);
    if (isTouchLikeDevice()) {
      openItem(ITEMS[index]);
    }
  };

  const handleItemDoubleClick = (index: number) => {
    selectItem(index);
    openItem(ITEMS[index]);
  };

  const handleContainerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev === null ? 0 : (prev + 1) % ITEMS.length));
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSelectedIndex((prev) =>
        prev === null ? ITEMS.length - 1 : (prev - 1 + ITEMS.length) % ITEMS.length
      );
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setSelectedIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setSelectedIndex(ITEMS.length - 1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (selectedIndex !== null) {
        openItem(ITEMS[selectedIndex]);
      }
    }
  };

  const handleContainerClick = (event: MouseEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) {
      setSelectedIndex(null);
    }
  };

  return (
    <main
      onClick={handleContainerClick}
      className="flex min-h-dvh items-center justify-center bg-[var(--brand-fg)] px-6 py-10 text-[var(--brand-bg)]"
      aria-label="Finder launchpad"
    >
      <section
        onClick={handleContainerClick}
        tabIndex={0}
        aria-label="Finder workspace"
        onKeyDown={handleContainerKeyDown}
        className="w-full max-w-5xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-bg)]/45"
      >
        <div className="grid grid-cols-1 justify-items-center md:grid-cols-3">
          {ITEMS.map((item, index) => (
            <div key={item.id}>
              <FinderItem
                item={item}
                isSelected={selectedIndex === index}
                onClick={() => handleItemClick(index)}
                onDoubleClick={() => handleItemDoubleClick(index)}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

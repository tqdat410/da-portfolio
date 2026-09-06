"use client";

import { useEffect, useRef, useState } from "react";

interface ImagePreviewModalProps {
  open: boolean;
  imageName: string;
  imageUrl: string;
  onClose: () => void;
}

export function ImagePreviewModal({ open, imageName, imageUrl, onClose }: ImagePreviewModalProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 120, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;

    const preload = new Image();
    preload.src = imageUrl;
    preload.onload = () => setIsImageLoaded(true);
    preload.onerror = () => setHasImageError(true);
  }, [imageUrl, open]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: MouseEvent) => {
      setPosition({
        x: Math.max(8, event.clientX - dragOffset.current.x),
        y: Math.max(8, event.clientY - dragOffset.current.y),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  if (!open) return null;

  return (
    <>
      {!isImageLoaded && !hasImageError ? (
        <div className="fixed bottom-4 right-6 z-[60]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--brand-bg)]/20 border-t-[var(--brand-bg)]" />
        </div>
      ) : null}

      {isImageLoaded || hasImageError ? (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label={imageName}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <div
            ref={windowRef}
            className="absolute w-[min(960px,calc(100vw-32px))] rounded-[4px] bg-[var(--brand-fg)] shadow-2xl"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
          >
            <div
              className="flex h-10 cursor-move items-center justify-between px-3"
              onMouseDown={(event) => {
                const rect = windowRef.current?.getBoundingClientRect();
                if (!rect) return;
                dragOffset.current = {
                  x: event.clientX - rect.left,
                  y: event.clientY - rect.top,
                };
                setDragging(true);
              }}
            >
              <p className="truncate pr-4 text-sm text-[var(--brand-bg)]">{imageName}</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close image preview"
                className="inline-flex h-6 w-6 items-center justify-center text-sm text-[var(--brand-bg)]"
              >
                x
              </button>
            </div>
            <div className="rounded-b-[4px] bg-[#f2f2f2] p-2">
              {hasImageError ? (
                <p className="p-4 text-sm text-[var(--brand-bg)]/70">Failed to load image.</p>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={imageName}
                    className="max-h-[72dvh] w-full object-contain"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

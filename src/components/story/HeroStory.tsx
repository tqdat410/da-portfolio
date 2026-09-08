"use client";

import { useCallback, useRef, useState } from "react";
import HeroVisual from "@/components/animations/HeroVisual";

export function HeroStory() {
  const introTop = "Hi, this is Tran Quoc Dat's site,";
  const introBottom = "where you can explore my projects, background, and experience.";
  const containerRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const copyRef = useRef<HTMLParagraphElement | null>(null);
  const [visualReady, setVisualReady] = useState(false);
  const onVisualReadyChange = useCallback((ready: boolean) => setVisualReady(ready), []);

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative isolate min-h-screen overflow-hidden bg-[var(--brand-bg)]"
      data-visual-ready={visualReady ? "true" : "false"}
    >
      <HeroVisual
        containerRef={containerRef}
        copyRef={copyRef}
        onReadyChange={onVisualReadyChange}
        titleRef={titleRef}
      />

      <div className="absolute inset-0 z-10 flex pointer-events-none items-center justify-center px-6">
        <div className="w-full max-w-4xl text-center">
          <h1
            ref={titleRef}
            id="hero-heading"
            className={`text-5xl font-bold tracking-tight md:text-9xl ${visualReady ? "text-transparent" : "text-[#fafafa]"}`}
          >
            Da&apos;portfolio
          </h1>
          <p
            ref={copyRef}
            className={`mt-6 text-base leading-relaxed md:text-2xl ${visualReady ? "text-transparent" : "text-[#fafafa]"}`}
          >
            {introTop}
            <br />
            {introBottom}
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";

import { content } from "@/content";
import MetaBalls from "@/components/animations/MetaBalls";

export function HeroStory() {
  const hero = content.hero;
  const introTop = "Hi, this is Tran Quoc Dat's site,";
  const introBottom = "where you can explore my projects, background, and experience.";
  const blendStyle = {
    mixBlendMode: "difference",
    WebkitMixBlendMode: "difference",
  } as const;

  return (
    <section
      id="home"
      className="relative isolate min-h-screen overflow-hidden bg-[var(--brand-bg)]"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 z-0">
        <MetaBalls
          color="#fafafa"
          cursorBallColor="#fafafa"
          cursorBallSize={2}
          ballCount={30}
          animationSize={30}
          enableMouseInteraction={false}
          enableTransparency={true}
          hoverSmoothness={0.25}
          clumpFactor={2}
          speed={0.1}
        />

        <div className="absolute inset-0 flex pointer-events-none items-center justify-center px-6">
          <div className="w-full max-w-4xl text-center">
            <h2
              className="text-5xl font-bold tracking-tight text-[#fafafa] md:text-9xl"
              style={blendStyle}
            >
              Da&apos;portfolio
            </h2>
            <p
              className="mt-6 text-base leading-relaxed text-[#fafafa] md:text-2xl"
              style={blendStyle}
            >
              {introTop}
              <br />
              {introBottom}
            </p>
          </div>
        </div>
      </div>

      <h1 id="hero-heading" className="sr-only">
        {hero.name}
      </h1>
    </section>
  );
}


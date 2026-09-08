"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { createHeroTextMask } from "./hero-text-mask";
import {
  chooseHeroVisualTier,
  createHeroRenderer,
  type HeroRenderer,
  type HeroVisualTier,
} from "./hero-visual-renderer";

type AnimationState = "active" | "fallback" | "paused";

type HeroVisualProps = {
  containerRef: RefObject<HTMLElement | null>;
  copyRef: RefObject<HTMLParagraphElement | null>;
  onReadyChange: (ready: boolean) => void;
  titleRef: RefObject<HTMLHeadingElement | null>;
};

function parseHexColor(value: string): [number, number, number] | null {
  const match = value.trim().match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!match) return null;
  return [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255];
}

function readPalette(element: HTMLElement) {
  const styles = window.getComputedStyle(element);
  const background = parseHexColor(styles.getPropertyValue("--brand-bg"));
  const foreground = parseHexColor(styles.getPropertyValue("--brand-fg"));
  return background && foreground ? { background, foreground } : null;
}

export default function HeroVisual({
  containerRef,
  copyRef,
  onReadyChange,
  titleRef,
}: HeroVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();
  const forcedColors = useMediaQuery("(forced-colors: active)");
  const [animationState, setAnimationState] = useState<AnimationState>("fallback");
  const [presented, setPresented] = useState(false);
  const presentedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const title = titleRef.current;
    const copy = copyRef.current;

    setPresented(false);
    presentedRef.current = false;
    setAnimationState("fallback");
    onReadyChange(false);

    if (
      !canvas ||
      !container ||
      !title ||
      !copy ||
      reducedMotion ||
      forcedColors ||
      typeof ResizeObserver === "undefined" ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    let disposed = false;
    let renderer: HeroRenderer | null = null;
    let tier: HeroVisualTier | null = null;
    let animationFrame = 0;
    let presentationFrame = 0;
    let generation = 0;
    let intersectionKnown = false;
    let isIntersecting = false;
    let documentVisible = document.visibilityState !== "hidden";
    let cssWidth = 0;
    let cssHeight = 0;
    let logicalElapsed = 0;
    let previousTimestamp: number | null = null;
    let previousRenderTimestamp = 0;
    let initializing = false;
    let contextAvailable = true;
    let recoveryRequired = false;
    let restoreAttemptPending = false;
    let fallbackPinned = false;
    let consecutiveRestoreFailures = 0;

    const stopLoop = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      previousTimestamp = null;
      previousRenderTimestamp = 0;
    };

    const showFallback = () => {
      stopLoop();
      if (presentationFrame) cancelAnimationFrame(presentationFrame);
      presentationFrame = 0;
      setPresented(false);
      presentedRef.current = false;
      setAnimationState("fallback");
      onReadyChange(false);
    };

    const canAnimate = () =>
      intersectionKnown && isIntersecting && documentVisible && cssWidth > 0 && cssHeight > 0;

    const discardRenderer = () => {
      const currentRenderer = renderer;
      renderer = null;
      tier = null;
      try {
        currentRenderer?.dispose();
      } catch {
        // Disposal is best-effort; the static fallback must remain usable.
      }
    };

    const recordRestoreFailure = (isRestorationAttempt: boolean) => {
      if (!isRestorationAttempt) return;
      restoreAttemptPending = false;
      consecutiveRestoreFailures += 1;
      fallbackPinned = consecutiveRestoreFailures >= 2;
    };

    const scheduleLoop = () => {
      if (animationFrame || !renderer || !tier || !canAnimate()) return;

      const tick = (timestamp: number) => {
        animationFrame = 0;
        if (!renderer || !tier || !canAnimate()) return;

        if (previousTimestamp === null) previousTimestamp = timestamp;
        const delta = Math.min(Math.max(timestamp - previousTimestamp, 0), 50);
        previousTimestamp = timestamp;
        logicalElapsed += delta / 1000;

        if (
          previousRenderTimestamp === 0 ||
          timestamp - previousRenderTimestamp >= tier.frameIntervalMs - 1
        ) {
          previousRenderTimestamp = timestamp;
          let renderFailed = false;
          try {
            const result = renderer.render(logicalElapsed);
            renderFailed = !result.ok;
          } catch {
            renderFailed = true;
          }

          if (renderFailed) {
            generation += 1;
            discardRenderer();
            showFallback();
            return;
          }
        }

        animationFrame = requestAnimationFrame(tick);
      };

      animationFrame = requestAnimationFrame(tick);
    };

    const presentCurrentFrame = (currentGeneration: number) => {
      if (presentationFrame) cancelAnimationFrame(presentationFrame);
      presentationFrame = requestAnimationFrame(() => {
        presentationFrame = 0;
        if (disposed || currentGeneration !== generation || !renderer || !canAnimate()) return;
        setPresented(true);
        presentedRef.current = true;
        setAnimationState("active");
        onReadyChange(true);
        consecutiveRestoreFailures = 0;
        recoveryRequired = false;
        restoreAttemptPending = false;
        fallbackPinned = false;
        scheduleLoop();
      });
    };

    const initialize = async () => {
      if (
        disposed ||
        initializing ||
        renderer ||
        !canAnimate() ||
        !contextAvailable ||
        fallbackPinned ||
        (recoveryRequired && !restoreAttemptPending)
      ) {
        return;
      }
      initializing = true;
      const isRestorationAttempt = recoveryRequired;
      const currentGeneration = ++generation;

      try {
        await (document.fonts?.ready ?? Promise.resolve());
        if (disposed || currentGeneration !== generation || !canAnimate()) return;

        const currentPalette = readPalette(container);
        if (!currentPalette) {
          recordRestoreFailure(isRestorationAttempt);
          showFallback();
          return;
        }
        const created = createHeroRenderer(canvas, currentPalette);
        if (!created.ok) {
          recordRestoreFailure(isRestorationAttempt);
          showFallback();
          return;
        }

        renderer = created.value;
        tier = chooseHeroVisualTier(cssWidth, cssHeight, window.devicePixelRatio, 30);
        const mask = createHeroTextMask({
          container,
          cssHeight,
          cssWidth,
          dpr: tier.dpr,
          elements: [title, copy],
          generation: currentGeneration,
          maxTextureSize: renderer.maxTextureSize,
        });
        if (!mask) {
          discardRenderer();
          recordRestoreFailure(isRestorationAttempt);
          showFallback();
          return;
        }
        if (mask.generation !== generation) {
          discardRenderer();
          showFallback();
          return;
        }

        const resized = renderer.resize(cssWidth, cssHeight, tier, mask);
        const rendered = resized.ok ? renderer.render(logicalElapsed) : resized;
        if (!rendered.ok || canvas.width === 0 || canvas.height === 0) {
          discardRenderer();
          recordRestoreFailure(isRestorationAttempt);
          showFallback();
          return;
        }

        presentCurrentFrame(currentGeneration);
      } catch {
        discardRenderer();
        recordRestoreFailure(isRestorationAttempt);
        showFallback();
      } finally {
        initializing = false;
        if (
          !disposed &&
          !renderer &&
          canAnimate() &&
          !fallbackPinned &&
          ((recoveryRequired && restoreAttemptPending) ||
            (!recoveryRequired && currentGeneration !== generation))
        ) {
          void initialize();
        }
      }
    };

    const invalidateGeometry = () => {
      const rect = container.getBoundingClientRect();
      const nextWidth = Math.round(rect.width * 100) / 100;
      const nextHeight = Math.round(rect.height * 100) / 100;
      const nextTier = chooseHeroVisualTier(nextWidth, nextHeight, window.devicePixelRatio, 30);
      const unchanged =
        nextWidth === cssWidth && nextHeight === cssHeight && tier?.dpr === nextTier.dpr;

      if (unchanged) return;
      cssWidth = nextWidth;
      cssHeight = nextHeight;
      generation += 1;
      discardRenderer();
      showFallback();
      void initialize();
    };

    const updateActivity = () => {
      if (!canAnimate()) {
        stopLoop();
        if (presentedRef.current) setAnimationState("paused");
        return;
      }
      if (renderer && presentedRef.current) {
        setAnimationState("active");
        scheduleLoop();
      } else if (renderer) {
        presentCurrentFrame(generation);
      } else {
        void initialize();
      }
    };

    const resizeObserver = new ResizeObserver(invalidateGeometry);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      intersectionKnown = true;
      isIntersecting = Boolean(entry?.isIntersecting);
      updateActivity();
    });

    const onVisibilityChange = () => {
      documentVisible = document.visibilityState !== "hidden";
      if (documentVisible) invalidateGeometry();
      updateActivity();
    };
    const onWindowResize = () => invalidateGeometry();
    const onContextLost = (event: Event) => {
      event.preventDefault();
      if (!contextAvailable) return;
      contextAvailable = false;
      recoveryRequired = true;
      restoreAttemptPending = false;
      generation += 1;
      discardRenderer();
      showFallback();
    };
    const onContextRestored = () => {
      if (contextAvailable) return;
      contextAvailable = true;
      restoreAttemptPending = !fallbackPinned;
      void initialize();
    };

    resizeObserver.observe(container);
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("resize", onWindowResize);
    let resolutionQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onResolutionChange = () => {
      resolutionQuery.removeEventListener("change", onResolutionChange);
      resolutionQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      resolutionQuery.addEventListener("change", onResolutionChange);
      invalidateGeometry();
    };
    resolutionQuery.addEventListener("change", onResolutionChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    invalidateGeometry();

    return () => {
      disposed = true;
      generation += 1;
      stopLoop();
      if (presentationFrame) cancelAnimationFrame(presentationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", onWindowResize);
      resolutionQuery.removeEventListener("change", onResolutionChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      renderer?.dispose();
    };
  }, [containerRef, copyRef, forcedColors, onReadyChange, reducedMotion, titleRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`hero-visual-canvas absolute inset-0 h-full w-full pointer-events-none ${presented ? "visible" : "invisible"}`}
      data-animation-state={animationState}
    />
  );
}

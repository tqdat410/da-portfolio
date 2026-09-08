import { act, render, waitFor } from "@testing-library/react";
import { useRef } from "react";
import "@testing-library/jest-dom";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import HeroVisual from "./HeroVisual";
import { createHeroTextMask } from "./hero-text-mask";
import { createHeroRenderer } from "./hero-visual-renderer";

jest.mock("@/hooks/useMediaQuery");
jest.mock("@/hooks/useReducedMotion");

jest.mock("./hero-text-mask", () => ({
  createHeroTextMask: jest.fn(({ generation }: { generation: number }) => ({
    canvas: document.createElement("canvas"),
    generation,
    height: 844,
    width: 390,
  })),
}));

jest.mock("./hero-visual-renderer", () => {
  const actual = jest.requireActual("./hero-visual-renderer");
  return { ...actual, createHeroRenderer: jest.fn() };
});

let intersectionCallback: IntersectionObserverCallback;
let resizeCallback: ResizeObserverCallback;
let intersectionDisconnect: jest.Mock;
let resizeDisconnect: jest.Mock;
const rafCallbacks = new Map<number, FrameRequestCallback>();
let rafId = 0;

const renderer = {
  maxTextureSize: 4096,
  render: jest.fn(() => ({ ok: true as const, value: undefined })),
  resize: jest.fn(() => ({ ok: true as const, value: undefined })),
  dispose: jest.fn(),
};

function Harness({ onReadyChange = jest.fn() }: { onReadyChange?: (ready: boolean) => void }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const copyRef = useRef<HTMLParagraphElement | null>(null);

  return (
    <section
      ref={containerRef}
      style={{ "--brand-bg": "#0c0c0c", "--brand-fg": "#fafafa" } as React.CSSProperties}
    >
      <h1 ref={titleRef}>Da&apos;portfolio</h1>
      <p ref={copyRef}>Portfolio copy</p>
      <HeroVisual
        containerRef={containerRef}
        copyRef={copyRef}
        onReadyChange={onReadyChange}
        titleRef={titleRef}
      />
    </section>
  );
}

async function flushNextFrame(timestamp = 16) {
  const next = rafCallbacks.entries().next().value as [number, FrameRequestCallback] | undefined;
  if (!next) return;
  rafCallbacks.delete(next[0]);
  await act(async () => next[1](timestamp));
}

function createDeferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe("HeroVisual lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useMediaQuery).mockReturnValue(false);
    jest.mocked(useReducedMotion).mockReturnValue(false);
    rafCallbacks.clear();
    rafId = 0;
    intersectionDisconnect = jest.fn();
    resizeDisconnect = jest.fn();
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() },
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    global.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {
        resizeDisconnect();
      }
    } as typeof ResizeObserver;
    global.IntersectionObserver = class {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {
        intersectionDisconnect();
      }
      takeRecords() {
        return [];
      }
    } as typeof IntersectionObserver;
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      const id = ++rafId;
      rafCallbacks.set(id, callback);
      return id;
    });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      rafCallbacks.delete(id);
    });
    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 844,
      height: 844,
      left: 0,
      right: 390,
      top: 0,
      width: 390,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    jest.mocked(createHeroRenderer).mockImplementation((canvas) => {
      renderer.resize.mockImplementation(() => {
        canvas.width = 390;
        canvas.height = 844;
        return { ok: true, value: undefined };
      });
      return { ok: true, value: renderer };
    });
    renderer.render.mockImplementation(() => ({ ok: true, value: undefined }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("stays in fallback until size, intersection, mask, and first frame are ready", async () => {
    const onReadyChange = jest.fn();
    const { container } = render(<Harness onReadyChange={onReadyChange} />);
    const canvas = container.querySelector("canvas.hero-visual-canvas");

    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveAttribute("data-animation-state", "fallback");
    expect(createHeroRenderer).not.toHaveBeenCalled();

    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(1));
    await flushNextFrame();

    expect(canvas).toHaveAttribute("data-animation-state", "active");
    expect(onReadyChange).toHaveBeenLastCalledWith(true);
  });

  it("pauses the loop when the Hero leaves the viewport", async () => {
    const { container } = render(<Harness />);
    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalled());
    await flushNextFrame();

    act(() => {
      intersectionCallback(
        [{ isIntersecting: false }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });

    expect(container.querySelector("canvas.hero-visual-canvas")).toHaveAttribute(
      "data-animation-state",
      "paused"
    );
    expect(rafCallbacks.size).toBe(0);
  });

  it("presents an initialized renderer after activity resumes before presentation", async () => {
    const { container } = render(<Harness />);
    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(1));

    act(() => {
      intersectionCallback(
        [{ isIntersecting: false }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await flushNextFrame();
    expect(container.querySelector("canvas")).toHaveAttribute("data-animation-state", "fallback");

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    expect(createHeroRenderer).toHaveBeenCalledTimes(1);
    expect(rafCallbacks.size).toBe(1);
    await flushNextFrame(32);

    expect(container.querySelector("canvas")).toHaveAttribute("data-animation-state", "active");
    expect(createHeroRenderer).toHaveBeenCalledTimes(1);
  });

  it("retains a restoration permit across deferred geometry and activity interruption", async () => {
    const { container } = render(<Harness />);
    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(1));
    await flushNextFrame();

    const fontsReady = createDeferred();
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: fontsReady.promise },
    });
    const canvas = container.querySelector("canvas")!;
    act(() => {
      canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
      canvas.dispatchEvent(new Event("webglcontextrestored"));
    });

    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 900,
      height: 900,
      left: 0,
      right: 420,
      top: 0,
      width: 420,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    act(() => {
      window.dispatchEvent(new Event("resize"));
      intersectionCallback(
        [{ isIntersecting: false }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await act(async () => fontsReady.resolve());
    expect(createHeroRenderer).toHaveBeenCalledTimes(1);

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(2));
    await flushNextFrame(32);

    expect(canvas).toHaveAttribute("data-animation-state", "active");
  });

  it("rebuilds when geometry invalidates a restored renderer before presentation", async () => {
    const { container } = render(<Harness />);
    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(1));
    await flushNextFrame();

    const canvas = container.querySelector("canvas")!;
    act(() => {
      canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
      canvas.dispatchEvent(new Event("webglcontextrestored"));
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(2));

    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 900,
      height: 900,
      left: 0,
      right: 420,
      top: 0,
      width: 420,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    act(() => window.dispatchEvent(new Event("resize")));
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(3));
    await flushNextFrame(32);

    expect(canvas).toHaveAttribute("data-animation-state", "active");
  });

  it("uses the static fallback when required observer APIs are unavailable", () => {
    const savedResizeObserver = global.ResizeObserver;
    // @ts-expect-error exercising a browser without ResizeObserver
    delete global.ResizeObserver;
    const { container } = render(<Harness />);

    expect(container.querySelector("canvas.hero-visual-canvas")).toHaveAttribute(
      "data-animation-state",
      "fallback"
    );
    expect(createHeroRenderer).not.toHaveBeenCalled();
    global.ResizeObserver = savedResizeObserver;
  });

  it("does not allocate graphics for reduced motion or forced colors", () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const reduced = render(<Harness />);
    expect(createHeroRenderer).not.toHaveBeenCalled();
    expect(reduced.container.querySelector("canvas")).toHaveAttribute(
      "data-animation-state",
      "fallback"
    );
    reduced.unmount();

    jest.mocked(useReducedMotion).mockReturnValue(false);
    jest.mocked(useMediaQuery).mockReturnValue(true);
    render(<Harness />);
    expect(createHeroRenderer).not.toHaveBeenCalled();
  });

  it("reveals fallback on context loss and rebuilds after restoration", async () => {
    const onReadyChange = jest.fn();
    const { container } = render(<Harness onReadyChange={onReadyChange} />);
    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(1));
    await flushNextFrame();

    const canvas = container.querySelector("canvas")!;
    const lost = new Event("webglcontextlost", { cancelable: true });
    act(() => canvas.dispatchEvent(lost));
    expect(lost.defaultPrevented).toBe(true);
    expect(canvas).toHaveAttribute("data-animation-state", "fallback");
    expect(onReadyChange).toHaveBeenLastCalledWith(false);

    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 900,
      height: 900,
      left: 0,
      right: 420,
      top: 0,
      width: 420,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    act(() => {
      window.dispatchEvent(new Event("resize"));
      intersectionCallback(
        [{ isIntersecting: false }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await Promise.resolve();
    expect(createHeroRenderer).toHaveBeenCalledTimes(1);

    act(() => canvas.dispatchEvent(new Event("webglcontextrestored")));
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(2));
    await flushNextFrame(32);
    expect(canvas).toHaveAttribute("data-animation-state", "active");
  });

  it("pins fallback after two restoration failures until remount", async () => {
    const { container, unmount } = render(<Harness />);
    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(1));
    await flushNextFrame();

    const canvas = container.querySelector("canvas")!;
    const restorationFailure = {
      ok: false as const,
      reason: "context-unavailable" as const,
      retryable: true,
    };

    jest.mocked(createHeroRenderer).mockImplementationOnce(() => {
      throw new Error("restoration creation failed");
    });
    act(() => {
      canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
      canvas.dispatchEvent(new Event("webglcontextrestored"));
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(2));
    act(() => {
      window.dispatchEvent(new Event("resize"));
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await Promise.resolve();
    expect(createHeroRenderer).toHaveBeenCalledTimes(2);

    jest.mocked(createHeroRenderer).mockImplementationOnce(() => restorationFailure);
    act(() => {
      canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
      canvas.dispatchEvent(new Event("webglcontextrestored"));
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(3));
    act(() => {
      canvas.dispatchEvent(new Event("webglcontextrestored"));
      window.dispatchEvent(new Event("resize"));
    });
    await Promise.resolve();
    expect(createHeroRenderer).toHaveBeenCalledTimes(3);
    expect(canvas).toHaveAttribute("data-animation-state", "fallback");

    act(() => {
      canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
      canvas.dispatchEvent(new Event("webglcontextrestored"));
    });
    await Promise.resolve();
    expect(createHeroRenderer).toHaveBeenCalledTimes(3);
    expect(canvas).toHaveAttribute("data-animation-state", "fallback");

    unmount();
    const remounted = render(<Harness />);
    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(4));
    await flushNextFrame(48);
    expect(remounted.container.querySelector("canvas")).toHaveAttribute(
      "data-animation-state",
      "active"
    );
  });

  it("catches initialization throws before renderer acquisition", async () => {
    jest.mocked(createHeroRenderer).mockImplementationOnce(() => {
      throw new Error("renderer creation failed");
    });
    const { container } = render(<Harness />);

    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(1));

    expect(container.querySelector("canvas")).toHaveAttribute("data-animation-state", "fallback");
    expect(renderer.dispose).not.toHaveBeenCalled();
    expect(rafCallbacks.size).toBe(0);
  });

  it("disposes an acquired renderer when initialization throws", async () => {
    jest.mocked(createHeroTextMask).mockImplementationOnce(() => {
      throw new Error("mask creation failed");
    });
    const { container } = render(<Harness />);

    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(1));

    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(container.querySelector("canvas")).toHaveAttribute("data-animation-state", "fallback");
    expect(rafCallbacks.size).toBe(0);
  });

  it("keeps fallback visible when renderer creation fails", async () => {
    jest.mocked(createHeroRenderer).mockReturnValueOnce({
      ok: false,
      reason: "context-unavailable",
      retryable: false,
    });
    const { container } = render(<Harness />);

    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(1));

    expect(container.querySelector("canvas")).toHaveAttribute("data-animation-state", "fallback");
    expect(rafCallbacks.size).toBe(0);
  });

  it("disposes the renderer and reveals fallback when an animation draw fails", async () => {
    renderer.render
      .mockReturnValueOnce({ ok: true, value: undefined })
      .mockReturnValueOnce({ ok: false, reason: "draw-failed", retryable: true });
    const { container } = render(<Harness />);

    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(1));
    await flushNextFrame();
    await flushNextFrame(32);

    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(container.querySelector("canvas")).toHaveAttribute("data-animation-state", "fallback");
    expect(rafCallbacks.size).toBe(0);
  });

  it("disposes the renderer and reveals fallback when an animation draw throws", async () => {
    const onReadyChange = jest.fn();
    renderer.render
      .mockReturnValueOnce({ ok: true, value: undefined })
      .mockImplementationOnce(() => {
        throw new Error("draw threw");
      });
    const { container } = render(<Harness onReadyChange={onReadyChange} />);

    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalledTimes(1));
    await flushNextFrame();
    expect(onReadyChange).toHaveBeenLastCalledWith(true);

    await flushNextFrame(32);

    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(container.querySelector("canvas")).toHaveAttribute("data-animation-state", "fallback");
    expect(onReadyChange).toHaveBeenLastCalledWith(false);
    expect(rafCallbacks.size).toBe(0);
  });

  it("falls back on renderer failure and cleans observers and resources on unmount", async () => {
    const { unmount } = render(<Harness />);
    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
      intersectionCallback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => expect(createHeroRenderer).toHaveBeenCalled());
    await flushNextFrame();
    unmount();

    expect(resizeDisconnect).toHaveBeenCalledTimes(1);
    expect(intersectionDisconnect).toHaveBeenCalledTimes(1);
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(rafCallbacks.size).toBe(0);
  });
});

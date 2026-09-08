export type HeroTextMask = {
  canvas: HTMLCanvasElement;
  generation: number;
  height: number;
  width: number;
};

type GlyphMeasurement = {
  element: HTMLElement;
  rect: DOMRect;
  text: string;
};

type CreateHeroTextMaskOptions = {
  container: HTMLElement;
  cssHeight: number;
  cssWidth: number;
  dpr: number;
  elements: HTMLElement[];
  generation: number;
  maxTextureSize: number;
  createCanvas?: () => HTMLCanvasElement;
  measureGlyphs?: (elements: HTMLElement[]) => GlyphMeasurement[];
};

function textNodes(root: HTMLElement): Text[] {
  const nodes: Text[] = [];

  function visit(node: Node) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE && child.textContent) {
        nodes.push(child as Text);
      } else {
        visit(child);
      }
    });
  }

  visit(root);
  return nodes;
}

export function measureTextGlyphs(elements: HTMLElement[]): GlyphMeasurement[] {
  const measurements: GlyphMeasurement[] = [];

  for (const root of elements) {
    for (const node of textNodes(root)) {
      const text = node.textContent ?? "";
      const element = node.parentElement ?? root;

      for (let index = 0; index < text.length; index += 1) {
        if (/\s/.test(text[index])) continue;

        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        range.detach();

        if (rect.width > 0 && rect.height > 0) {
          measurements.push({ element, rect, text: text[index] });
        }
      }
    }
  }

  return measurements;
}

export function createHeroTextMask({
  container,
  cssHeight,
  cssWidth,
  dpr,
  elements,
  generation,
  maxTextureSize,
  createCanvas = () => document.createElement("canvas"),
  measureGlyphs = measureTextGlyphs,
}: CreateHeroTextMaskOptions): HeroTextMask | null {
  const width = Math.max(1, Math.round(cssWidth * dpr));
  const height = Math.max(1, Math.round(cssHeight * dpr));

  if (width > maxTextureSize || height > maxTextureSize) return null;

  const canvas = createCanvas();
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const containerRect = container.getBoundingClientRect();
  const styleCache = new Map<HTMLElement, CSSStyleDeclaration>();

  context.clearRect(0, 0, width, height);
  context.scale(dpr, dpr);
  context.fillStyle = "#fff";
  context.textAlign = "left";
  context.textBaseline = "middle";

  for (const glyph of measureGlyphs(elements)) {
    const style = styleCache.get(glyph.element) ?? window.getComputedStyle(glyph.element);
    styleCache.set(glyph.element, style);
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.fillText(
      glyph.text,
      glyph.rect.left - containerRect.left,
      glyph.rect.top - containerRect.top + glyph.rect.height / 2
    );
  }

  return { canvas, generation, height, width };
}

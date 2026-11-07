import assert from "node:assert/strict";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDFDocument, PDFDict, PDFName, PDFStream } from "pdf-lib";

export const compact = (text) => text.normalize("NFKC").replace(/[\s\u200b\u00ad•✓]/gu, "");

const characterCounts = (text) => [...text].sort().join("");
const occurrences = (text, part) => text.split(part).length - 1;

async function embeddedFonts(buffer) {
  const pdf = await PDFDocument.load(buffer);
  const fonts = [];
  for (const [, object] of pdf.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFDict)) continue;
    if (object.get(PDFName.of("Type"))?.toString() === "/FontDescriptor") {
      const name = object.get(PDFName.of("FontName"))?.toString();
      const stream = ["FontFile", "FontFile2", "FontFile3"]
        .map((key) => object.lookup(PDFName.of(key)))
        .find((value) => value instanceof PDFStream);
      assert.ok(stream && stream.getContents().length > 0, `Font is not embedded: ${name}`);
      if (name?.includes("Inter")) fonts.push(name);
      else throw new Error(`Unexpected PDF font: ${name}`);
    }
    if (object.get(PDFName.of("Subtype"))?.toString() === "/Type0") {
      assert.ok(
        object.lookup(PDFName.of("ToUnicode")) instanceof PDFStream,
        "Missing font Unicode map"
      );
    }
    if (
      object.get(PDFName.of("Type"))?.toString() === "/Font" &&
      object.get(PDFName.of("Subtype"))?.toString() !== "/Type0"
    ) {
      assert.ok(
        object.lookup(PDFName.of("FontDescriptor")) instanceof PDFDict,
        "Font is not embedded: missing descriptor"
      );
    }
  }
  assert.ok(fonts.length > 0, "No embedded Inter fonts found");
  return fonts;
}

export async function checkPdf(buffer, source, preview = false) {
  const task = getDocument({ data: new Uint8Array(buffer), useSystemFonts: false });
  try {
    const pdf = await task.promise;
    assert.equal(pdf.numPages, 1, "PDF must contain exactly one page");
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    assert.ok(
      Math.abs(viewport.width - 595.28) < 1 && Math.abs(viewport.height - 841.89) < 1,
      "PDF must be portrait A4"
    );
    const fonts = await embeddedFonts(buffer);
    const items = (await page.getTextContent()).items.filter((item) => "str" in item);
    const text = items.map((item) => item.str).join(" ");
    if (source.format === "ats") {
      assert.equal(compact(text), compact(source.text), "ATS reading order/text changed");
    } else {
      assert.equal(
        characterCounts(compact(text)),
        characterCounts(compact(source.text)),
        "Visual text characters/count changed"
      );
      for (const line of new Set(source.lines.map(compact).filter(Boolean))) {
        assert.equal(
          occurrences(compact(text), line),
          occurrences(compact(source.text), line),
          `Missing/repeated PDF text: ${line}`
        );
      }
    }
    const visible = items.filter((item) => item.str.trim());
    const boxes = visible.map((item) => {
      const size = Math.hypot(item.transform[2], item.transform[3]);
      assert.ok(size >= 9.45, `PDF text too small: ${size.toFixed(2)}pt ${item.str}`);
      const x = item.transform[4];
      const baseline = item.transform[5];
      assert.ok(
        x >= -0.5 &&
          x + item.width <= viewport.width + 0.5 &&
          baseline - size * 0.2 >= 0 &&
          baseline + size * 0.8 <= viewport.height + 0.5,
        `PDF text outside A4 page: ${item.str}`
      );
      return { x, y: baseline - size * 0.2, width: item.width, height: size, text: item.str };
    });
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i],
          b = boxes[j];
        const overlapWidth = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const overlapHeight = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        if (overlapWidth > 1 && overlapHeight > 1) {
          const ratio =
            (overlapWidth * overlapHeight) / Math.min(a.width * a.height, b.width * b.height);
          assert.ok(ratio < 0.2, `Overlapping PDF text: ${a.text} / ${b.text}`);
        }
      }
    const links = (await page.getAnnotations())
      .filter((item) => item.subtype === "Link")
      .map((item) => item.url);
    for (const url of source.links) {
      assert.ok(links.includes(url), `Missing PDF link: ${url}`);
    }
    assert.ok(
      buffer.length <= (source.format === "ats" ? 200 : 750) * 1024,
      "PDF exceeds size budget; inspect assets before changing the budget"
    );
    let png;
    if (preview) {
      const view = page.getViewport({ scale: 2 });
      const canvas = createCanvas(Math.ceil(view.width), Math.ceil(view.height));
      await page.render({ canvasContext: canvas.getContext("2d"), viewport: view }).promise;
      png = canvas.toBuffer("image/png");
    }
    return {
      png,
      report: {
        pages: pdf.numPages,
        widthPt: viewport.width,
        heightPt: viewport.height,
        bytes: buffer.length,
        textCharacters: text.length,
        links: links.length,
        embeddedFonts: fonts,
        minTextSizePt: Math.min(
          ...visible.map((item) => Math.hypot(item.transform[2], item.transform[3]))
        ),
      },
    };
  } finally {
    await task.destroy();
  }
}

// Runs in Chromium after print media, web fonts and images have settled.
export async function inspectSource(format) {
  await Promise.all(
    [400, 500, 600, 700].map((weight) => document.fonts.load(`${weight} 12px "CV Inter"`))
  );
  await document.fonts.load('italic 12px "CV Inter"');
  await document.fonts.ready;
  await Promise.all([...document.images].map((image) => image.decode()));
  const fonts = [...document.fonts];
  if (fonts.some((font) => font.status === "error")) {
    throw new Error("A document font failed to load");
  }
  if (!fonts.some((font) => font.family.includes("CV Inter") && font.status === "loaded")) {
    throw new Error("CV requires the local Inter font");
  }
  const root = document.querySelector(format === "ats" ? "main" : ".cv-container");
  if (!root) throw new Error("CV print container not found");
  const bounds = root.getBoundingClientRect();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const lines = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent.trim()) continue;
    const effectiveStyle = getComputedStyle(node.parentElement);
    if (
      ["hidden", "collapse"].includes(effectiveStyle.visibility) ||
      effectiveStyle.color === "rgba(0, 0, 0, 0)" ||
      Number.parseFloat(effectiveStyle.fontSize) === 0
    ) {
      throw new Error("Invisible CV text");
    }
    const ancestors = [];
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (
        style.display === "none" ||
        style.contentVisibility === "hidden" ||
        Number.parseFloat(style.opacity) === 0
      ) {
        throw new Error("Invisible CV text");
      }
      ancestors.push({ style, box: parent.getBoundingClientRect() });
    }
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()];
    if (!rects.length) continue;
    lines.push(node.textContent.trim());
    for (const rect of rects) {
      if (
        rect.left < bounds.left - 1 ||
        rect.right > bounds.right + 1 ||
        rect.top < bounds.top - 1 ||
        (format === "visual" && rect.bottom > bounds.bottom + 1)
      ) {
        throw new Error(`Text outside print container: ${node.textContent.trim()}`);
      }
      for (const { style, box } of ancestors) {
        const clippedHorizontally =
          ["hidden", "clip"].includes(style.overflowX) &&
          (rect.right > box.right + 1 || rect.left < box.left - 1);
        const clippedVertically =
          ["hidden", "clip"].includes(style.overflowY) &&
          (rect.bottom > box.bottom + 1 || rect.top < box.top - 1);
        if (clippedHorizontally || clippedVertically) {
          throw new Error(`Clipped text: ${node.textContent.trim()}`);
        }
      }
    }
  }
  const images = [...document.images].map((image) => {
    const rect = image.getBoundingClientRect();
    const dpi = Math.min(image.naturalWidth / rect.width, image.naturalHeight / rect.height) * 96;
    if (dpi < 240) throw new Error(`Portrait resolution too low: ${dpi.toFixed(0)} DPI`);
    return { width: image.naturalWidth, height: image.naturalHeight, dpi: Math.round(dpi) };
  });
  return {
    format,
    lines,
    text: root.innerText,
    links: [...new Set([...root.querySelectorAll("a[href]")].map((a) => a.href))],
    fonts: [...new Set(fonts.map((font) => font.family))],
    images,
  };
}

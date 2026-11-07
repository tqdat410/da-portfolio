import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import { PDFDocument, PDFDict, PDFName, StandardFonts } from "pdf-lib";
import { browserPath } from "./export-cvs.mjs";
import { publishPdfs } from "./cv-pdf-output.mjs";
import { checkPdf, inspectSource } from "./cv-pdf-quality.mjs";

const root = new URL("../cvs/", import.meta.url);
const browser = await chromium.launch({ executablePath: browserPath(), headless: true });
let checks = 0;
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 1200 }, offline: true });
  await page.goto(new URL("sap-abap/ats.html", root).href);
  await page.emulateMedia({ media: "print" });
  const source = (text, format = "ats") => ({ format, text, lines: [text], links: [] });
  async function fixture(content) {
    await page.setContent(
      `<link rel="stylesheet" href="../styles/ats.css"><main>${content}</main>`
    );
    await page.evaluate(() => document.fonts.ready);
    return page.pdf({ preferCSSPageSize: true, tagged: true });
  }
  async function reject(promise, pattern) {
    await assert.rejects(promise, pattern);
    checks++;
  }
  const valid = await fixture("Résumé — OOP");
  await checkPdf(valid, source("Résumé — OOP"));
  checks++;
  await reject(checkPdf(valid, source("Résumé OOP")), /reading order/);
  await reject(checkPdf(valid, source("Resume — OOP")), /reading order/);
  await reject(
    checkPdf(valid, { ...source("Résumé — OOP"), links: ["https://example.com/"] }),
    /Missing PDF link/
  );
  const repeat = await fixture("Repeat");
  await reject(
    checkPdf(repeat, { ...source("Repeat Repeat", "visual"), lines: ["Repeat", "Repeat"] }),
    /characters\/count/
  );
  const small = await fixture('<p style="font-size:8pt">Small text</p>');
  await reject(checkPdf(small, source("Small text")), /too small/);
  const overlap = await fixture(
    '<div style="position:relative"><p style="position:absolute;top:0">First</p><p style="position:absolute;top:0">Second</p></div>'
  );
  await reject(checkPdf(overlap, source("First Second")), /Overlapping PDF text/);
  const outside = await fixture('<p style="transform:translateX(200mm)">Outside page</p>');
  // Chromium may shrink an overflowing page before PDF creation; either defect is invalid.
  await reject(checkPdf(outside, source("Outside page")), /outside A4|too small/);
  const two = await fixture('<p>First page</p><p style="break-before:page">Second page</p>');
  await reject(checkPdf(two, source("First page Second page")), /exactly one page/);
  const noFont = await PDFDocument.load(valid);
  for (const [, object] of noFont.context.enumerateIndirectObjects()) {
    if (
      object instanceof PDFDict &&
      object.get(PDFName.of("Type"))?.toString() === "/FontDescriptor"
    ) {
      for (const key of ["FontFile", "FontFile2", "FontFile3"]) object.delete(PDFName.of(key));
    }
  }
  await reject(checkPdf(await noFont.save(), source("Résumé — OOP")), /not embedded/);
  const standardFont = await PDFDocument.load(valid);
  const helvetica = await standardFont.embedFont(StandardFonts.Helvetica);
  standardFont.getPage(0).drawText("Extra", { x: 50, y: 50, size: 12, font: helvetica });
  await reject(checkPdf(await standardFont.save(), source("Résumé — OOP Extra")), /not embedded/);
  await fixture(
    '<div style="height:10px;overflow:hidden"><p style="margin-top:50px">Clipped</p></div>'
  );
  await reject(page.evaluate(inspectSource, "ats"), /Clipped text/);
  await fixture(
    '<div style="width:20px;overflow:hidden"><span style="white-space:nowrap">Nested clipped text</span></div>'
  );
  await reject(page.evaluate(inspectSource, "ats"), /Clipped text/);
  await fixture('<p style="opacity:0">Invisible</p>');
  await reject(page.evaluate(inspectSource, "ats"), /Invisible CV text/);
  await fixture("<p hidden>Hidden</p>");
  await reject(page.evaluate(inspectSource, "ats"), /Invisible CV text/);
  await fixture('<img src="file:///missing-cv-image.png">Readable');
  await reject(page.evaluate(inspectSource, "ats"), /decoded|decode|source image/);

  const publicationRoot = await mkdtemp(path.join(tmpdir(), "cv-pdf-publication-"));
  try {
    const output = path.join(publicationRoot, "pdf");
    const marker = path.join(output, "previous.txt");
    await mkdir(output);
    await writeFile(marker, "previous batch");
    await reject(publishPdfs(output, [{ name: "missing/file", buffer: valid }], {}), /ENOENT/);
    assert.equal(await readFile(marker, "utf8"), "previous batch");
    checks++;
  } finally {
    await rm(publicationRoot, { recursive: true, force: true });
  }

  for (const role of ["sap-abap", "software-engineer", "ai-agent"]) {
    for (const format of ["ats", "visual"]) {
      const url = new URL(`${role}/${format}.html`, root);
      await page.goto(url.href);
      async function geometry(media) {
        await page.emulateMedia({ media });
        await page.evaluate(inspectSource, format);
        return page.evaluate((format) => {
          const root = document.querySelector(format === "ats" ? "main" : ".cv-container");
          const bounds = root.getBoundingClientRect();
          return {
            width: bounds.width,
            height: bounds.height,
            boxes: [...root.querySelectorAll("*")]
              .filter((element) => element.namespaceURI !== "http://www.w3.org/2000/svg")
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return [rect.x - bounds.x, rect.y - bounds.y, rect.width, rect.height];
              }),
          };
        }, format);
      }
      const screen = await geometry("screen"),
        print = await geometry("print");
      assert.ok(Math.abs(screen.width - 793.7) < 1, `${role}/${format}: not A4 width`);
      assert.ok(Math.abs(screen.height - 1122.52) < 1, `${role}/${format}: not one A4 sheet`);
      assert.ok(
        Math.abs(screen.width - print.width) < 0.1 && Math.abs(screen.height - print.height) < 0.1,
        `${role}/${format}: screen/print sheet differs`
      );
      for (let i = 0; i < screen.boxes.length; i++)
        for (let j = 0; j < 4; j++) {
          assert.ok(
            Math.abs(screen.boxes[i][j] - print.boxes[i][j]) < 0.1,
            `${role}/${format}: screen/print geometry differs`
          );
        }
      const input = await readFile(fileURLToPath(url), "utf8");
      assert.ok(!/@import.*https:|href="https:.*(?:css|woff)|src="https:/.test(input));
      await page.setViewportSize({ width: 375, height: 900 });
      await page.emulateMedia({ media: "screen" });
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= 375),
        "Mobile HTML overflow"
      );
      await page.setViewportSize({ width: 1100, height: 1200 });
      checks++;
    }
  }
  console.log(
    `${checks} CV checks passed: PDF defects, offline assets, desktop print parity and mobile layout.`
  );
} finally {
  await browser.close();
}

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { checkPdf, inspectSource } from "./cv-pdf-quality.mjs";
import { publishPdfs } from "./cv-pdf-output.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "cvs/pdf");
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");

export function browserPath() {
  const executable = process.env.CV_BROWSER_PATH || chromium.executablePath();
  if (!existsSync(executable))
    throw new Error("Run npm run cv:setup to install the pinned Chromium");
  return executable;
}

async function inputHashes() {
  const files = await readdir(path.join(root, "cvs"), { recursive: true, withFileTypes: true });
  const inputs = {};
  for (const file of files) {
    const absolute = path.join(file.parentPath, file.name);
    const relative = path.relative(path.join(root, "cvs"), absolute).replaceAll("\\", "/");
    if (
      file.isFile() &&
      !relative.startsWith("pdf/") &&
      /\.(html|css|woff2|jpg|txt)$/.test(relative)
    ) {
      inputs[relative] = hash(await readFile(absolute));
    }
  }
  return inputs;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--preview")) {
    throw new Error("Usage: npm run cv:pdf -- [--preview]");
  }
  const preview = args.includes("--preview");
  const inputs = await inputHashes();
  const browser = await chromium.launch({ executablePath: browserPath(), headless: true });
  const results = [];
  try {
    for (const role of ["sap-abap", "software-engineer", "ai-agent"]) {
      for (const format of ["ats", "visual"]) {
        const relative = `cvs/${role}/${format}.html`;
        const input = path.join(root, relative);
        const sourceHash = hash(await readFile(input));
        const page = await browser.newPage({
          viewport: { width: 1100, height: 1200 },
          offline: true,
          serviceWorkers: "block",
        });
        const failures = [];
        page.on("requestfailed", (request) => failures.push(request.url()));
        page.on("response", (response) => {
          if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
        });
        try {
          await page.emulateMedia({ media: "print" });
          await page.goto(pathToFileURL(input).href, { waitUntil: "networkidle" });
          const source = await page.evaluate(inspectSource, format);
          if (failures.length) throw new Error(`Asset failures: ${failures.join(", ")}`);
          const buffer = await page.pdf({
            preferCSSPageSize: true,
            printBackground: true,
            displayHeaderFooter: false,
            scale: 1,
            tagged: true,
          });
          const { report, png } = await checkPdf(buffer, source, preview);
          results.push({
            name: `tran-quoc-dat-${role}-${format}`,
            buffer,
            png,
            report: {
              source: relative,
              sourceHash,
              pdfHash: hash(buffer),
              ...report,
              fonts: source.fonts,
              images: source.images,
            },
          });
          console.log(`${role}/${format}: 1 A4 page, ${(buffer.length / 1024).toFixed(1)} KiB`);
        } catch (error) {
          throw new Error(`${relative}: ${error.message}`, { cause: error });
        } finally {
          await page.close();
        }
      }
    }
    if (JSON.stringify(await inputHashes()) !== JSON.stringify(inputs)) {
      throw new Error("CV inputs/assets changed during export; retry after saving all edits");
    }
    await publishPdfs(output, results, {
      exportedAt: new Date().toISOString(),
      browser: browser.version(),
      browserExecutable: browserPath(),
      offline: true,
      inputs,
      files: results.map(({ name, report }) => ({ name: `${name}.pdf`, ...report })),
    });
    console.log(`Validated PDFs saved to ${output}`);
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// Stage the complete batch so a failed write does not mix old and new documents.
export async function publishPdfs(output, results, manifest) {
  const parent = path.dirname(output);
  const staged = await mkdtemp(path.join(parent, ".pdf-stage-"));
  const backup = `${staged}-previous`;
  async function clean(target) {
    if (path.dirname(target) !== parent || !path.basename(target).startsWith(".pdf-stage-")) {
      throw new Error("Refusing to remove a directory outside this export's staging area");
    }
    await rm(target, { recursive: true, force: true });
  }
  try {
    if (results.some((result) => result.png)) await mkdir(path.join(staged, "previews"));
    for (const result of results) {
      await writeFile(path.join(staged, `${result.name}.pdf`), result.buffer);
      if (result.png)
        await writeFile(path.join(staged, "previews", `${result.name}.png`), result.png);
    }
    await writeFile(path.join(staged, "validation.json"), JSON.stringify(manifest, null, 2) + "\n");
    if (existsSync(output)) await rename(output, backup);
    try {
      await rename(staged, output);
    } catch (error) {
      if (existsSync(backup)) await rename(backup, output);
      throw error;
    }
    await clean(backup);
  } finally {
    await clean(staged);
  }
}

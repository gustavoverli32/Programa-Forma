import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(projectRoot, "src", "legacy", "source.html");
const outputPath = path.join(projectRoot, "src", "legacy", "shell.json");
const legacyCssPath = path.join(projectRoot, "src", "app", "legacy.css");

const source = await readFile(sourcePath, "utf8");
const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

if (!body) {
  throw new Error("Nao foi possivel localizar o corpo do HTML legado.");
}

const birthdayOptions = Array.from(
  { length: 31 },
  (_, index) => `<option value="${index + 1}">${index + 1}</option>`,
).join("");

const html = body[1]
  .replace(
    /<script>\s*for\(var _d=1;_d<=31;_d\+\+\) document\.write\([\s\S]*?<\/script>/i,
    birthdayOptions,
  )
  .replace(/<script\s+src=["']\.\/assets\/js\/security\.js[^>]*><\/script>/gi, "")
  .replace(/<script\s+src=["']\.\/assets\/js\/app\.js[^>]*><\/script>/gi, "")
  .replace(/<link\s+rel=["']stylesheet["']\s+href=["']\.\/assets\/css\/app\.css[^>]*>/gi, "")
  .trim();

await writeFile(outputPath, `${JSON.stringify({ html }, null, 2)}\n`, "utf8");

const legacyCss = await readFile(legacyCssPath, "utf8");
const normalizedCss = legacyCss
  .replaceAll("'DM Sans'", "var(--font-dm-sans)")
  .replaceAll("'DM Serif Display'", "var(--font-dm-serif)");
await writeFile(legacyCssPath, normalizedCss, "utf8");

console.log(`Shell legado atualizado em ${outputPath}`);

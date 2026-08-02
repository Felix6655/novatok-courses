import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { importTranslations } from "@/server/translations/editorial";
async function main() {
  const path = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!path) throw new Error("Usage: npm run translations:import -- path.json [--dry-run]");
  const input = JSON.parse(await readFile(resolve(path), "utf8"));
  const result = await importTranslations(input, process.argv.includes("--dry-run"));
  console.log(`${result.dryRun ? "Validated" : "Imported"} ${result.rows} rows${result.dryRun ? " (dry run; database unchanged)" : ""}.`);
}
main();

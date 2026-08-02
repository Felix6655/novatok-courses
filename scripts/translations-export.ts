import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { localeSchema } from "@/i18n/config";
import { exportTranslations } from "@/server/translations/editorial";
function value(flag: string) { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : undefined; }
async function main() {
  const locale = localeSchema.parse(value("--locale"));
  const output = resolve(value("--out") ?? `translation-exports/${locale}.json`);
  const document = await exportTranslations(locale);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  console.log(`Exported ${document.rows.length} rows for ${locale} to ${output}`);
}
main();

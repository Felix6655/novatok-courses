import "dotenv/config";
import { auditTranslations } from "@/server/translations/editorial";
async function main() {
  const report = await auditTranslations();
  for (const item of report.coverage) {
    console.log(`\nLocale: ${item.locale}`);
    for (const [name, value] of Object.entries({ Courses: item.courses, Modules: item.modules, Lessons: item.lessons })) console.log(`${name}: ${value.translated}/${value.total} (draft ${value.draft}, reviewed ${value.reviewed}, published ${value.published}, fallback ${value.fallback}, missing ${value.missing})`);
  }
  for (const issue of report.issues) console.error(`${issue.severity.toUpperCase()} ${issue.code}: ${issue.message}`);
  if (report.issues.some((issue) => issue.severity === "error")) process.exitCode = 1;
}
main();

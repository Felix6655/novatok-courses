import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { localeSchema, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { TranslationStatus } from "@/generated/prisma/enums";

export const translationStatusSchema = z.enum(["DRAFT", "REVIEWED", "PUBLISHED"]);
const nonEmpty = z.string().trim().min(1);
const courseFields = z.object({ title: nonEmpty, shortDescription: nonEmpty, fullDescription: nonEmpty, prerequisites: z.array(nonEmpty), learningOutcomes: z.array(nonEmpty) });
const moduleFields = z.object({ title: nonEmpty, description: nonEmpty });
const lessonFields = z.object({ title: nonEmpty, summary: nonEmpty, content: nonEmpty });
export const translationRowSchema = z.discriminatedUnion("entityType", [
  z.object({ entityType: z.literal("course"), entityId: z.string().uuid(), courseSlug: nonEmpty, locale: localeSchema, source: courseFields, translation: courseFields.partial(), status: translationStatusSchema.default("DRAFT") }),
  z.object({ entityType: z.literal("module"), entityId: z.string().uuid(), courseSlug: nonEmpty, moduleOrder: z.number().int().positive(), locale: localeSchema, source: moduleFields, translation: moduleFields.partial(), status: translationStatusSchema.default("DRAFT") }),
  z.object({ entityType: z.literal("lesson"), entityId: z.string().uuid(), courseSlug: nonEmpty, lessonSlug: nonEmpty, locale: localeSchema, source: lessonFields, translation: lessonFields.partial(), status: translationStatusSchema.default("DRAFT") }),
]);
export const translationDocumentSchema = z.object({ version: z.literal(1), locale: localeSchema, exportedAt: z.string().datetime(), rows: z.array(translationRowSchema) }).superRefine((value, context) => {
  const keys = new Set<string>();
  value.rows.forEach((row, index) => {
    if (row.locale !== value.locale) context.addIssue({ code: "custom", path: ["rows", index, "locale"], message: "Row locale must match document locale" });
    const key = `${row.entityType}:${row.entityId}:${row.locale}`;
    if (keys.has(key)) context.addIssue({ code: "custom", path: ["rows", index], message: "Duplicate entity/locale row" });
    keys.add(key);
  });
});
export type TranslationDocument = z.infer<typeof translationDocumentSchema>;

export interface EntityCoverage { total: number; translated: number; draft: number; reviewed: number; published: number; fallback: number; missing: number }
export interface LocaleCoverage { locale: Locale; courses: EntityCoverage; modules: EntityCoverage; lessons: EntityCoverage }
function coverage(total: number, rows: Array<{ locale: string; status: TranslationStatus }>, locale: Locale): EntityCoverage {
  const selected = rows.filter((row) => row.locale === locale);
  const count = (status: TranslationStatus) => selected.filter((row) => row.status === status).length;
  return { total, translated: selected.length, draft: count("DRAFT"), reviewed: count("REVIEWED"), published: count("PUBLISHED"), fallback: total - selected.length, missing: total - selected.length };
}
export async function getTranslationCoverage(): Promise<LocaleCoverage[]> {
  const [courseTotal, moduleTotal, lessonTotal, courses, modules, lessons] = await Promise.all([
    prisma.course.count(), prisma.courseModule.count(), prisma.lesson.count(),
    prisma.courseTranslation.findMany({ select: { locale: true, status: true } }),
    prisma.courseModuleTranslation.findMany({ select: { locale: true, status: true } }),
    prisma.lessonTranslation.findMany({ select: { locale: true, status: true } }),
  ]);
  return SUPPORTED_LOCALES.map((locale) => ({ locale, courses: coverage(courseTotal, courses, locale), modules: coverage(moduleTotal, modules, locale), lessons: coverage(lessonTotal, lessons, locale) }));
}

export interface AuditIssue { severity: "error" | "warning"; code: string; message: string }
export async function auditTranslations(): Promise<{ coverage: LocaleCoverage[]; issues: AuditIssue[] }> {
  const [coverageReport, courseRows, moduleRows, lessonRows] = await Promise.all([
    getTranslationCoverage(), prisma.courseTranslation.findMany(), prisma.courseModuleTranslation.findMany(), prisma.lessonTranslation.findMany(),
  ]);
  const issues: AuditIssue[] = [];
  const validate = (kind: string, rows: Array<Record<string, unknown>>, required: string[]) => {
    const seen = new Set<string>();
    for (const row of rows) {
      const locale = String(row.locale); const parentKey = kind === "course" ? "courseId" : kind === "module" ? "moduleId" : "lessonId";
      const key = `${String(row[parentKey])}:${locale}`;
      if (seen.has(key)) issues.push({ severity: "error", code: "DUPLICATE", message: `${kind} duplicate ${key}` });
      seen.add(key);
      if (!localeSchema.safeParse(locale).success) issues.push({ severity: "error", code: "UNSUPPORTED_LOCALE", message: `${kind} ${key} uses ${locale}` });
      for (const field of required) if (typeof row[field] !== "string" || !(row[field] as string).trim()) issues.push({ severity: "error", code: "EMPTY_FIELD", message: `${kind} ${key} has empty ${field}` });
      if ((row.status === "REVIEWED" || row.status === "PUBLISHED") && !row.reviewedAt) issues.push({ severity: "error", code: "MISSING_REVIEW_DATE", message: `${kind} ${key} is ${row.status} without reviewedAt` });
    }
  };
  validate("course", courseRows, ["title", "shortDescription", "fullDescription"]);
  validate("module", moduleRows, ["title", "description"]);
  validate("lesson", lessonRows, ["title", "summary", "content"]);
  return { coverage: coverageReport, issues };
}

export async function exportTranslations(locale: Locale): Promise<TranslationDocument> {
  const [courses, modules, lessons] = await Promise.all([
    prisma.course.findMany({ include: { translations: { where: { locale } } }, orderBy: { slug: "asc" } }),
    prisma.courseModule.findMany({ include: { course: true, translations: { where: { locale } } }, orderBy: [{ courseId: "asc" }, { displayOrder: "asc" }] }),
    prisma.lesson.findMany({ include: { course: true, translations: { where: { locale } } }, orderBy: [{ courseId: "asc" }, { displayOrder: "asc" }] }),
  ]);
  return { version: 1, locale, exportedAt: new Date().toISOString(), rows: [
    ...courses.map((entity) => ({ entityType: "course" as const, entityId: entity.id, courseSlug: entity.slug, locale, source: { title: entity.title, shortDescription: entity.shortDescription, fullDescription: entity.fullDescription, prerequisites: entity.prerequisites, learningOutcomes: entity.learningOutcomes }, translation: entity.translations[0] ? { title: entity.translations[0].title, shortDescription: entity.translations[0].shortDescription, fullDescription: entity.translations[0].fullDescription, prerequisites: entity.translations[0].prerequisites, learningOutcomes: entity.translations[0].learningOutcomes } : {}, status: entity.translations[0]?.status ?? "DRAFT" })),
    ...modules.map((entity) => ({ entityType: "module" as const, entityId: entity.id, courseSlug: entity.course.slug, moduleOrder: entity.displayOrder, locale, source: { title: entity.title, description: entity.description }, translation: entity.translations[0] ? { title: entity.translations[0].title, description: entity.translations[0].description } : {}, status: entity.translations[0]?.status ?? "DRAFT" })),
    ...lessons.map((entity) => ({ entityType: "lesson" as const, entityId: entity.id, courseSlug: entity.course.slug, lessonSlug: entity.slug, locale, source: { title: entity.title, summary: entity.summary, content: entity.content }, translation: entity.translations[0] ? { title: entity.translations[0].title, summary: entity.translations[0].summary, content: entity.translations[0].content } : {}, status: entity.translations[0]?.status ?? "DRAFT" })),
  ] };
}

export async function importTranslations(input: unknown, dryRun = false): Promise<{ rows: number; dryRun: boolean }> {
  const document = translationDocumentSchema.parse(input);
  const ids = { course: document.rows.filter((r) => r.entityType === "course").map((r) => r.entityId), module: document.rows.filter((r) => r.entityType === "module").map((r) => r.entityId), lesson: document.rows.filter((r) => r.entityType === "lesson").map((r) => r.entityId) };
  const [courses, modules, lessons] = await Promise.all([prisma.course.findMany({ where: { id: { in: ids.course } }, select: { id: true } }), prisma.courseModule.findMany({ where: { id: { in: ids.module } }, select: { id: true } }), prisma.lesson.findMany({ where: { id: { in: ids.lesson } }, select: { id: true } })]);
  if (courses.length !== new Set(ids.course).size || modules.length !== new Set(ids.module).size || lessons.length !== new Set(ids.lesson).size) throw new Error("Import references an unknown canonical entity ID");
  for (const row of document.rows) {
    const parsed = row.entityType === "course" ? courseFields.safeParse(row.translation) : row.entityType === "module" ? moduleFields.safeParse(row.translation) : lessonFields.safeParse(row.translation);
    if (!parsed.success) throw new Error(`${row.entityType} ${row.entityId} has incomplete translated fields`);
  }
  if (dryRun) return { rows: document.rows.length, dryRun: true };
  await prisma.$transaction(document.rows.map((row) => {
    const reviewedAt = row.status === "DRAFT" ? null : new Date();
    if (row.entityType === "course") { const data = { ...row.translation as z.infer<typeof courseFields>, locale: row.locale, status: row.status, reviewedAt }; return prisma.courseTranslation.upsert({ where: { courseId_locale: { courseId: row.entityId, locale: row.locale } }, update: data, create: { courseId: row.entityId, ...data } }); }
    if (row.entityType === "module") { const data = { ...row.translation as z.infer<typeof moduleFields>, locale: row.locale, status: row.status, reviewedAt }; return prisma.courseModuleTranslation.upsert({ where: { moduleId_locale: { moduleId: row.entityId, locale: row.locale } }, update: data, create: { moduleId: row.entityId, ...data } }); }
    const data = { ...row.translation as z.infer<typeof lessonFields>, locale: row.locale, status: row.status, reviewedAt }; return prisma.lessonTranslation.upsert({ where: { lessonId_locale: { lessonId: row.entityId, locale: row.locale } }, update: data, create: { lessonId: row.entityId, ...data } });
  }));
  return { rows: document.rows.length, dryRun: false };
}

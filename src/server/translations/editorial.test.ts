import { beforeEach, describe, expect, it, vi } from "vitest";
const prisma = {
  course: { count: vi.fn(), findMany: vi.fn() }, courseModule: { count: vi.fn(), findMany: vi.fn() }, lesson: { count: vi.fn(), findMany: vi.fn() },
  courseTranslation: { findMany: vi.fn(), upsert: vi.fn() }, courseModuleTranslation: { findMany: vi.fn(), upsert: vi.fn() }, lessonTranslation: { findMany: vi.fn(), upsert: vi.fn() },
  $transaction: vi.fn(),
};
vi.mock("@/lib/prisma", () => ({ prisma }));
const { auditTranslations, getTranslationCoverage, importTranslations, translationDocumentSchema } = await import("@/server/translations/editorial");
const id = "00000000-0000-4000-8000-000000000001";
const validDocument = { version: 1, locale: "es", exportedAt: "2026-08-02T00:00:00.000Z", rows: [{ entityType: "lesson", entityId: id, courseSlug: "javascript-fundamentals", lessonSlug: "variables", locale: "es", source: { title: "Variables", summary: "Summary", content: "Content" }, translation: { title: "Variables", summary: "Resumen", content: "Contenido" }, status: "REVIEWED" }] };
beforeEach(() => { vi.clearAllMocks(); prisma.course.count.mockResolvedValue(50); prisma.courseModule.count.mockResolvedValue(40); prisma.lesson.count.mockResolvedValue(77); prisma.courseTranslation.findMany.mockResolvedValue([{ locale: "es", status: "DRAFT", title: "x", shortDescription: "x", fullDescription: "x", courseId: id, reviewedAt: null }]); prisma.courseModuleTranslation.findMany.mockResolvedValue([]); prisma.lessonTranslation.findMany.mockResolvedValue([]); prisma.course.findMany.mockResolvedValue([]); prisma.courseModule.findMany.mockResolvedValue([]); prisma.lesson.findMany.mockResolvedValue([{ id }]); });
describe("translation editorial workflow", () => {
  it("reports translated, status, fallback, and missing counts deterministically", async () => { const report = await getTranslationCoverage(); const es = report.find((row) => row.locale === "es")!; expect(es.courses).toMatchObject({ total: 50, translated: 1, draft: 1, fallback: 49, missing: 49 }); expect(es.lessons.missing).toBe(77); });
  it("rejects unsupported locales and duplicate import rows", () => { expect(translationDocumentSchema.safeParse({ ...validDocument, locale: "it" }).success).toBe(false); expect(translationDocumentSchema.safeParse({ ...validDocument, rows: [validDocument.rows[0], validDocument.rows[0]] }).success).toBe(false); });
  it("dry-runs a complete reviewed translation without writing", async () => { await expect(importTranslations(validDocument, true)).resolves.toEqual({ rows: 1, dryRun: true }); expect(prisma.$transaction).not.toHaveBeenCalled(); });
  it("rejects incomplete translated fields", async () => { const malformed = structuredClone(validDocument); delete (malformed.rows[0].translation as Record<string, unknown>).content; await expect(importTranslations(malformed, true)).rejects.toThrow("incomplete translated fields"); });
  it("flags reviewed rows without review timestamps", async () => { prisma.courseTranslation.findMany.mockResolvedValue([{ locale: "es", status: "REVIEWED", title: "x", shortDescription: "x", fullDescription: "x", courseId: id, reviewedAt: null }]); const result = await auditTranslations(); expect(result.issues).toContainEqual(expect.objectContaining({ code: "MISSING_REVIEW_DATE" })); });
});

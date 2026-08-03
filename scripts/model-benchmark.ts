import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import {
  detectLanguageAdherence,
  createProviderForSpec,
  type AITask,
  type LanguageSignal,
} from "@/ai/model-routing";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { parseJsonLoosely } from "@/ai/parse-json-loosely";
import type { AIRequestMetadata } from "@/ai/provider";

interface BenchmarkResult {
  spec: string;
  locale: Locale;
  task: AITask;
  success: boolean;
  structured: boolean;
  unknownIdLeakage: boolean;
  language: LanguageSignal | { status: "unknown" };
  latencyMs: number;
  metadata?: AIRequestMetadata;
  sample?: string;
  error?: string;
}

const ALL_TASKS: AITask[] = ["advisor", "tutor", "coach", "practice"];
const instructions: Record<Locale, string> = {
  en: "Write all user-facing prose in English.",
  es: "Escribe todo el texto para el usuario en espanol.",
  pt: "Escreva todo o texto para o usuario em portugues.",
  fr: "Ecrivez tout le texte destine a l'utilisateur en francais.",
  de: "Schreibe alle Texte fuer den Benutzer auf Deutsch.",
};
const taskPrompts: Record<AITask, string> = {
  advisor:
    'Recommend only the course slug "javascript-fundamentals". Return {"courseSlug":string,"reason":string}.',
  tutor:
    'Explain variables using only lesson slug "variables-and-data-types". Return {"lessonSlug":string,"answer":string}.',
  coach:
    'The next lesson is "variables-and-data-types". Return {"lessonSlug":string,"explanation":string,"tips":string[]}.',
  practice:
    'Create one multiple-choice variables question. Return {"lessonSlug":"variables-and-data-types","question":string,"choices":string[],"correctChoiceIndex":number}.',
};

/**
 * Staged, bounded benchmark runner (Sprint 11). Which locales/tasks run is
 * env-configurable so the same script serves both the small Stage 1
 * language screen and the full Stage 3 per-model acceptance matrix,
 * instead of always running the full N-models x 5-locales x 4-tasks grid
 * (which is what made the original run too slow).
 *
 * BENCHMARK_MODELS   comma-separated provider:model specs (default: ollama:llama3:latest)
 * BENCHMARK_LOCALES  comma-separated locales (default: all SUPPORTED_LOCALES)
 * BENCHMARK_TASKS    comma-separated tasks (default: all AI_TASKS)
 */
function parseList<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  label: string,
): T[] {
  if (!value?.trim()) return [...allowed];
  const requested = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  for (const item of requested) {
    if (!allowed.includes(item as T)) {
      throw new Error(`Unknown ${label} "${item}". Expected one of: ${allowed.join(", ")}`);
    }
  }
  return requested as T[];
}

async function main() {
  const specs = (process.env.BENCHMARK_MODELS || "ollama:llama3:latest")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const locales = parseList(process.env.BENCHMARK_LOCALES, SUPPORTED_LOCALES, "locale");
  const tasks = parseList(process.env.BENCHMARK_TASKS, ALL_TASKS, "task");
  const maxOutputTokens = Number(process.env.BENCHMARK_MAX_TOKENS ?? 160);

  console.log(
    `Benchmarking ${specs.length} model(s) x ${locales.length} locale(s) x ${tasks.length} task(s) ` +
      `= ${specs.length * locales.length * tasks.length} calls (max ${maxOutputTokens} output tokens each)`,
  );

  const results: BenchmarkResult[] = [];
  for (const spec of specs) {
    for (const locale of locales) {
      for (const task of tasks) {
        const provider = createProviderForSpec(spec, { task, locale });
        const started = Date.now();
        try {
          const output = await provider.generateCompletion({
            messages: [
              {
                role: "system",
                content: `Return only valid JSON. ${instructions[locale]} Do not invent identifiers.`,
              },
              { role: "user", content: taskPrompts[task] },
            ],
            temperature: 0.1,
            maxTokens: maxOutputTokens,
          });
          const parsed = parseJsonLoosely(output);
          const text = JSON.stringify(parsed ?? output);
          const unknownIdLeakage = /[a-z0-9]+(?:-[a-z0-9]+){2,}/g.test(
            text
              .replaceAll("javascript-fundamentals", "")
              .replaceAll("variables-and-data-types", ""),
          );
          results.push({
            spec,
            locale,
            task,
            success: true,
            structured: parsed !== undefined,
            unknownIdLeakage,
            language: detectLanguageAdherence(output, locale),
            latencyMs: Date.now() - started,
            metadata: provider.lastRequestMetadata,
            sample: output.slice(0, 600),
          });
          console.log(`ok ${spec} ${locale} ${task}`);
        } catch (error) {
          results.push({
            spec,
            locale,
            task,
            success: false,
            structured: false,
            unknownIdLeakage: false,
            language: { status: "unknown" },
            latencyMs: Date.now() - started,
            error: error instanceof Error ? error.message : String(error),
          });
          console.log(`fail ${spec} ${locale} ${task}`);
        }
      }
    }
  }
  const summary = specs.map((spec) => {
    const rows = results.filter((row) => row.spec === spec);
    return {
      spec,
      requests: rows.length,
      success: rows.filter((row) => row.success).length,
      structured: rows.filter((row) => row.structured).length,
      languagePass: rows.filter((row) => row.language.status === "pass").length,
      languageFail: rows.filter((row) => row.language.status === "fail").length,
      unknownIdLeakage: rows.filter((row) => row.unknownIdLeakage).length,
      averageLatencyMs: Math.round(
        rows.reduce((sum, row) => sum + row.latencyMs, 0) / rows.length,
      ),
    };
  });
  await mkdir("benchmark-artifacts", { recursive: true });
  await writeFile(
    "benchmark-artifacts/model-benchmark.json",
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        methodology:
          "One bounded structured probe per model, locale, and capability. Language signal detects only obvious regressions; human review is authoritative. Grounding probe permits exactly two canonical slugs.",
        locales,
        tasks,
        summary,
        results,
      },
      null,
      2,
    ),
  );
  console.table(summary);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

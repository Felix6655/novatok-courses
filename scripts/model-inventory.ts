import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";

interface ModelRecord {
  id: string;
  provider: "ollama" | "omniroute";
  path: "local" | "remote-or-router";
  callableEndpoint: string;
  sizeBytes?: number;
  contextLength?: number;
}

interface OllamaTagsResponse {
  models?: Array<{ name: string; size?: number }>;
}

interface OmniRouteModelsResponse {
  data?: Array<{ id: string; context_length?: number }>;
}

async function json<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

async function main() {
  const ollamaBase =
    process.env.OLLAMA_BASE_URL?.trim() || "http://localhost:11434";
  const omniBase =
    process.env.OMNIROUTE_BASE_URL?.trim() || "http://localhost:20128/v1";
  const [ollamaResult, omniResult] = await Promise.allSettled([
    json<OllamaTagsResponse>(`${ollamaBase.replace(/\/$/, "")}/api/tags`),
    json<OmniRouteModelsResponse>(`${omniBase.replace(/\/$/, "")}/models`),
  ]);
  const ollamaError =
    ollamaResult.status === "rejected"
      ? String(ollamaResult.reason instanceof Error ? ollamaResult.reason.message : ollamaResult.reason)
      : null;
  const omniError =
    omniResult.status === "rejected"
      ? String(omniResult.reason instanceof Error ? omniResult.reason.message : omniResult.reason)
      : null;
  const models: ModelRecord[] = [
    ...(ollamaResult.status === "fulfilled"
      ? (ollamaResult.value.models ?? []).map((model) => ({
          id: model.name,
          provider: "ollama" as const,
          path: "local" as const,
          callableEndpoint: "ollama",
          sizeBytes: model.size,
        }))
      : []),
    ...(omniResult.status === "fulfilled"
      ? (omniResult.value.data ?? []).map((model) => ({
          id: model.id,
          provider: "omniroute" as const,
          path: model.id?.startsWith("local/")
            ? ("local" as const)
            : ("remote-or-router" as const),
          callableEndpoint: "openai-compatible",
          contextLength: model.context_length,
        }))
      : []),
  ];
  const report = {
    generatedAt: new Date().toISOString(),
    endpoints: { ollama: ollamaBase, omniroute: omniBase },
    reachable: {
      ollama: ollamaResult.status === "fulfilled",
      omniroute: omniResult.status === "fulfilled",
    },
    errors: { ollama: ollamaError, omniroute: omniError },
    counts: {
      ollama: models.filter((model) => model.provider === "ollama").length,
      omniroute: models.filter((model) => model.provider === "omniroute")
        .length,
    },
    models,
    note: "Catalog discovery only. Callable status is established by benchmark requests; no credentials are stored. An unreachable endpoint is reported (not fatal) so the other provider's catalog still gets discovered.",
  };
  await mkdir("benchmark-artifacts", { recursive: true });
  await writeFile(
    "benchmark-artifacts/model-inventory.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    `Discovered ${report.counts.ollama} Ollama and ${report.counts.omniroute} OmniRoute catalog entries.`,
  );
  if (ollamaError) console.log(`Ollama unreachable: ${ollamaError}`);
  if (omniError) console.log(`OmniRoute unreachable: ${omniError}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

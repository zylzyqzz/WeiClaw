import type { Command } from "commander";
import { defaultRuntime } from "../../runtime.js";
import type { MemoryNamespaceScope } from "../core-types.js";
import { resolveRuntimeMemoryStatus } from "../runtime/status.js";
import { createMemoryCoreRuntime } from "./core-runtime.js";

type MemoryCoreBaseOptions = {
  json?: boolean;
};

function withMemoryCoreRuntime<T>(
  run: (runtime: ReturnType<typeof createMemoryCoreRuntime>) => Promise<T> | T,
): Promise<T | undefined> {
  const runtime = createMemoryCoreRuntime();
  if (!runtime.config.enabled) {
    defaultRuntime.error(
      "Memory core is disabled. Set WEICLAW_MEMORY_ENABLED=true to enable persistent memory.",
    );
    process.exitCode = 1;
    runtime.close();
    return Promise.resolve(undefined);
  }
  return Promise.resolve(run(runtime)).finally(() => {
    runtime.close();
  });
}

function print(data: unknown, json: boolean | undefined): void {
  if (json) {
    defaultRuntime.log(JSON.stringify(data, null, 2));
    return;
  }
  if (typeof data === "string") {
    defaultRuntime.log(data);
    return;
  }
  defaultRuntime.log(JSON.stringify(data, null, 2));
}

function parseScope(value: string): MemoryNamespaceScope {
  if (value === "global" || value === "agent" || value === "session" || value === "custom") {
    return value;
  }
  throw new Error(`Invalid scope: ${value}. Use global|agent|session|custom.`);
}

export function registerMemoryCoreCli(memory: Command): void {
  const namespace = memory.command("namespace").description("Manage memory namespaces");
  namespace
    .command("create")
    .description("Create a memory namespace")
    .requiredOption("--label <label>", "Namespace label")
    .option("--scope <scope>", "Namespace scope (global|agent|session|custom)", parseScope)
    .option("--json", "Print JSON")
    .action(
      async (opts: MemoryCoreBaseOptions & { label: string; scope?: MemoryNamespaceScope }) => {
        await withMemoryCoreRuntime(async (runtime) => {
          if (!runtime) {
            return;
          }
          const created = runtime.namespaces.createNamespace({
            label: opts.label.trim(),
            scope: opts.scope,
          });
          print(created, opts.json);
        });
      },
    );

  namespace
    .command("list")
    .description("List memory namespaces")
    .option("--json", "Print JSON")
    .action(async (opts: MemoryCoreBaseOptions) => {
      await withMemoryCoreRuntime(async (runtime) => {
        if (!runtime) {
          return;
        }
        const list = runtime.namespaces.listNamespaces();
        print(list, opts.json);
      });
    });

  memory
    .command("add")
    .description("Add a persistent memory record")
    .requiredOption("--namespace <namespace>", "Namespace id or label")
    .requiredOption("--kind <kind>", "Record kind")
    .requiredOption("--content <content>", "Record content")
    .option("--source <source>", "Record source", "cli")
    .option("--json", "Print JSON")
    .action(
      async (
        opts: MemoryCoreBaseOptions & {
          namespace: string;
          kind: string;
          content: string;
          source: string;
        },
      ) => {
        await withMemoryCoreRuntime(async (runtime) => {
          if (!runtime) {
            return;
          }
          const record = runtime.records.addMemoryRecord({
            namespaceRef: opts.namespace.trim(),
            kind: opts.kind.trim(),
            content: opts.content.trim(),
            source: opts.source.trim(),
          });
          print(record, opts.json);
        });
      },
    );

  memory
    .command("list")
    .description("List persistent memory records")
    .requiredOption("--namespace <namespace>", "Namespace id or label")
    .option("--limit <n>", "Max records", (value: string) => Number(value))
    .option("--json", "Print JSON")
    .action(
      async (
        opts: MemoryCoreBaseOptions & {
          namespace: string;
          limit?: number;
        },
      ) => {
        await withMemoryCoreRuntime(async (runtime) => {
          if (!runtime) {
            return;
          }
          const records = runtime.records.listMemoryRecords({
            namespaceRef: opts.namespace.trim(),
            limit: opts.limit,
          });
          print(records, opts.json);
        });
      },
    );

  memory
    .command("query")
    .description("Query persistent memory records")
    .requiredOption("--text <text>", "Query text")
    .option("--namespace <namespace>", "Namespace id or label")
    .option("--limit <n>", "Max records", (value: string) => Number(value))
    .option("--json", "Print JSON")
    .action(
      async (
        opts: MemoryCoreBaseOptions & {
          namespace?: string;
          text: string;
          limit?: number;
        },
      ) => {
        await withMemoryCoreRuntime(async (runtime) => {
          if (!runtime) {
            return;
          }
          const results = runtime.query.queryMemory({
            namespaceRef: opts.namespace?.trim(),
            text: opts.text,
            limit: opts.limit ?? runtime.config.queryLimit,
          });
          print(results, opts.json);
        });
      },
    );

  memory
    .command("delete")
    .description("Delete one persistent memory record")
    .requiredOption("--record-id <recordId>", "Record id")
    .option("--json", "Print JSON")
    .action(async (opts: MemoryCoreBaseOptions & { recordId: string }) => {
      await withMemoryCoreRuntime(async (runtime) => {
        if (!runtime) {
          return;
        }
        const deleted = runtime.records.deleteMemoryRecord(opts.recordId.trim());
        print({ deleted, recordId: opts.recordId }, opts.json);
      });
    });

  memory
    .command("doctor")
    .description("Check persistent memory core health")
    .option("--json", "Print JSON")
    .action(async (opts: MemoryCoreBaseOptions) => {
      await withMemoryCoreRuntime(async (runtime) => {
        if (!runtime) {
          return;
        }
        const namespaces = runtime.namespaces.listNamespaces();
        const runtimeStatus = resolveRuntimeMemoryStatus();
        const report = {
          enabled: runtime.config.enabled,
          dbPath: runtime.store.getDatabasePath(),
          defaultNamespace: runtime.config.defaultNamespace,
          namespaces: namespaces.length,
          runtime: runtimeStatus,
          status: "ok",
        };
        print(report, opts.json);
      });
    });
}

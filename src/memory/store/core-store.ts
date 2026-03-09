import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type {
  MemoryNamespace,
  MemoryNamespaceScope,
  MemoryRecord,
  MemorySearchResult,
} from "../core-types.js";
import { requireNodeSqlite } from "../sqlite.js";

type SqliteDatabase = import("node:sqlite").DatabaseSync;

type CreateNamespaceInput = {
  label: string;
  scope: MemoryNamespaceScope;
};

type AddMemoryRecordInput = {
  namespaceId: string;
  kind: string;
  content: string;
  source: string;
};

type ListMemoryRecordParams = {
  namespaceId: string;
  limit?: number;
};

type QueryMemoryRecordParams = {
  namespaceId?: string;
  text: string;
  limit: number;
};

function nowIso(): string {
  return new Date().toISOString();
}

function toNamespace(row: Record<string, unknown>): MemoryNamespace {
  return {
    namespaceId: String(row.namespace_id),
    scope: row.scope as MemoryNamespaceScope,
    label: String(row.label),
    createdAt: String(row.created_at),
  };
}

function toRecord(row: Record<string, unknown>): MemoryRecord {
  return {
    recordId: String(row.record_id),
    namespaceId: String(row.namespace_id),
    kind: String(row.kind),
    content: String(row.content),
    source: String(row.source),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export class MemoryCoreStore {
  private readonly db: SqliteDatabase;

  constructor(private readonly dbPath: string) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    const { DatabaseSync } = requireNodeSqlite();
    this.db = new DatabaseSync(dbPath);
    this.db.exec("PRAGMA journal_mode=WAL;");
    this.db.exec("PRAGMA foreign_keys=ON;");
    this.initSchema();
  }

  close(): void {
    this.db.close();
  }

  getDatabasePath(): string {
    return this.dbPath;
  }

  initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memory_namespaces (
        namespace_id TEXT PRIMARY KEY,
        scope TEXT NOT NULL,
        label TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS memory_records (
        record_id TEXT PRIMARY KEY,
        namespace_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        content TEXT NOT NULL,
        source TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(namespace_id) REFERENCES memory_namespaces(namespace_id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_memory_records_namespace_created
      ON memory_records(namespace_id, created_at DESC);
    `);
  }

  createNamespace(input: CreateNamespaceInput): MemoryNamespace {
    const existing = this.findNamespaceByLabel(input.label);
    if (existing) {
      return existing;
    }
    const namespaceId = randomUUID();
    const createdAt = nowIso();
    this.db
      .prepare(
        `
        INSERT INTO memory_namespaces (namespace_id, scope, label, created_at)
        VALUES (?, ?, ?, ?)
      `,
      )
      .run(namespaceId, input.scope, input.label, createdAt);
    return {
      namespaceId,
      scope: input.scope,
      label: input.label,
      createdAt,
    };
  }

  listNamespaces(): MemoryNamespace[] {
    const rows = this.db
      .prepare(
        `
        SELECT namespace_id, scope, label, created_at
        FROM memory_namespaces
        ORDER BY created_at ASC
      `,
      )
      .all() as Record<string, unknown>[];
    return rows.map(toNamespace);
  }

  findNamespaceByLabel(label: string): MemoryNamespace | null {
    const row = this.db
      .prepare(
        `
        SELECT namespace_id, scope, label, created_at
        FROM memory_namespaces
        WHERE label = ?
        LIMIT 1
      `,
      )
      .get(label) as Record<string, unknown> | undefined;
    return row ? toNamespace(row) : null;
  }

  findNamespaceById(namespaceId: string): MemoryNamespace | null {
    const row = this.db
      .prepare(
        `
        SELECT namespace_id, scope, label, created_at
        FROM memory_namespaces
        WHERE namespace_id = ?
        LIMIT 1
      `,
      )
      .get(namespaceId) as Record<string, unknown> | undefined;
    return row ? toNamespace(row) : null;
  }

  addMemoryRecord(input: AddMemoryRecordInput): MemoryRecord {
    const recordId = randomUUID();
    const timestamp = nowIso();
    this.db
      .prepare(
        `
        INSERT INTO memory_records (
          record_id, namespace_id, kind, content, source, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        recordId,
        input.namespaceId,
        input.kind,
        input.content,
        input.source,
        timestamp,
        timestamp,
      );
    return {
      recordId,
      namespaceId: input.namespaceId,
      kind: input.kind,
      content: input.content,
      source: input.source,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  listMemoryRecords(params: ListMemoryRecordParams): MemoryRecord[] {
    const limit = params.limit ?? 50;
    const rows = this.db
      .prepare(
        `
        SELECT record_id, namespace_id, kind, content, source, created_at, updated_at
        FROM memory_records
        WHERE namespace_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
      )
      .all(params.namespaceId, limit) as Record<string, unknown>[];
    return rows.map(toRecord);
  }

  queryMemoryRecords(params: QueryMemoryRecordParams): MemorySearchResult[] {
    const likeQuery = `%${params.text.toLowerCase()}%`;
    const rows = params.namespaceId
      ? (this.db
          .prepare(
            `
            SELECT record_id, namespace_id, content
            FROM memory_records
            WHERE namespace_id = ?
              AND LOWER(content) LIKE ?
            ORDER BY created_at DESC
            LIMIT ?
          `,
          )
          .all(params.namespaceId, likeQuery, params.limit) as Record<string, unknown>[])
      : (this.db
          .prepare(
            `
            SELECT record_id, namespace_id, content
            FROM memory_records
            WHERE LOWER(content) LIKE ?
            ORDER BY created_at DESC
            LIMIT ?
          `,
          )
          .all(likeQuery, params.limit) as Record<string, unknown>[]);

    return rows.map((row) => ({
      recordId: String(row.record_id),
      namespaceId: String(row.namespace_id),
      content: String(row.content),
      matchReason: "substring_match",
    }));
  }

  deleteMemoryRecord(recordId: string): boolean {
    const result = this.db
      .prepare(
        `
        DELETE FROM memory_records
        WHERE record_id = ?
      `,
      )
      .run(recordId);
    return Number(result.changes ?? 0) > 0;
  }
}

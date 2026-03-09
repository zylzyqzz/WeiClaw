# Memory Core (v2.0.2)

Starting in v2.0.2, long-term memory is a first-class public capability in WeiClaw.

## What is included now

- Persistent memory namespaces.
- Persistent memory records (create/list/query/delete).
- SQLite-based local storage for auditability and backup.
- CLI entrypoints under `openclaw memory ...` / `weiclaw memory ...`.
- A stable runtime hook (`loadMemoryContextForRuntime`) for future agent-runtime integration.

## What is not included yet

- Cross-device memory sync.
- Ownership/claim-aware memory control plane.
- Private commercial hosting logic.

Those higher-level enhancements remain in WeiClaw-Core.


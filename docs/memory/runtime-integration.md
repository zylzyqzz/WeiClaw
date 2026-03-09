# Memory Runtime Integration (v2.0.3)

Starting in v2.0.3, WeiClaw public runtime consumes memory-core in the main execution flow.

## What is integrated

- Read-before-response:
  - Query memory by current user text.
  - Inject a bounded memory context snippet into runtime prompt assembly.
- Controlled runtime capture:
  - Optional auto-capture writes selected facts into memory-core.
  - Capture is policy-driven and disabled by default.
- Runtime status:
  - `memory status` and `memory doctor` show runtime integration flags and health.

## Default behavior

- `WEICLAW_MEMORY_ENABLED=true` keeps public memory-core available.
- `WEICLAW_MEMORY_RUNTIME_ENABLED=false` keeps runtime integration off by default.
- Enabling runtime integration does not require WeiClaw-Core and does not add owner/claim logic.


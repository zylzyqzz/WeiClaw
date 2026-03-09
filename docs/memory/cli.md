# Memory CLI (v2.0.2)

## Commands

```bash
openclaw memory namespace create --label "default" --scope global
openclaw memory namespace list

openclaw memory add --namespace default --kind preference --content "user prefers concise Chinese responses"
openclaw memory list --namespace default
openclaw memory query --namespace default --text concise
openclaw memory delete --record-id <recordId>

openclaw memory status
openclaw memory doctor
```

## Environment Variables

- `WEICLAW_MEMORY_ENABLED` (default: `true`)
- `WEICLAW_MEMORY_DATA_DIR` (default: `<state-dir>/memory-core`)
- `WEICLAW_MEMORY_DB_PATH` (default: `<WEICLAW_MEMORY_DATA_DIR>/memory-core.sqlite`)
- `WEICLAW_MEMORY_DEFAULT_NAMESPACE` (default: `default`)
- `WEICLAW_MEMORY_QUERY_LIMIT` (default: `20`)


# Memory Runtime Integration (v2.0.6)

Starting in v2.0.3, WeiClaw public runtime consumes memory-core in the main execution flow. In v2.0.6, this extends to consume bridge context hints from Core Bridge.

## What is integrated

- Read-before-response:
  - Query memory by current user text.
  - Inject a bounded memory context snippet into runtime prompt assembly.
- Controlled runtime capture:
  - Optional auto-capture writes selected facts into memory-core.
  - Capture is policy-driven and disabled by default.
- Runtime status:
  - `memory status` and `memory doctor` show runtime integration flags and health.

## Bridge Context Integration (v2.0.6)

When Core Bridge is enabled and returns a resolved context:

1. **Namespace hints**: The `namespaceHints` from bridge response are used as optional hints for memory queries
2. **Hint-only behavior**: Hints are suggestions, not mandates — all namespaces are queried
3. **Graceful degradation**: If bridge returns `unclaimed_device`, `claim_required`, or `error`, runtime uses default namespace

### Integration Flow

```
Channel Event → Core Bridge Handoff → Bridge Response
                                        ↓
                          resolutionState=resolved?
                              ↓           ↓
                             Yes          No
                              ↓           ↓
                    Use namespaceHints  Fallback to
                    for memory query   default namespace
```

## Default Behavior

- `WEICLAW_MEMORY_ENABLED=true` keeps public memory-core available.
- `WEICLAW_MEMORY_RUNTIME_ENABLED=false` keeps runtime integration off by default.
- Enabling runtime integration does not require WeiClaw-Core and does not add owner/claim logic.

## Bridge Hints Configuration

Bridge context consumption is enabled when:
- `WEICLAW_CORE_BRIDGE_ENABLED=true`
- `WEICLAW_CORE_BRIDGE_MODE=http`
- `WEICLAW_CORE_BRIDGE_ENDPOINT` is configured

Check with:
```bash
openclaw core-bridge status
```

The `contextConsumptionEnabled` field shows whether bridge hints are being consumed.

## CLI Commands

- `openclaw memory status` - Show memory runtime status
- `openclaw memory doctor` - Run memory runtime checks
- `openclaw core-bridge status` - Show bridge status including context consumption
- `openclaw core-bridge doctor` - Run bridge checks including contract version

---
summary: "WeiClaw v2.0.6 Core Bridge response contract and context consumption."
title: "Core Bridge Response"
---

# Core Bridge Response Contract (v2.0.6)

Starting in v2.0.6, WeiClaw public runtime can consume the resolved context returned from Core Bridge handoff.

## Response Contract Fields

The bridge response includes these stable fields that public WeiClaw can consume:

| Field                 | Type                                                                                      | Description                                           |
| --------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `resolutionState`     | `"resolved"` \| `"unresolved"` \| `"unclaimed_device"` \| `"claim_required"` \| `"error"` | Overall resolution state from Core                    |
| `provisioningSummary` | object \| null                                                                            | Device binding, claim, owner, agent, memory readiness |
| `namespaceHints`      | string[]                                                                                  | Suggested namespace identifiers for memory queries    |
| `ownerRef`            | string \| null                                                                            | Owner reference from Core (for logging only)          |
| `agentRef`            | string \| null                                                                            | Agent reference from Core (for logging only)          |
| `memoryNamespaces`    | string[]                                                                                  | Memory namespace list from Core                       |
| `notes`               | string[]                                                                                  | Observability notes for public logs                   |

## Context Consumption Flow

1. **Handoff**: Runtime calls Core Bridge with normalized channel event
2. **Response**: Bridge returns resolved context with state and hints
3. **Consumption**:
   - If `resolutionState=resolved`: namespace hints are used as memory query hints
   - If `resolutionState=unclaimed_device` or `claim_required`: graceful degradation, notes logged
   - If `resolutionState=error` or bridge failure: fallback to public standalone logic
4. **No injection**: Context is not blindly injected into prompts; only namespace hints influence memory queries

## Namespace Hints Behavior

- **Hint-only**: Bridge namespace hints are treated as suggestions, not mandates
- **Default fallback**: If no hints provided, falls back to default namespace
- **Independent memory**: Public memory-core remains independently usable without Core Bridge

## Logging

The runtime logs these events:

- `handoff attempted`: Bridge handoff initiated
- `bridge response received`: Response received from bridge
- `bridge context consumed`: Context successfully consumed by runtime
- `bridge fallback`: Graceful fallback due to unresolved state or error

## CLI Checks

```bash
openclaw core-bridge status
openclaw core-bridge doctor
```

The status output includes:

- `contractVersion`: "2.0.6"
- `contextConsumptionEnabled`: Whether runtime integration is active
- `supportedResolutionFields`: List of supported fields

## Not Included in Public WeiClaw

- Owner/claim/provisioning logic execution
- Channel identity mapping implementation
- Memory ownership control plane
- Private Core endpoint keys or tokens

# Memory Namespaces (v2.0.2)

WeiClaw memory-core stores records in namespaces:

- `global`: shared long-term memory for the public runtime.
- `agent`: memory reserved for a specific agent context.
- `session`: memory tied to session-oriented flows.
- `custom`: user-defined namespace for explicit workflows.

Each namespace has:

- `namespaceId`
- `scope`
- `label`
- `createdAt`

Records reference a namespace through `namespaceId`.


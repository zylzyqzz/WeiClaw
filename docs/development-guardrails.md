# Development Guardrails

## Required Before Every Change

- Declare the target repo first: `WeiClaw` or `WeiClaw-Core`.
- Decide the ownership of the work before editing code or docs.

## Ownership Decision

Public mainline capability: keep in `WeiClaw`.

Private core capability: move or implement in `WeiClaw-Core`.

## Must Not Be Mixed Into WeiClaw

The following must not be added directly to the public repo:

- Ownership recognition
- Long-term memory enhancement
- Device binding
- Cloud control console backends
- Physical interaction enhancement
- Commercial capabilities

## Allowed To Stay In WeiClaw

- Telegram-first public workflows
- OpenAI-compatible-first public workflows
- TUI
- `setup`, `onboard`, `doctor`
- Skills and automation
- Installers
- Public documentation

## Git Discipline

- Every commit and push must explicitly state the target repo.
- For this public repo, use an explicit remote target such as:

```bash
git push git@github.com:zylzyqzz/WeiClaw.git <branch>
```

## Secret And Path Safety

Never commit any of the following to the public repo:

- Private repo paths
- Private keys
- Tokens
- Production configuration
- Internal-only deployment details

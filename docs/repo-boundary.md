# Repo Boundary

WeiClaw is the public main repository.

WeiClaw-Core is the private core repository.

## Public Repo: WeiClaw

Allowed in the public repo:

- Public install and onboarding flows
- Public CLI, TUI, setup, `onboard`, `doctor`, and installer scripts
- Telegram-first and OpenAI-compatible-first public capabilities
- Public skills, automation, extension hooks, and non-secret docs
- Public examples, tests, and documentation needed to install and use WeiClaw

Not allowed in the public repo:

- Private core code that belongs in WeiClaw-Core
- Ownership recognition, long-term memory enhancement, device binding backends, cloud control backends, physical interaction enhancement, or commercial-only logic
- Private operational docs, internal runbooks, private deployment layouts, or production-only scripts
- Private repo paths, secrets, tokens, keys, certificates, or production configuration

## Private Repo: WeiClaw-Core

WeiClaw-Core should carry:

- Private core capabilities and differentiated logic
- Commercial or operator-only backend code
- Sensitive orchestration, internal control surfaces, and protected deployment assets
- Any implementation that would expose core value if published directly

## Development Rules

- Every future development prompt must declare the target repo first: `WeiClaw` or `WeiClaw-Core`.
- Every future `git push` command must explicitly state the target repository remote.
- Users install `WeiClaw`; they do not install `WeiClaw-Core` directly.
- Repo separation does not mean product separation. The install entry stays unified through WeiClaw.

## Push Target Reminder

For this public repo, always make the push target explicit, for example:

```bash
git push git@github.com:zylzyqzz/WeiClaw.git <branch>
```

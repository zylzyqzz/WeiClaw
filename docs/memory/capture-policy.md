# Memory Capture Policy (v2.0.3)

WeiClaw public runtime auto-capture is intentionally constrained.

## Switches

- `WEICLAW_MEMORY_AUTO_CAPTURE_ENABLED=false` by default.
- Auto-capture runs only when runtime integration is enabled.

## Capture kinds

The current policy captures only limited categories:

- `preference`
- `profile`
- `task-fact`
- `note`

## Rule shape

- Input is derived from current user text and assistant text.
- Candidate lines are filtered by length and simple semantic triggers.
- Duplicate content in the same turn is skipped.
- Maximum captured records per turn is bounded.

## Out of scope

- No cross-device sync.
- No owner/claim mapping.
- No private control-plane logic.

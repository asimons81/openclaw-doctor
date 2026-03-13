# Contributing

OpenClawDoctor+ is intentionally small. Contributions should improve trust, clarity, or release readiness without expanding the tool into a platform.

## Ground Rules

- Keep the CLI local-first and read-only.
- Prefer surgical fixes over large rewrites.
- Do not add dashboards, network integrations, or auto-fix behavior.
- Keep check IDs stable once shipped.
- Update tests and docs when behavior changes.

## Development

```bash
npm install
npm run verify
```

Useful commands:

```bash
npm run dev -- scan tests/fixtures/workspace
npm run test:watch
npm run pack:dry-run
```

## Adding Or Changing Checks

- Put each check in the existing category folders under `src/checks/`.
- Choose severity and confidence conservatively. A noisy check is worse than a missing check.
- Include actionable remediation. If the tool is making a heuristic judgment, say so.
- Add focused unit coverage for the check and only add integration coverage when behavior crosses module boundaries.

## Pull Requests

- Explain the operational problem being fixed.
- Note any behavior changes in CLI output or exit status.
- Include sample output when changing reporters or command UX.
- Update `CHANGELOG.md` for user-visible changes.

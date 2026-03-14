# Contributing to OpenClawDoctor+

Thank you for your interest in improving OpenClawDoctor+.

## Early-Stage Project

OpenClawDoctor+ is currently in **v0.x** — the initial public release. This means:

- The core check set is stable
- APIs and output formats may change between minor versions
- Contributions should focus on improving existing checks rather than adding new ones
- Breaking changes may occur without long deprecation cycles

## Contribution Areas

### Bug Reports
- Use GitHub issues with the `bug` label
- Include reproduction steps, expected vs actual behavior
- Run with `--verbose` and include terminal output

### Check Improvements
- Proposals for new checks should include: check ID, category, description, severity, confidence rationale
- Open an issue first to discuss before submitting PRs

### Documentation
- Improvements to README, CHECK_INVENTORY.md, and inline explanations are welcome
- Ensure changes don't conflict with the read-only design principle

### Proof Artifacts
- Screenshots and terminal captures from real workspace scans are valuable
- Place artifacts in the `artifacts/` directory

## Development Setup

```bash
git clone https://github.com/tonysimons/openclaw-doctor.git
cd openclaw-doctor
npm install
npm run verify    # Run tests and typecheck
npm run build     # Production build
npm run pack:dry-run  # Verify npm pack output
```

## Code Style

- TypeScript strict mode
- Run `npm run verify` before submitting PRs
- Keep changes focused — avoid scope creep

## Design Principles

**Read-only is non-negotiable.** OpenClawDoctor+ detects and reports; it does not modify, fix, or delete anything. PRs that add auto-fix behavior will not be accepted.

## Contact

- Issues: https://github.com/tonysimons/openclaw-doctor/issues
- For significant proposals, open an issue first to discuss direction

---

*This is an early-stage tool. Contributions should prioritize trust, clarity, and operational reliability over feature expansion.*

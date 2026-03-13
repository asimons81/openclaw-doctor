# Changelog

All notable changes to this project will be documented in this file.

## [0.1.3] - 2026-03-13

- Banner polish: updated header spacing and added color styling for terminal output.

## [0.1.2] - 2026-03-13

- Small banner polish: fixed typo in rotating diagnostic line.

## [0.1.1] - 2026-03-13

- Small calibration/messaging patch release.
- Improved LOG-003 remediation text to clarify that external dependency failures (e.g., ComfyUI, APIs) are often transient and may not require fixes.
- Improved AGT-001 remediation text with agent-specific guidance explaining why some agents (main, sentinel, spark) use different output paths.
- Improved LOG-005 remediation text to note that some warnings may be legacy checks while keeping severity as warn.

## [0.1.0] - 2026-03-13

- Initial public release of OpenClawDoctor+.
- 25 diagnostic checks across 6 categories (agents, config, cron, logs, memory, workspace).
- Terminal, JSON, and Markdown output formats.
- Commands: `scan`, `list-checks`, `explain`.
- Available on GitHub and npm.

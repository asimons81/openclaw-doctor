# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2026-03-13

- Improved LOG-003 remediation text to clarify that external dependency failures (e.g., ComfyUI, APIs) are often transient and may not require fixes.
- Improved AGT-001 remediation text with agent-specific guidance explaining why some agents (main, sentinel, spark) use different output paths.
- Improved LOG-005 remediation text to note that some warnings may be legacy checks (e.g., deprecated iCloud paths) and not indicate actual problems.

## [0.1.0] - 2026-03-13

- Hardened CLI help text, option validation, and user-facing error wording.
- Improved terminal, JSON, and Markdown scan output for scripting and issue-thread sharing.
- Recalibrated wording and confidence for `LOG-005` and `AGT-001` to reduce false-positive distrust.
- Added contributor docs, editor config, issue template, PR template, and npm publish hygiene scripts.
- Added focused tests around reporters, option parsing, and CLI behavior.

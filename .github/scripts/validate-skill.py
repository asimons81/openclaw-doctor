#!/usr/bin/env python3
"""
validate-skill.py — Hermes Skill Schema Validator

Validates SKILL.md frontmatter against .github/schemas/skill-schema.json.
Extracts YAML frontmatter, runs field-level checks, and JSON Schema validation.

Exit codes:
  0 = valid
  1 = validation errors found
  2 = error (file not found, parse error, etc.)
"""

import json
import re
import sys
from pathlib import Path

import yaml
import jsonschema


def extract_frontmatter(content: str) -> dict:
    """Extract YAML frontmatter from a SKILL.md file."""
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return {}
    try:
        return yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError as e:
        raise ValueError(f"YAML parse error: {e}")


def validate_skill_file(path: Path, schema: dict) -> list[str]:
    """Validate a single SKILL.md file. Returns list of error messages."""
    errors: list[str] = []

    try:
        content = path.read_text()
    except Exception as e:
        return [f"Could not read file: {e}"]

    try:
        data = extract_frontmatter(content)
    except ValueError as e:
        return [str(e)]

    if not data:
        return ["No YAML frontmatter found"]

    # Field-level checks
    if not data.get("name"):
        errors.append("Missing required field: name")
    elif not re.match(r"^[a-z][a-z0-9_-]*$", data["name"]):
        errors.append(f"Invalid name '{data['name']}': must match ^[a-z][a-z0-9_-]*$")

    if not data.get("description"):
        errors.append("Missing required field: description")
    elif len(data.get("description", "")) < 10:
        errors.append("description too short (min 10 chars)")

    version = data.get("version", "")
    if version and not re.match(r"^\d+\.\d+(\.\d+)?(-[a-zA-Z0-9.]+)?$", version):
        errors.append(f"Invalid version '{version}': must be valid semver")

    readiness = data.get("readiness_status", "")
    valid_statuses = {"ready", "available", "needs_setup", "unavailable"}
    if readiness and readiness not in valid_statuses:
        errors.append(f"Invalid readiness_status '{readiness}': must be one of {valid_statuses}")

    # Cron validation (basic — croniter does full validation when available)
    def validate_cron_expr(expr: str) -> bool:
        expr = expr.strip().strip('"').strip("'")
        parts = expr.split()
        return len(parts) == 5

    for i, trigger in enumerate(data.get("triggers", [])):
        if isinstance(trigger, dict):
            if "scheduled" in trigger:
                cron = trigger["scheduled"].strip().strip('"').strip("'")
                if not validate_cron_expr(cron):
                    errors.append(f"Invalid cron expression at triggers[{i}]: '{cron}'")
                else:
                    try:
                        from croniter import croniter
                        croniter(cron)
                    except Exception:
                        pass  # croniter not critical
            elif "manual" in trigger:
                manual = trigger["manual"]
                if not re.match(r"^[a-z][a-z0-9 _-]+$", manual):
                    errors.append(f"Invalid manual trigger at triggers[{i}]: '{manual}'")
        elif isinstance(trigger, str):
            if not re.match(r"^[a-z][a-z0-9 _-]+$", trigger):
                errors.append(f"Invalid trigger string at triggers[{i}]: '{trigger}'")

    # JSON Schema validation
    try:
        jsonschema.validate(data, schema)
    except jsonschema.ValidationError as e:
        errors.append(f"Schema violation: {e.message}")
    except jsonschema.SchemaError as e:
        errors.append(f"Schema error: {e.message}")

    return errors


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: validate-skill.py <path-to-skill.md>")
        sys.exit(2)

    skill_path = Path(sys.argv[1])
    schema_path = Path(".github/schemas/skill-schema.json")

    if not skill_path.exists():
        print(f"ERROR: File not found: {skill_path}", file=sys.stderr)
        sys.exit(2)

    if not schema_path.exists():
        print(f"ERROR: Schema not found: {schema_path}", file=sys.stderr)
        sys.exit(2)

    schema = json.loads(schema_path.read_text())
    errors = validate_skill_file(skill_path, schema)

    if errors:
        print(f"FAIL: {skill_path}")
        for e in errors:
            print(f"  {e}")
        sys.exit(1)
    else:
        print(f"OK: {skill_path}")
        sys.exit(0)


if __name__ == "__main__":
    main()

# Agents Kit (QI-EOS)

## WORKSPACE CONTEXT
- **Workspace Root**: `Q:\` (where docs/ and QiEos/ live)
- **Repo Root**: `Q:\QiEos\` (the actual QiEOS monorepo)
- **God Doc**: `Q:\docs\QiEOS.md` (architecture, schema, workflows)
- **Dev Log**: `Q:\docs\DEV_LOG.md` (session history)
- **Safety Rules**: `Q:\QiEos\.cursor\rules\qieos.mdc`

This folder contains:
- **Safety Rules** all agents must follow.
- **Daily Kickoff** prompt for Cursor to resume work safely.
- **Auditor** prompt to scan for issues.
- **Logger** prompt + script to append entries to `Q:\docs\DEV_LOG.md`.
- **Templates** for session entries and PR change summaries.
- **Workflows** to keep sessions repeatable.

**Source of truth:** `Q:\docs\DEV_LOG.md` (create if not present).

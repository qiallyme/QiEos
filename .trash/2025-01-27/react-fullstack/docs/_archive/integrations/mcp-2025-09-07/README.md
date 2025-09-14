# MCP / ElevenLabs Integration (Archived)

This folder contains an archival snapshot of experimental integrations related to ElevenLabs Convai widget and MCP (Model Context Protocol), preserved for reference.

## What was archived
- ElevenLabs Convai widget injection in Starlight docs (`starlight/astro.config.mjs`, `starlight/src/components/ConvaiWidget.astro`).
- React Support page custom element usage (`QiSuite-Access/src/pages/Support.tsx`).

## Why archived
- Voice Agent now uses public KB URLs directly, so custom wiring and SDK-level integrations are unnecessary.

## How to re-enable later
- Restore the files to their original paths.
- Reintroduce any env keys if needed (e.g., `PUBLIC_ELEVENLABS_AGENT_ID`).
- Rebuild and redeploy.

Note: “Voice Agent now uses public KB URLs directly.”

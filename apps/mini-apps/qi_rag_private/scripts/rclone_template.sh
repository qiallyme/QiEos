#!/usr/bin/env bash
# Example rclone sync script for the tiered RAG stack.
#
# This script demonstrates how you could synchronise UNCLASS and CLASSIFIED
# documents and snapshots to an encrypted remote (e.g. Google Drive).  It
# assumes you have configured encrypted remotes named `unclass_crypt` and
# `classified_crypt` via `rclone config`.  See the README for details.

set -euo pipefail

# Location of your data and snapshot folders.  Adjust to match your DATA_ROOT
DATA_ROOT="${DATA_ROOT:-./data}"
SNAPSHOT_ROOT="${SNAPSHOT_ROOT:-./snapshots}"

echo "Syncing UNCLASS documents…"
rclone sync "$DATA_ROOT/unclass" unclass_crypt:data
echo "Syncing UNCLASS snapshots…"
rclone sync "$SNAPSHOT_ROOT/q_unclass" unclass_crypt:snapshots

echo "Syncing CLASSIFIED documents…"
rclone sync "$DATA_ROOT/classified" classified_crypt:data
echo "Syncing CLASSIFIED snapshots…"
rclone sync "$SNAPSHOT_ROOT/q_classified" classified_crypt:snapshots

echo "Sync complete.  ULTRA and MEO tiers are intentionally excluded."
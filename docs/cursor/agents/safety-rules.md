# Safety Rules

## WORKSPACE CONTEXT
- **Workspace Root**: `Q:\` (where docs/ and QiEos/ live)
- **Repo Root**: `Q:\QiEos\` (the actual QiEOS monorepo)
- **God Doc**: `Q:\docs\QiEOS.md` (architecture, schema, workflows)
- **Dev Log**: `Q:\docs\DEV_LOG.md` (session history)
- **Safety Rules**: `Q:\QiEos\.cursor\rules\qieos.mdc`

These rules govern all human and Cursor edits to the QiEOS repo.  
They exist to preserve constitutional integrity and prevent accidental damage.

---

## 🔒 Lock Mechanisms

1. **Folder Locks**  
   - If `LOCKED.md` or `locked.md` exists in a folder, that folder is *constitutionally locked*.  
   - Any edits inside must be explicitly approved via RFC (QiEOS God Doc §12.2).  
   - Cursor agents must abort without explicit approval.

2. **File Locks**  
   - If the first line of a file contains a lock marker, that file is locked:  
     - Example (TypeScript/JS):  
       ```ts
       // 🚫 LOCKED — Do not edit without RFC approval (QiEOS God Doc §12.2)
       ```  
     - Example (SQL):  
       ```sql
       -- 🚫 LOCKED — Do not edit without RFC approval (QiEOS God Doc §12.2)
       ```  
     - Example (TOML):
       ```toml
       # 🚫 LOCKED — Do not edit without RFC approval (QiEOS God Doc §12.2)
       ```
   - Cursor agents must abort edits to locked files unless given explicit approval.

3. **Section Locks (Surgical)**
    - Lock just a region using start/end markers. Nothing inside may be edited; everything outside is free.
    - Markers (language-agnostic text; use the comment style of the file):
        - LOCK START: LOCK-START: <reason|ticket|RFC>
        - LOCK END: LOCK-END
    
    - Examples
        TypeScript/JS:
            ```
            // 🔒 LOCK-START: RLS policy generator — RFC-2025-09-13
            export const rlsPolicy = `...`
            // 🔓 LOCK-END
            ```
        SQL:
            ```
            -- 🔒 LOCK-START: canonical tables — RFC-2025-09-13
            create table if not exists orgs (...);
            -- 🔓 LOCK-END
            ```
        TOML:
            ```
            # 🔒 LOCK-START: wrangler bindings schema
            [vars]
            # ...
            # 🔓 LOCK-END
            ```
    - Enforcement rule:
        - Any code between a LOCK-START line and the next LOCK-END line is locked. Tools must abort edits in that span unless the maintaier  grants explicit approval.
    - Notes
        Nesting is not allowed (simplifies enforcement).
    If a LOCK-START has no matching LOCK-END, treat the lock as running to EOF.
---

## ⚖️ Editing Principles

1. **Explicit Approval Required**  
   - All Cursor-initiated edits require explicit approval from the maintainer.  
   - Agents must print planned diffs, wait for confirmation, then apply.

2. **No Deletions**  
   - Nothing is ever hard-deleted.  
   - Move removed files to `Q:\QiEos\.trash/YYYY-MM-DD/…` for historical traceability.

3. **Smallest Diffs**  
   - Prefer surgical, minimal changes over broad refactors.  
   - Break large changes into multiple small, reviewable steps.

4. **Traceability**  
   - Every applied change updates `Q:\docs\DEV_LOG.md` with:  
     - What was changed  
     - Why it was changed  
     - How it was changed  
     - Rollback instructions

5. **Secrets Management**  
   - Never commit secrets or env values.  
   - Use `.env*` files (ignored by Git) and CI/CD environment variables.

6. **Reversibility**  
   - Every PR or commit must include rollback notes in case the change must be undone.

7. **Respect Structure**  
   - Do not move or rename files without explaining downstream impacts in `Q:\docs\DEV_LOG.md`.  
   - Structural changes (folders, package names, migrations) require an RFC.

8. **Open Questions**  
   - If unsure, stop work.  
   - Log an open question in `Q:\docs\DEV_LOG.md` under the **"Open Questions"** section for discussion.

---

## ✅ Summary

- **Locked folder?** → Abort unless explicit RFC approval.  
- **Locked file line?** → Abort unless explicit RFC approval.  
- **All other changes?** → Print diffs, wait for explicit approval, log in devlog.  
- **Never delete, always trace, always reversible.**

# CLAUDE.md

Project-specific instructions for Claude Code sessions working in this repo (LAB QUEST / rinchi-practicum).

## UI change review (mandatory)

Whenever a change affects what a student or staff member actually sees on screen — new layout, resized/restyled elements, a new component, copy edits that shift visual balance, etc. — do the following **before** treating the change as done:

1. Get the changed screen into the right state in the Browser pane (dev server via `mcp__Claude_Browser__preview_start` with the `lab-quest-dev` launch config, navigate/click to the exact screen).
2. Invoke the `game-ui-ux-reviewer` subagent (`Agent` tool, `subagent_type: "game-ui-ux-reviewer"`) and tell it exactly how to reach the screen (URL + any clicks/state needed), or that the Browser pane's current tab is already showing it. It takes its own screenshot — don't just describe the change to it in text.
3. Read its `VERDICT`. On `FAIL`, fix the listed issues and re-review. Only report the change as finished to the user once it's a `PASS` (minor/optional notes from a pass don't need to block, but mention them if worth a follow-up).

Skip this for changes with no visual surface (pure backend/SQL/types/docs-only edits).

This does not replace the existing `<when_to_verify>`/`<verification_workflow>` functional check (console errors, network requests, clicking through the flow) — do both. The functional check confirms it *works*; the reviewer subagent checks it *looks and reads right* for this app's fantasy-quest visual language.

## Curriculum content review (mandatory)

Whenever a new or substantially rewritten unit's content (dialogue/lecture/investigate/resolve/drill text — anything authored via `content/series/*.mjs` and `scripts/push-series.mjs`, per `docs/unit-content-template.md`) is ready — do the following **before** treating the content as done:

1. Invoke the `clinical-content-reviewer` subagent (`Agent` tool, `subagent_type: "clinical-content-reviewer"`) and point it at the `content/series/<stageId>.mjs` file (and the relevant `docs/ラボクエスト骨子案.md` section if scope-fit is in question).
2. Read its `VERDICT`. On `FAIL`, fix the listed issues and re-review. Only report the content as finished once it's a `PASS`.

This checks clinical accuracy and 国家試験出題範囲 fit (core beats should stay in-scope; deeper/edge-case material belongs in 発展/drill, not in the mandatory beats) — a different axis from the UI review above. Run both when a new series' first unit goes out: content review for what it says, UI review (once real content is in the actual screens) for how it looks. Skip content review for copy-only cosmetic tweaks that don't touch a clinical claim.

## Known environment quirks

- **`mcp__Claude_Browser__computer` click by `ref` is sometimes unreliable** (clicks land on stale/wrong coordinates after a re-render). If a click via `ref` doesn't visibly change state, retry via `mcp__Claude_Browser__javascript_tool` dispatching a real `.click()` on the matching DOM element (read-only for inspection, this is just a more reliable click, not implementing anything).
- **`VITE_BACKEND_MODE=supabase`**: curriculum (stages/units/beats) is read from the live Supabase project via the `get_curriculum` RPC, not from `src/mocks/*.ts`. Editing mock files doesn't affect the running app; use the staff content editor (`/staff/content/...`, full-permission login) or a direct DB update instead.
- **TRAIN01/TRAIN02 are the project owner's own real accounts — never touch them for testing.** For anything that needs a logged-in student, create a throwaway test student via the staff admin UI and delete it (and its data cascades) via the `students` table when done. New students can only log in within the *same* client-side session they were created in (`AppState.tsx`'s `students` array is a static/session-local list, not re-fetched from the server) — do the create→login test without a hard page navigation in between, using in-page link/button clicks instead of the `navigate` tool.
- **Browser pane `screenshot` can fail with "pane is not displayed"** if the pane isn't visibly open on the user's side. Fall back to `get_page_text`/`read_page`/`javascript_exec` for verification when that happens; retry `screenshot` for the actual review step since the reviewer subagent needs a real image.

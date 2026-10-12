# AI Contract

> This file is written **for the AI**, not for humans. Paste it (or its link)
> at the start of a session. It defines the workflow from first message to done.

## 1. Your task

Help improve **Quilldown**, a host-agnostic Markdown editor library.
Work in two stages: **verify in HTML first, write TypeScript only after the user approves.**

## 2. Assets

- `examples/wysiwyg.html`, `examples/split.html` — runnable pages that load the
  **published** build from a CDN (`unpkg.com/@xmsbl/quilldown-*`).
- In Stage 1 these HTML files are the **only** files you touch.

## 3. Rules

1. **The library owns behavior.** In HTML, write nothing but the `create()` call
   and the required DOM. Never re-implement a library feature in page JS — that
   work cannot land in the library.
2. **Two stages.** Until the user says "verified", output **HTML only** — no TypeScript.
3. **Keep a Change List** (§5), one row per verified change.
4. **No guessing.** §6 lists what you can and cannot verify.

## 4. Protocol

### Stage 1 — HTML verification (repeatable)

Trigger: user describes a desired change.
Output — use exactly this shape:

    ### Change <n>: <title>
    <full HTML, or a diff if the user asks for one>
    Verify: <one sentence — what to look at>

Then stop and wait for the verdict.

- Not happy → revise the HTML, same shape.
- Happy → append a row to the Change List. Stop.

### Stage 2 — TypeScript (once)

Trigger: user says "all verified, give me the TS".
Output — for **each** Change List row, in order:

    ### Change <n>: <title>
    Files: packages/<pkg>/src/<file>.ts
    <TS diff>

If the Change List has more than **5** rows, split Stage 2 into batches of ≤ 5
and tell the user which batch you are sending.

## 5. Change List

Maintain this table. One row per verified change.

| #   | Desired behavior | Verified HTML change |
| --- | ---------------- | -------------------- |
| 1   |                  |                      |

## 6. What you can and cannot verify

| Can verify                                                     | Cannot verify                                                                                      |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Usage, glue, styling, interaction built on the **current** API | New library features — the CDN build is the **published** version, so unreleased code is not there |

If a desired behavior needs a library change, say so explicitly. Do not fake it in HTML.

## 7. Source code (Stage 2)

The repo is public: <https://github.com/xmsbl/quilldown>. Read these before writing TS:

- `packages/core/src/types.ts` — public API (`EditorOptions`, `EditorInstance`)
- `packages/core/src/render.ts` — the single md→html pipeline
- `packages/wysiwyg/src/create.ts`, `packages/split/src/create.ts`
- `docs/CONTRACT.md` — the frozen contract

If you cannot open the repo, ask the user to paste the relevant files.

## 8. Loop

1. You edit `examples/*.html` → user verifies visually.
2. Repeat Stage 1 until the user is satisfied.
3. User says "give me the TS" → you output TS per the Change List.
4. User builds and tests locally (`npm run ci`), then commits or publishes.
5. Published → CDN updates → the examples reflect the new version automatically.

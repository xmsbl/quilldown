# Quilldown Contract v2

> Frozen contract: **what the library implements** + **what the host provides**.
> The library exports `CONTRACT_VERSION = "2"`. Bump it only on breaking changes;
> npm package versions are independent (see §5).

## 1. Hard rules

- `@xmsbl/quilldown-render` is the **only** place that produces HTML (marked GFM + Prism +
  sanitizer + heading ids + line anchors). `core` re-exports it, so host code keeps importing
  `renderHtml` from `@xmsbl/quilldown-core`. Editor packages produce markdown; both editors'
  HTML is byte-identical by construction (they call the same function object).
- The library assumes nothing about the host — no server template, CSS framework, or global
  state. It needs three things: a **mount element**, **markdown in/out**, and an **upload callback**.
- Library styles are scoped to the mount: content styling under `.ew-content` / `--ew-*`, editor
  chrome under `--qd-*`. The library reads no host config.
- The library persists nothing (drafts, unsaved-change guards and submit interception belong to
  the host). It exposes state via `isDirty()` and events.

## 2. API

```ts
type UploadFn = (file: File) => Promise<{ url: string; name?: string }>;

interface EditorOptions {
  value?: string;
  locale?: string; // 'en' | 'zh' | …
  strings?: Record<string, string>;
  placeholder?: string;
  autofocus?: boolean;
  upload?: UploadFn;
  renderHtml?: (md: string) => string; // default: the shared pipeline
  onChange?: (md: string, html: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  tocDefault?: boolean;
  focusDefault?: boolean;
  mirror?: boolean | FormBindOptions; // form adapter (§4); default off
}

interface EditorInstance {
  getMarkdown(): string;
  getHtml(): string;
  setMarkdown(md: string, opts?: { silent?: boolean }): void;
  isDirty(): boolean;
  focus(): void;
  destroy(): void;
}

create(mount: HTMLElement, opts?: EditorOptions): EditorInstance;
```

- ESM: `import { create } from "@xmsbl/quilldown-wysiwyg"`.
- IIFE: one global per package — `window.QuilldownRender` / `window.QuilldownCore` /
  `window.QuilldownWysiwyg` / `window.QuilldownSplit`. `core` / `split` / `wysiwyg` take the
  pipeline from the global, so **load `render.iife.js` first**.
- Styles are separate entries: `@xmsbl/quilldown-wysiwyg/index.css` /
  `@xmsbl/quilldown-split/index.css` (editor chrome + content), and
  `@xmsbl/quilldown-render/content.css` (content only — what a read-only host needs). The library
  injects no CSS at runtime.
- `locale` is **runtime** (`"en"` default / `"zh"`; unknown values fall back to `en`). One IIFE
  build covers every locale — there are no per-locale artifacts. `strings` overrides individual
  entries.

## 3. DOM contract

| Marker                      | Meaning                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `[data-editor-mount]`       | Mount element (the editor goes in here).                                            |
| `[data-editor-md]`          | Markdown source field (optional; used by the form adapter only).                    |
| `[data-editor-html]`        | HTML output field (optional; used by the form adapter only).                        |
| `[data-editor-toc]`         | Floating outline container.                                                         |
| `data-editor-default-toc`   | Default switch (`1` / `0`).                                                         |
| `data-editor-default-focus` | Default switch (`1` / `0`).                                                         |
| `[data-editor-root]`        | Optional scope root for the default switches and the TOC; default = mount's parent. |

The library uses attributes and `name` only; it does not depend on any `id`.

## 4. Form adapter (optional convenience)

- Writes the editor's current md / html into two fields of a host form — for traditional forms.
- **Off by default.** Enable with `mirror: true` (auto-find) or `mirror: {...}` (explicit). core also
  exports `bindForm(editor, mount, opts)` and the selector constants `FORM_SELECTOR` /
  `MD_FIELD_SELECTOR` / `HTML_FIELD_SELECTOR`.
- Lookup: form = nearest `<form>` above the mount; md field = `[data-editor-md]`; html field =
  `[data-editor-html]`. Missing form, or missing both fields → disabled (returns `null`, no error).
- On bind it writes once; on `submit` (capture phase) it refreshes (so a debounced change is not
  lost); an `input` on the md field re-feeds the editor (`setMarkdown(v, { silent: true })`).
- One editor instance per page.

## 5. Versions

- The version lives in two places: `docs/CONTRACT.md` header + `CONTRACT_VERSION`. Change both.
- npm package versions follow semver independently (from `0.x`); the contract version bumps only on
  breaking changes.
- Contract changes must land in a commit.

## 6. Output shape (`renderHtml`)

- GFM on, `breaks` off (tables, strikethrough, task lists, autolinks; a single newline does not break).
- Raw HTML is **sanitised** against an allow-list (`<script>` / `<iframe>` / event handlers /
  `javascript:` URLs are always dropped — a denied tag takes its subtree with it); allow-listed
  tags survive as real elements.
- Headings get anchors: `<h2 id="…">`; id = lowercased, punctuation stripped, spaces → `-`,
  Unicode letters kept; duplicates get `-1` / `-2`.
- Code blocks: `<pre><code class="language-<lang>">…</code></pre>`; with Prism spans when the
  language is recognized, and **exactly one trailing newline** inside `<code>`. Host CSS targets
  `pre > code` + `.token`.
- Task lists: `ul.contains-task-list` / `li.task-list-item[data-task="done|todo"]` with
  **interactive** (non-`disabled`) checkboxes.
- Languages (13): `markup` `css` `clike` `javascript` `typescript` `json` `bash` `python` `sql`
  `csharp` `yaml` `markdown` `diff` (aliases registered by Prism).
- `marked` / `prismjs` are bundled into the **render** package's build; Prism is hooked to
  `globalThis.Prism` with `manual = true` — it never scans the host DOM.
- The pipeline ships no CSS of its own, but the library ships **content styling** — including the
  Prism token palette (`--ew-tok-*`) — as `@xmsbl/quilldown-render/content.css`. The editor
  packages inline the same file (`wysiwyg`/`index.css`, `split`/`index.css`). Hosts override colors
  via `--ew-*` / `--ew-tok-*`; do **not** ship a competing `.token` stylesheet in a layer below
  `content` — it is silently overridden.
- `renderDocument(md, options)` → `{ html, anchors }`: the same HTML as `renderHtml`, plus each
  top-level block's source line range.

# Quilldown

Host-agnostic Markdown editors sharing one render pipeline.

[中文](./README.zh-CN.md)

Two editors, one contract:

| Package                    | Published | Role                                                         |
| -------------------------- | --------- | ------------------------------------------------------------ |
| `@xmsbl/quilldown-render`  | ✅        | The single md→html pipeline (marked GFM + Prism + sanitize). |
| `@xmsbl/quilldown-core`    | ✅        | Contract constants + form binding; re-exports the pipeline.  |
| `@xmsbl/quilldown-wysiwyg` | ✅        | WYSIWYG editor (contenteditable).                            |
| `@xmsbl/quilldown-split`   | ✅        | Split editor (source + preview, scroll-synced).              |

`@xmsbl/quilldown-edodo` is the internal WYSIWYG engine (a fork of `edodo-write`, MIT) — install `wysiwyg`, not this.

The library assumes nothing about the host — no server template, CSS framework, or global state.
It needs three things: a mount element, markdown in/out, and an upload callback.

## Which editor?

|            | `split`                                                       | `wysiwyg`                                                                                              |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Editing    | markdown source + live preview, scroll-synced                 | the rendered page itself (contenteditable)                                                             |
| Great for  | developers; AI-written posts; pasting code                    | non-technical authors; short posts                                                                     |
| Upside     | markdown is exactly what you type — nothing rewrites it; tiny | no syntax to learn; toolbar, shortcuts, TOC, placeholders, zh-CN built in                              |
| Downside   | needs horizontal width; the two panes sync only approximately | pasted HTML is normalized by the schema (deep nesting may be rewritten); host CSS leaks in more easily |
| JS (gzip)  | **≈69 kB** — split 5.2 + core 0.6 + render 62.9               | **≈110 kB** — wysiwyg 46.5 + core 0.6 + render 62.9                                                    |
| CSS (gzip) | 5.2 kB                                                        | 9.7 kB                                                                                                 |

Both editors share `render`, so a host using both pays the pipeline once. The numbers are the `<script>`-tag path, measured on the built artifacts (`gzip -9`); with a bundler the pipeline is deduped and tree-shaken by your own bundler (`render`'s ESM entry alone is 7.3 kB, deps external).

## Install

```bash
npm i @xmsbl/quilldown-wysiwyg   # or @xmsbl/quilldown-split / @xmsbl/quilldown-core
```

```ts
import { create } from "@xmsbl/quilldown-wysiwyg";
import "@xmsbl/quilldown-wysiwyg/index.css";

const editor = create(document.querySelector("#editor")!, {
  value: "# hello",
  onChange: (md, html) => {
    /* your state, your save */
  },
  upload: (file) => uploadToMyServer(file),
});

editor.getMarkdown(); // source of truth
editor.getHtml(); // rendered HTML (= core.renderHtml(md))
```

IIFE (no bundler):

```html
<script src="https://unpkg.com/@xmsbl/quilldown-render/dist/index.iife.js"></script>
<script src="https://unpkg.com/@xmsbl/quilldown-core/dist/index.iife.js"></script>
<script src="https://unpkg.com/@xmsbl/quilldown-wysiwyg/dist/index.iife.js"></script>
```

Globals: `window.QuilldownRender` / `window.QuilldownCore` / `window.QuilldownWysiwyg` / `window.QuilldownSplit`.
**Load `render` first** — the other bundles read it at startup instead of carrying their own copy.

## Develop

```bash
npm ci
npm run ci   # lint + format:check + build + typecheck + test + lint:pkg
```

## Docs

- [`docs/CONTRACT.md`](./docs/CONTRACT.md) — the frozen contract.
- [`examples/`](./examples) — runnable pages + AI workflow.

## License

MIT. `@xmsbl/quilldown-edodo` (the engine behind `wysiwyg`) is a fork of [edodo-write](https://www.npmjs.com/package/edodo-write) (MIT); see `packages/edodo/UPSTREAM.md`.

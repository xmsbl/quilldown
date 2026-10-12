# Quilldown

Host-agnostic Markdown editors sharing one render pipeline.

[中文](./README.zh-CN.md)

Two editors, one contract:

| Package                    | Published | Role                                                                   |
| -------------------------- | --------- | ---------------------------------------------------------------------- |
| `@xmsbl/quilldown-core`    | ✅        | Contract constants + the single md→html pipeline (marked GFM + Prism). |
| `@xmsbl/quilldown-wysiwyg` | ✅        | WYSIWYG editor (contenteditable).                                      |
| `@xmsbl/quilldown-split`   | ✅        | Split editor (source + preview, scroll-synced).                        |

The library assumes nothing about the host — no server template, CSS framework, or global state.
It needs three things: a mount element, markdown in/out, and an upload callback.

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

Globals: `window.QuilldownCore` / `window.QuilldownWysiwyg` / `window.QuilldownSplit`.

## Develop

```bash
npm ci
npm run ci   # lint + format:check + build + typecheck + test + lint:pkg
```

## Docs

- [`docs/CONTRACT.md`](./docs/CONTRACT.md) — the frozen contract.
- [`examples/`](./examples) — runnable pages + AI workflow.

## License

MIT. `@xmsbl/quilldown-wysiwyg` is based on [edodo-write](https://www.npmjs.com/package/edodo-write) (MIT).

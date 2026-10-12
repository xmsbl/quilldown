# @xmsbl/quilldown-core

Contract constants and form binding for [Quilldown](https://github.com/xmsbl/quilldown). It re-exports the render pipeline from `@xmsbl/quilldown-render`, so both editors produce byte-identical HTML — `core.renderHtml === render.renderHtml` (the same function object, by construction).

```ts
import { CONTRACT_VERSION, bindForm, renderHtml } from "@xmsbl/quilldown-core";
```

Exports: `CONTRACT_VERSION` · `FORM_SELECTOR` / `MD_FIELD_SELECTOR` / `HTML_FIELD_SELECTOR` · `bindForm` · `renderHtml` / `renderDocument` · `PRISM_LANGUAGES` / `prismGrammar`.

`<script>`: `dist/index.iife.js` exposes `window.QuilldownCore`. See the [root README](https://github.com/xmsbl/quilldown#readme).

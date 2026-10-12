# @xmsbl/quilldown-render

The single Markdown → HTML pipeline behind [Quilldown](https://github.com/xmsbl/quilldown): marked (GFM) + Prism highlighting, heading ids, line anchors, and an allow-list sanitizer.

```ts
import { renderHtml } from "@xmsbl/quilldown-render";

renderHtml("# hello\n\n**bold**");
// → <h1 id="hello">hello</h1>\n<p><strong>bold</strong></p>\n
```

- `<script>`: `dist/index.iife.js` exposes `window.QuilldownRender` — load it **before** the editor bundles.
- Typography: `@xmsbl/quilldown-render/content.css`.

Hosts usually install an editor package instead — `@xmsbl/quilldown-split` / `@xmsbl/quilldown-wysiwyg` already include this. See the [root README](https://github.com/xmsbl/quilldown#readme).

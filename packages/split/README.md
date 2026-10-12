# @xmsbl/quilldown-split

Split Markdown editor for [Quilldown](https://github.com/xmsbl/quilldown): markdown source + live preview, scroll-synced. The markdown you type is the source of truth — nothing rewrites it.

```ts
import { create } from "@xmsbl/quilldown-split";
import "@xmsbl/quilldown-split/index.css";

const editor = create(document.querySelector("#editor")!, {
  value: "# hello",
  onChange: (md, html) => {
    /* your state, your save */
  },
  upload: (file) => uploadToMyServer(file),
});

editor.getMarkdown(); // source of truth
editor.getHtml(); // rendered HTML
```

`<script>`: load `render` → `core` → `split` (`window.QuilldownSplit`). Sizes and a comparison against the WYSIWYG editor: [root README](https://github.com/xmsbl/quilldown#readme).

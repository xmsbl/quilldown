# @xmsbl/quilldown-wysiwyg

WYSIWYG Markdown editor (contenteditable) for [Quilldown](https://github.com/xmsbl/quilldown). Authors edit the rendered page directly; a toolbar, shortcuts, a table of contents, placeholder text, and a built-in zh-CN UI (`locale: "zh-CN"`) come with it.

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
editor.getHtml(); // rendered HTML
```

`<script>`: load `render` → `core` → `wysiwyg` (`window.QuilldownWysiwyg`). Sizes and a comparison against the split editor: [root README](https://github.com/xmsbl/quilldown#readme).

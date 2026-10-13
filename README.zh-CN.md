# Quilldown

宿主无关的 Markdown 编辑器，共用同一条渲染管线。

[English](./README.md)

两款编辑器，一份契约：

| 包                         | 发布 | 作用                                                   |
| -------------------------- | ---- | ------------------------------------------------------ |
| `@xmsbl/quilldown-core`    | ✅   | 契约常量 + 唯一的 md→html 管线（marked GFM + Prism）。 |
| `@xmsbl/quilldown-wysiwyg` | ✅   | 所见即所得编辑器（contenteditable）。                  |
| `@xmsbl/quilldown-split`   | ✅   | 分屏编辑器（源码 + 预览，滚动同步）。                  |

库不假设宿主：不认任何服务端模板 / CSS 框架 / 全局状态。
它只要三样：一个挂载元素、markdown 进出、一个上传回调。

## 安装

```bash
npm i @xmsbl/quilldown-wysiwyg   # 或 @xmsbl/quilldown-split / @xmsbl/quilldown-core
```

```ts
import { create } from "@xmsbl/quilldown-wysiwyg";
import "@xmsbl/quilldown-wysiwyg/index.css";

const editor = create(document.querySelector("#editor")!, {
  value: "# hello",
  onChange: (md, html) => {
    /* 你的状态、你的保存 */
  },
  upload: (file) => uploadToMyServer(file),
});

editor.getMarkdown(); // 真相源
editor.getHtml(); // 落库 HTML（= core.renderHtml(md)）
```

不走打包器（IIFE）：

```html
<script src="https://unpkg.com/@xmsbl/quilldown-core/dist/index.iife.js"></script>
<script src="https://unpkg.com/@xmsbl/quilldown-wysiwyg/dist/index.iife.js"></script>
```

全局名：`window.QuilldownCore` / `window.QuilldownWysiwyg` / `window.QuilldownSplit`。

## 开发

```bash
npm ci
npm run ci   # lint + format:check + build + typecheck + test + lint:pkg
```

## 文档

- [`docs/CONTRACT.md`](./docs/CONTRACT.md) —— 冻结契约。
- [`examples/`](./examples) —— 可运行页面 + AI 协作流程。

## 许可证

MIT。`@xmsbl/quilldown-wysiwyg` 基于 [edodo-write](https://www.npmjs.com/package/edodo-write)（MIT）。

# Quilldown

> **Status: best-effort personal project. Contributions welcome, no SLA.**

Host-agnostic Markdown editors that share one render pipeline. Two editors, one contract:

| 包                        | 发布 | 作用                                                         |
| ------------------------- | ---- | ------------------------------------------------------------ |
| `@quilldown/core`         | ✅   | 契约常量 + **唯一**的 md→html 渲染管线（marked GFM + Prism） |
| `@quilldown/wysiwyg`      | ✅   | 所见即所得编辑器（contenteditable，edodo 系）                |
| `@quilldown/split`        | ✅   | 分屏编辑器（源码 + 预览，含滚动同步）                        |
| `@quilldown/host-example` | ❌   | 私有示例宿主 = `CONTRACT.md` 的可执行版（冒烟页）            |

库不假设宿主：不认 Razor / htmx / 固定端点 / CSS 框架，只认「DOM 挂载点 + markdown 进出 + 注入回调」。
契约定案见 [`CONTRACT.md`](./CONTRACT.md)。

## 快速开始（库仓开发）

要求 Node LTS（`>=20`）。

```bash
npm ci          # 装依赖（workspaces 一次装齐）
npm run ci      # lint + format:check + typecheck + build + test（与 CI 同口径）
```

单项：`npm run lint` · `npm run typecheck` · `npm run test` · `npm run build` · `npm run format`；
只重建 core：`npm run build:core`（core 有一条**产物**守卫读 `dist/index.iife.js`，所以 `test` 排在 `build` 后面）。

## 宿主用法（示意）

```ts
import { create } from "@quilldown/wysiwyg";
import { renderHtml } from "@quilldown/core"; // 落库 HTML 的唯一产出者

const editor = create(document.querySelector("[data-editor-mount]")!, {
  value: "# hello",
  upload: (file) => uploadToMyServer(file), // 宿主自己的端点与鉴权
  onChange: (md, html) => {
    mdField.value = md;
    htmlField.value = html; // = renderHtml(md)
  },
});

// 只想要渲染管线（不要编辑器）：marked GFM + Prism，全在 core 里
const html = renderHtml(md);
```

`marked` / `prismjs` **打进 core 产物**（自足单文件，宿主不必再引脚本）；语法着色的 **CSS 归宿主**
（core 只出 `<span class="token …">`）。

IIFE 宿主：每个包一个全局名 —— `window.QuilldownCore` / `window.QuilldownWysiwyg` /
`window.QuilldownSplit`（互不覆盖）。

## 结构

```
packages/
  core/          # 契约常量 + 渲染管线（唯一产出 HTML 处）
  wysiwyg/       # 所见即所得
  split/         # 分屏
  host-example/  # 私有示例宿主（冒烟）
CONTRACT.md      # 冻结契约（版本化）
```

## License

MIT（见 `LICENSE`）。`@quilldown/wysiwyg` 基于 [edodo-write](https://www.npmjs.com/package/edodo-write)
（MIT, Copyright (c) 2026 vivmagarwal）—— 其许可证与署名随产物一并保留。

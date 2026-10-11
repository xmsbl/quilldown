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

## wysiwyg（所见即所得，基于 edodo-write）

```ts
import { create } from "@quilldown/wysiwyg";
import "@quilldown/wysiwyg/index.css";

const editor = create(document.querySelector("[data-editor-mount]")!, {
  value: "# hello",
  locale: "en", // 库自有文案；zh 见下
  upload: (file) => uploadToMyServer(file),
});
editor.getMarkdown(); // 真相源
editor.getHtml(); // 落库 HTML（= core.renderHtml(md)）
```

**宿主提供的 DOM 标记**（库只认属性 + name，不依赖 id）：

| 标记                            | 必需 | 作用                                                       |
| ------------------------------- | ---- | ---------------------------------------------------------- |
| `[data-editor-mount]`           | ✅   | 挂载点（同时是滚动容器）                                   |
| `[data-editor-root]`            | 可选 | 默认开关与大纲容器的查找范围；缺省 = 挂载点父元素          |
| `[data-editor-toc]`             | 可选 | 浮动大纲容器（配 root 上的 `data-editor-default-toc="1"`） |
| `data-editor-default-focus="1"` | 可选 | 焦点模式（只留光标块；标记由库维护）                       |

**locale 有两半**：库**自有**文案（占位 / 大纲标签）走运行时 `locale` 选项；edodo **内建**文案
（斜杠菜单 / 表格 / 块菜单）上游没有 i18n 接口 → **构建期**把 `locales/<lang>.tsv` 烤进产物，
所以产物一个 locale 一份：

```html
<script src="…/@quilldown/wysiwyg/dist/index.iife.js"></script>
<!-- 中文 -->
<script src="…/@quilldown/wysiwyg/dist/index.iife.zh.js"></script>
```

ESM 侧：`@quilldown/wysiwyg`（en）/ `@quilldown/wysiwyg/zh`。

**CSS**：`@quilldown/wysiwyg/index.css`（edodo 本体 + 本包增强）—— 颜色只认 `--qd-*`，
`@layer` 由宿主决定（库不写层）。**core 外置**：IIFE 宿主先引 `QuilldownCore`。

**冒烟页**（契约的可执行版）：

```bash
npm run dev -w @quilldown/host-example   # http://localhost:5173
```

**改 vendored 编辑器**：`npm run vendor -w @quilldown/wysiwyg`（按 `vendor/VERSION.json` 的版本

- sha512 取原件入库）；i18n 清单在 `locales/`，构建时施加（有一条不再命中就**构建失败**）。

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

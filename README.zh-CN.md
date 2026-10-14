# Quilldown

宿主无关的 Markdown 编辑器，共用同一条渲染管线。

[English](./README.md)

两款编辑器，一份契约：

| 包                         | 发布 | 作用                                               |
| -------------------------- | ---- | -------------------------------------------------- |
| `@xmsbl/quilldown-render`  | ✅   | 唯一的 md→html 管线（marked GFM + Prism + 消毒）。 |
| `@xmsbl/quilldown-core`    | ✅   | 契约常量 + 表单绑定；转出管线。                    |
| `@xmsbl/quilldown-wysiwyg` | ✅   | 所见即所得编辑器（contenteditable）。              |
| `@xmsbl/quilldown-split`   | ✅   | 分屏编辑器（源码 + 预览，滚动同步）。              |

`@xmsbl/quilldown-edodo` 是 `wysiwyg` 的内核（`edodo-write` 的 fork，MIT）——装 `wysiwyg` 就行，不用单独装它。

库不假设宿主：不认任何服务端模板 / CSS 框架 / 全局状态。
它只要三样：一个挂载元素、markdown 进出、一个上传回调。

## 两款怎么选

|             | `split`                                          | `wysiwyg`                                                                    |
| ----------- | ------------------------------------------------ | ---------------------------------------------------------------------------- |
| 编辑方式    | markdown 源码 + 实时预览，滚动同步               | 直接改渲染结果（contenteditable）                                            |
| 适合        | 开发者、AI 写的稿子、粘代码                      | 非技术作者、短内容                                                           |
| 优点        | 源码即真相，没有东西会改写它；体积小             | 不用学语法；工具栏、快捷键、目录、占位符、中文界面都已内置                   |
| 缺点        | 吃横向宽度；两栏只是近似同步                     | 粘进来的 HTML 会被 schema 归一化（深嵌套可能被改写）；宿主样式更易渗进编辑区 |
| JS（gzip）  | **≈69 kB** —— split 5.2 + core 0.6 + render 62.9 | **≈110 kB** —— wysiwyg 46.5 + core 0.6 + render 62.9                         |
| CSS（gzip） | 5.2 kB                                           | 9.7 kB                                                                       |

两款共用 `render`，同页都用只付一份管线。上表是 `<script>` 直引路径、按构建产物实测（`gzip -9`）；走打包器时管线由你自己的打包器去重 / 摇树（`render` 的 ESM 入口本身只有 7.3 kB，依赖外置）。

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
<script src="https://unpkg.com/@xmsbl/quilldown-render/dist/index.iife.js"></script>
<script src="https://unpkg.com/@xmsbl/quilldown-core/dist/index.iife.js"></script>
<script src="https://unpkg.com/@xmsbl/quilldown-wysiwyg/dist/index.iife.js"></script>
```

全局名：`window.QuilldownRender` / `window.QuilldownCore` / `window.QuilldownWysiwyg` / `window.QuilldownSplit`。
**`render` 必须最先加载** —— 其余产物启动时读它，而不是各带一份。

## 开发

```bash
npm ci
npm run ci   # lint + format:check + build + typecheck + test + lint:pkg
```

## 文档

- [`docs/CONTRACT.md`](./docs/CONTRACT.md) —— 冻结契约。
- [`examples/`](./examples) —— 可运行页面 + AI 协作流程。

## 许可证

MIT。`@xmsbl/quilldown-edodo`（`wysiwyg` 的内核）是 [edodo-write](https://www.npmjs.com/package/edodo-write)（MIT）的 fork，见 `packages/edodo/UPSTREAM.md`。

# edodo-write fork（内部包）

- 上游：https://github.com/vivmagarwal/edodo-write
- 基线：`master` @ `a7960a0`（v0.10.0，2026-10-12 取）
- 许可：MIT —— 保留上游 `LICENSE` 与原版权声明（`author: vivmagarwal`）
- 包名：`@xmsbl/quilldown-edodo`，`private: true`（**不发布**）

## 为什么 fork

上游只发「已构建产物」。我们要改的是**渲染管线**（Prism 高亮 / 标题 id / 行锚点）、**i18n**、以及**按需摇树**——这些只能动源码。

## 与上游的差异（每批改动记到这里）

### 批次 1：marked 12 → 18（`package.json`）

上游写的是 marked 12 的**位置参数 renderer**；v13+ 改成**单个 token 对象**。四处改动：

| 文件 | 改动 |
| --- | --- |
| `src/lib/email.ts` | `buildRenderer` 全部走 token 对象；子节点用 `this.parser.parse*` 渲染；`listitem` 按 `Parser.parse(tokens)` 单参数调用 |
| `src/plugins/callout.ts` | `blockquote(quote)` → `blockquote(token)` + `this.parser.parse(token.tokens)` 后再匹配 `[!NOTE]` |
| `src/plugins/diagrams.ts` | `code(code, infostring)` → `code({ text, lang })` |
| `src/lib/parse-api.ts` | marked 18 把块间空行拆成独立 `space` token → 并回**前一个块**的 range，保持 v12 的节点形状与「块级 range 精确」契约 |

其余 `renderer(token)` 形式的扩展（highlight / details / footnote / tags / math / emoji / file）在 18 下无需改。

依赖去重：`marked` 全仓只剩一份 18.1.0（core 与 edodo 共用）。

### 批次 2：渲染层（标题 id + Prism 高亮 + 行锚点）

新增 `src/core/render.ts`（渲染层），并从 core 搬入 `slug.ts` / `languages.ts` / `prism/`，接到 `src/core/parse.ts` 的 `createMarkdownParser` 上 —— 编辑面、分屏预览、宿主落库**共用这一层**：

- `heading` → `<hN id="…">`（同名追加 `-1`/`-2`；中文标题保留 Unicode 字母）
- `code` → Prism 高亮（13 语言，与 core 同口径）
- 新增 `createMarkdownDocumentRenderer` / `RenderCodec.renderDocument` → `{ html, anchors }`（顶级块 ↔ 源行）

⚠ 两条坑（写在这里免得再踩）：

- 求行锚点**不能**用 `marked.lexer()` + `marked.parser()` 出 HTML：会跳过插件的 `hooks.postprocess`（脚注尾段直接没了）。必须 `marked.parse()` 出 HTML，另取一份 token 流算锚点。
- `renderCode` **保留上游「恰好一个尾随换行」**，编辑器的代码块 ZWSP 尾随行靠它。
- 插件在 `renderer.code` 里让位时**别 `return false`**（会掉到 marked 默认渲染器、丢 Prism 高亮）→ 改调 `renderCode`。

依赖：新增 `prismjs`（+ `@types/prismjs`）。测试断言：4 处上游写死的无 id 标题改为带 id（`parse.test.ts` / `sanitize-node.test.ts` ×2 / `editor.test.ts`）。

### 批次 3：i18n 进源码

上游把界面英文写死在预设 / 插件 / UI 组件里。fork 新增 `src/core/i18n.ts`：

- `t(text)` + `setLocale(locale)`，词条键 = 上游英文原文（**逐字**）
- 注册表装配（`resolvePlugins`）翻条目；各 UI 组件（table-ui / link-ui / block-handles / slash-menu / editor / preset 表单）在构造时用 `t()`
- `EditorOptions.locale`（`"en"` 默认 / `"zh"`）；对外导出 `setLocale` / `getLocale` / `t`

译文**逐条对齐**旧的 `packages/wysiwyg/locales/zh.tsv`（构建期替换 vendor 产物那套），所以不造成中文回归。
`tests/i18n.test.ts` 断言「zh 字典覆盖 corePreset 全部条目文案」，漏一条即失败（不静默留英文）。

→ 旧机制（`locales/*.tsv` + `build.mjs` 的 i18n 插件 + vendor 原件）在接线批次里删除。

### 批次 4：可发布 + CSS 拆出 content-only

- 去掉 `private`（`split` / `wysiwyg` / `core` 是**要发布**的包，装不了私有 workspace 包），
  加 `publishConfig.access = public`
- `src/content.css` = **内容排版**（token + 块级排版）；`src/styles.css` 用 `@import` 引它
  → **一份源出两份**：
  - `dist-lib/edodo-write.css`（编辑器皮肤，含内容排版）
  - `dist-lib/edodo-content.css`（**宿主前台只用这份**：产物 HTML 放进 `class="ew-content"` 的容器即可）
  - exports 加 `./content.css`
- 随之：token 的宿主选择器从 `.ew` 扩成 `:where(.ew, .ew-content)`，暗色 / 浅色覆盖同步

### 批次 5：管线抽成 `@xmsbl/quilldown-render`

管线（`parse` / `render` / `sanitize` / `slug` / `languages` / `prism`）从本包移到新包
`packages/render`（`@xmsbl/quilldown-render`）—— **唯一一份**，core / split / fork 共用。

理由：`split` 是**要发布的轻量包**，装不了私有 workspace 包；管线单独成包后它只需 external 依赖。

本包侧：`src/core/parse.ts` / `src/core/sanitize.ts` 变成**薄转发**（上游那堆 `./parse.js`
引用不必动），`src/plugins/diagrams.ts` 的 `renderCode` 改从管线包引。

### 批次 6：接到上层

- `wysiwyg` 删掉 vendor + 构建期 i18n（`vendor.mjs` / `i18n.mjs` / `locales/`），改
  `dependencies: @xmsbl/quilldown-edodo`：ES 外置本包（消费方摇树），IIFE 把本包打进产物；
  中文化改运行时 `locale: "zh"`。
- 管线包（`@xmsbl/quilldown-render`）成为唯一管线，`core` 退成再导出。

## 同步上游

```bash
git clone --depth 1 https://github.com/vivmagarwal/edodo-write.git /tmp/edodo-src
```

对照基线 commit 手工 diff 后搬进来；改动越集中在少数文件，重放越省事。

## 目录

| 路径 | 内容 |
| --- | --- |
| `src/core/**` | 编辑器内核（parse / serialize / sanitize / editor / ui / keymap …） |
| `src/lib/**` | 对外入口（`index` / `parse-api` / `testing` …） |
| `src/plugins/**` | 插件（math / emoji / embeds / diagram …）；**没 import 的会被下游摇掉** |
| `tests/**` | 上游单测 |
| `dist-lib/` | 构建产物（ESM 多入口，**node_modules 依赖不打包**） |

**已剔除**（相对上游）：`src/site`（React 演示站）、`src/main.tsx`、`src/e2e`、`src/lib/react.tsx`、`tests/e2e`、`tests/react.test.tsx`、`tests/llms-txt.test.ts`、`tests/docs-examples.test.ts`（依赖上游 README/docs）。

## 构建 / 测试

```bash
npm run build -w @xmsbl/quilldown-edodo   # vite lib → dist-lib/ + .d.ts
npm run test  -w @xmsbl/quilldown-edodo
```

消费方（`wysiwyg`）把它**打进自己的产物**，所以本包 `private`、不进 npm。

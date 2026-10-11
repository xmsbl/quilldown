# Quilldown Contract v1

> **冻结契约**。契约有两半：**库要实现什么**（本文件）+ **宿主必须提供什么**（宿主侧 DOM 标记与回调）。
> 破坏性改动才升版本号；npm 包版本与契约版本**解耦**（见 §5）。
> 库导出 `CONTRACT_VERSION = "1"`，与此处版本号一一对应。
> 宿主侧参考实现：Inkwell（`docs/编辑器分库.md`）—— 它只写「宿主那半」。

## 1. 硬规则

- `@quilldown/core` 是**唯一**产出 HTML 的地方（marked GFM + Prism 语言集）。编辑器包只产出 markdown。
  「两编辑器产出逐字节一致」由代码结构保证，不靠自律。
- 库**不假设**宿主：不认 Razor / htmx / 固定端点 / CSS 框架 / 全局状态。
  只认三件事：**DOM 挂载点** + **markdown 进出** + **注入回调**。
- 库样式 scope 在挂载根（`[data-editor-mount]`），**不依赖宿主的 `@layer` 层序**；自带 `@layer` 仅作可选加成。
- 库**不持久化**任何东西（草稿 / 防丢稿 / 提交拦截归宿主），只暴露状态（`isDirty()` + 事件）。

## 2. 编程接口（宿主无关的标准核心）

```ts
type UploadFn = (file: File) => Promise<{ url: string; name?: string }>;
type FormField = HTMLInputElement | HTMLTextAreaElement;
interface FormBindOptions {
  form?: HTMLFormElement | null; // 缺省 = 挂载点向上最近 form.editor-shell → 任意 form
  mdField?: FormField | null; // 传 null = 明确不要这个字段
  htmlField?: FormField | null;
}

interface EditorOptions {
  value?: string; // 初始 markdown
  locale?: string; // 'en' | 'zh' | …
  strings?: Record<string, string>; // 覆盖库自有文案
  placeholder?: string;
  autofocus?: boolean;
  upload?: UploadFn; // 宿主注入；库不认端点 / 防伪令牌
  renderHtml?: (md: string) => string; // 默认走 core，可覆盖
  onChange?: (md: string, html: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  tocDefault?: boolean;
  focusDefault?: boolean;
  mirror?: boolean | FormBindOptions; // 表单字段镜像（§4）；省略 = 自动找，false = 关
  // 编辑器特定：layout / toolbar / …（wysiwyg 专用）
}

interface EditorInstance {
  getMarkdown(): string;
  getHtml(): string;
  setMarkdown(md: string, opts?: { silent?: boolean }): void;
  isDirty(): boolean;
  focus(): void;
  destroy(): void;
}

function create(mount: HTMLElement, opts: EditorOptions): EditorInstance;
```

- ESM：`import { create } from "@quilldown/wysiwyg"`。
- IIFE：**每包一个独立全局名**（互不覆盖）—— `window.QuilldownCore` / `window.QuilldownWysiwyg`
  / `window.QuilldownSplit`。
- **locale 分两半**（同一选项 `locale`，两种机制）：库**自有**文案（占位 / 大纲标签）走运行时
  `locale`；edodo **内建**文案上游没有 i18n 接口 → **构建期**烤进产物 → `@quilldown/wysiwyg`
  一个 locale 一份（默认 en；zh 见子路径出口 `@quilldown/wysiwyg/zh` 与 `dist/index.iife.zh.js`）。
- **core 外置**：IIFE 产物取全局 `QuilldownCore`（宿主先引 core），不把 marked / Prism 打进来两遍。

## 3. DOM 契约（宿主标记，库消费）

| 标记                        | 含义                                                                                              | 冻结 |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ---- |
| `[data-editor-mount]`       | 挂载点（库把编辑器塞进来）                                                                        | ✅   |
| `form.editor-shell`         | 表单适配器选择的表单                                                                              | ✅   |
| `[data-editor-md]`          | Markdown 真相源（镜像 / 回灌）；无则回退 `[name$=".BodyMd"]`                                      | ✅   |
| `[data-editor-html]`        | HTML 产物（库填）；无则回退 `[name$=".BodyHtml"]`                                                 | ✅   |
| `[data-editor-toc]`         | 浮动大纲容器                                                                                      | ✅   |
| `data-editor-default-toc`   | 默认开关（`1` / `0`）                                                                             | ✅   |
| `data-editor-default-focus` | 默认开关（`1` / `0`）                                                                             | ✅   |
| `data-image-upload-url`     | **宿主专有**：由宿主适配层读后转成 `upload` 回调                                                  | ⚠    |
| `[data-editor-root]`        | 可选根：默认开关（`data-editor-default-*`）与 `[data-editor-toc]` 的查找范围；缺省 = 挂载点父元素 | ✅   |

- 库只用**属性与 name**，**不依赖 id**（`#cp-body` / `#cp-html` 是 Inkwell 专有 id，非契约）。
- `data-editor-*` 用连字符小写，DOM 类名沿用 `page-editor` / `editor-*` / 状态 `is-*`。

## 4. 表单适配器（库自带的可选便利件）

- 作用：把编辑器当前值写进 §3 的 md / html 隐藏字段（= 传统「表单里塞两个 hidden」的写法）。
- **默认开**：省略 `mirror` 就自动找；`mirror: false` 关掉改用 `getMarkdown()` / `getHtml()`；
  传 `FormBindOptions` 则覆盖查找结果。core 也单独导出 `bindForm(editor, mount, opts)` 与
  三个选择器常量（`FORM_SELECTOR` / `MD_FIELD_SELECTOR` / `HTML_FIELD_SELECTOR`）。
- **查找链**（CONTRACT §3）：表单 = 挂载点向上最近的 `form.editor-shell`，回退任意 `form`；
  md 字段 = `[data-editor-md]` → `[name$=".BodyMd"]`；html 字段 = `[data-editor-html]` →
  `[name$=".BodyHtml"]`。`null` = 明确不要该字段；**表单或两个字段都找不到 = 不启用**（返回
  `null`，不报错 —— 无表单的宿主本就不需要它）。
- **行为三件套**：
  1. 绑定即刻写一次 —— 否则「没改动就保存」时服务端拿到空 html，会被当成「JS 没跑」拒收；
  2. **submit 捕获阶段**再刷一次 —— 编辑器内建去抖还没落盘的改动也不会丢；适配器**不拦提交**；
  3. 字段上的 `input` → 回灌编辑器（`setMarkdown(v, { silent: true })`）—— 宿主草稿恢复的入口。
- 编辑器每次变更落盘（去抖后）自动写字段；`onChange` 之前先写，宿主回调里直接读字段也是新值。
- 每个宿主页**只装一个编辑器实例**（多实例抢同名字段 = 静默互相覆盖）。

## 5. 版本与纪律

- `CONTRACT.md` 头部版本 + 库导出常量（`CONTRACT_VERSION`）**两处**暴露；改契约必须同时改两处 + 升版本号。
- npm 包版本按 semver 独立演进（从 `0.x` 起）；**契约版本只在破坏性改动时 +1**。
- 契约改动必须**落进仓**（commit），不留对话里。
- 校验靠 `packages/host-example`（契约的可执行版：挂载 + 打字 + 上传 mock + 断言 `.BodyMd` / `.BodyHtml` 被填 + `getMarkdown()` 往返幂等）。

## 6. core 产出口径（`renderHtml` 的形状）

> **为什么写进契约**：宿主的 sanitize 白名单、`.token` / `.language-*` 样式、目录锚点**全都依赖这个形状** ——
> 形状一变，落库 HTML 被白名单削掉或目录跳不动，而两边都不会报错。
> 本节描述的是 v1 既有事实（E1 落地时补齐），**未变更宿主那半**。

- **GFM 开、`breaks` 关**（表格 / 删除线 / 任务列表 / 自动链接；单换行不折行）。
- **原始 HTML 一律转义**：`<script>alert(1)</script>` 出来是文字（等价服务端 `DisableHtml`）——宿主无需再防正文注入。
- **标题带锚点**：`<h2 id="时间口径">`；id = 小写、去标点、空白→`-`、保留 Unicode 字母（中文可读）；
  同名依次 `-1` / `-2`；标题只有标点时回退 `section`。
- **代码块**：`<pre><code class="language-<lang>">…</code></pre>`（无语言则无 class）；
  命中语言集时内容是 Prism 产物（`<span class="token …">`），HTML 已转义 —— 宿主 CSS 认 `pre > code` + `.token`。
- **语言集（冻结 13 种）**：`markup` `css` `clike` `javascript` `typescript` `json` `bash` `python`
  `sql` `csharp` `yaml` `markdown` `diff`（别名 `html` / `js` / `ts` / `cs` / `yml` / `md` / `py` / `sh` 由 Prism 登记）。
  加语言 = core 两处（`src/languages.ts` + `src/prism/components.ts`）+ 宿主侧断言同步。
- core **自带** `marked` / `prismjs` 并打进产物（自足单文件）；加载时把 Prism 挂到 `globalThis.Prism`
  且 `manual = true` —— **绝不自动扫宿主 DOM**（库只做「给字符串 → 还 HTML」）。
- **语法着色的 CSS 归宿主**（core 不发 CSS）；core 也不发任何编辑器 UI 样式（那是 wysiwyg / split 的事）。

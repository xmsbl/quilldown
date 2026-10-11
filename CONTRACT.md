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
- IIFE：全局 `window.Quilldown`（`<script>` 宿主用）。

## 3. DOM 契约（宿主标记，库消费）

| 标记                        | 含义                                                         | 冻结 |
| --------------------------- | ------------------------------------------------------------ | ---- |
| `[data-editor-mount]`       | 挂载点（库把编辑器塞进来）                                   | ✅   |
| `form.editor-shell`         | 表单适配器选择的表单                                         | ✅   |
| `[data-editor-md]`          | Markdown 真相源（镜像 / 回灌）；无则回退 `[name$=".BodyMd"]` | ✅   |
| `[data-editor-html]`        | HTML 产物（库填）；无则回退 `[name$=".BodyHtml"]`            | ✅   |
| `[data-editor-toc]`         | 浮动大纲容器                                                 | ✅   |
| `data-editor-default-toc`   | 默认开关（`1` / `0`）                                        | ✅   |
| `data-editor-default-focus` | 默认开关（`1` / `0`）                                        | ✅   |
| `data-image-upload-url`     | **宿主专有**：由宿主适配层读后转成 `upload` 回调             | ⚠    |

- 库只用**属性与 name**，**不依赖 id**（`#cp-body` / `#cp-html` 是 Inkwell 专有 id，非契约）。
- `data-editor-*` 用连字符小写，DOM 类名沿用 `page-editor` / `editor-*` / 状态 `is-*`。

## 4. 表单适配器（库自带的可选便利件）

- 作用：把 `onChange` 的结果写进 §3 的 md / html 隐藏字段（= 传统「表单里塞两个 hidden」的写法）。
- 可关。关掉就自己用 `getMarkdown()` / `getHtml()`。
- 每个宿主页**只装一个编辑器实例**（多实例抢同名字段 = 静默互相覆盖）。

## 5. 版本与纪律

- `CONTRACT.md` 头部版本 + 库导出常量（`CONTRACT_VERSION`）**两处**暴露；改契约必须同时改两处 + 升版本号。
- npm 包版本按 semver 独立演进（从 `0.x` 起）；**契约版本只在破坏性改动时 +1**。
- 契约改动必须**落进仓**（commit），不留对话里。
- 校验靠 `packages/host-example`（契约的可执行版：挂载 + 打字 + 上传 mock + 断言 `.BodyMd` / `.BodyHtml` 被填 + `getMarkdown()` 往返幂等）。

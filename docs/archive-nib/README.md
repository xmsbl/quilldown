# Nib

Inkwell 专用的 Markdown **所见即所得**编辑器。独立仓、**不发 npm**、宿主直接吃构建产物。

- **真相源永远是 markdown**：编辑面所有装饰都是 view-only，`getMarkdown()` 拿到的就是原文（字节级）。
- **唯一宿主**：只服务 Inkwell（`/home/xmsbl/dev/Inkwell`），不做通用化。
- **单包**：渲染 + 编辑器一体，宿主只引一个 `nib.iife.js` + 一份 `nib.css`。

状态：**B0–B10 已落地**（骨架 / 内核 / 即时渲染 / 块级与输入 / 图片与嵌入与上传 / 表格 /
斜杠菜单 / 大纲与专注与只读与占位 / 渲染出口与 CSS / 打磨）。B9（宿主集成）的产出在 Inkwell 仓。
`renderMarkdown()` 已可用（marked + Prism + slug，口径与 `@xmsbl/quilldown-render` 逐字节一致）。

验证基线（B10 收口）：`npm run ci` 全绿 · **260** 测试 · IIFE gzip **148.2k**（上限 200k）。
进度见 [`docs/PLAN.md`](./docs/PLAN.md)，技术定稿见 [`docs/SPEC.md`](./docs/SPEC.md)。

## 接口

```ts
create(mount: HTMLElement, opts?: NibOptions): NibInstance

interface NibOptions {
  value?: string;
  placeholder?: string;      // 空文档提示（默认「写点什么，或输入「/」唤出命令菜单…」）
  readOnly?: boolean;        // 只读：不显示源码，整篇渲染
  upload?: (file: File) => Promise<{ url: string }>;   // 宿主注入，库不认端点
  onChange?: (md: string, html: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onReady?: () => void;
  tocDefault?: boolean;    // 浮动大纲默认开关（只有显式 false 才关）
  focusDefault?: boolean;  // 专注模式默认开关（默认关）
}

interface NibInstance {
  getMarkdown(): string;                              // 真相源
  getHtml(): string;                                  // = renderMarkdown(getMarkdown())
  setMarkdown(md: string, opts?: { silent?: boolean }): void;
  isDirty(): boolean;
  focus(): void;
  destroy(): void;
}

export function renderMarkdown(md: string): string;    // md → html（唯一管线）
```

## 宿主怎么引

```
Nib/dist/nib.iife.js  →  Inkwell:src/Inkwell/wwwroot/lib/nib/nib.iife.js
Nib/dist/nib.css      →  Inkwell:src/Inkwell/wwwroot/lib/nib/nib.css
```

脚本顺序：`nib.iife.js`（全局 `window.Nib`）→ 宿主自己的 `markdown-editor.js`（薄适配）。

## 不做（写死，别在开发中冒出来）

- 源码模式切换 · 预览分屏 · 完整 md→html 导出页
- 公式（KaTeX）· 图表（Mermaid）· emoji 选择器 · 拖拽排序 · 标题折叠
- **标签（`#tag`）**——宿主已用「逗号分隔元数据输入」，不做正文内联
- 搜索替换（浏览器 Ctrl+F 够）· 大纲侧栏（只有浮动 TOC）
- 工具栏 / 选中浮动工具条（斜杠菜单是唯一浮层）
- **消毒**（归 Inkwell 写侧）· i18n 多语言构建 · 插件 / 扩展 API
- IIFE 多语言变体 · `mirror` 表单适配器 · 自动挂载（`mountAuto`）· 默认上传实现

## 已知限制

（B10 收口时点，逐条都对应一处代码或一条 SPEC 决策；不是"待办清单"，是**契约边界**。）

- **超长文档**（> ~50 万字符）：单次全树解析超出 200ms 预算，尾段会**先以源码显示**，
  解析推进（`treeGrew`）后自动补齐 —— 会自动好，但开头那一两帧不是渲染态。
- **原始 HTML 不高亮**：关掉 `lang-markdown` 内嵌 HTML 的代价（SPEC §3），md 里写的 `<div>` 就是纯文本。
- **编辑器内代码块不高亮**：Prism 只在 `renderMarkdown()` 出口（前台）生效，编辑面是单色（B8 遗留）。
- **可见的源码标记不淡显**：光标行露出的 `#` / `**` 与正文同色（没有单独的标记 class）。
- **上传没有进度**：只有「上传中…」占位，不显示百分比 / 不显示取消按钮。
- **`Ctrl+K` / `Ctrl+E` 可能被浏览器抢**（地址栏），拦不拦得住看浏览器版本 —— 库里不兜。
- **组合输入（IME）期间不外发 `onChange`**：组合文本的最终提交（`composing === false`）会补一次；
  宿主拿到的一定是完整文本，但**不会**看到拼音过程中的中间态。
- **大纲容器是宿主的**：找不到 `[data-editor-toc]` 就没有大纲（不自造 DOM）。
- **滚动高亮的观感只有真浏览器能验**：jsdom 没有布局引擎，测试只覆盖到逻辑（`posAtCoords` 回退视口起点）。
- **移动端未专门优化**（SPEC §5）；表格的 `contenteditable` 单元格在移动端 IME 下未验证。

## 文档分工

| 文件 | 作用 | 什么时候读 |
|---|---|---|
| `README.md`（仓根） | 门面 + 接口 + 不做清单 | 每次开工前扫一眼 |
| `docs/PLAN.md` | 批次计划 + 协作约定 | 领活时只看自己那批 |
| `docs/SPEC.md` | 技术定稿（依赖 / 架构 / 功能集 / 搬运清单 / 体积 / 许可） | 动手改之前按域查 |
| `docs/手动测试.md` | B0–B10 需人眼验证的清单 + 静态测试页用法 | 发版 / 收尾前跑一遍 |
| `examples/manual-test.html` | 静态测试页（引 `dist` 产物，零依赖） | 配合上一条手动验 |

# Nib — 技术定稿

> 本文是**已经定死的决策**。改这里 = 改契约，必须同步改 `PLAN.md` 与宿主侧。
> 依据：2026-10-13 的规划探讨（A–E 五组议题）。

---

## 1. 定位与边界

- **消费者**：只有 Inkwell 一个（私有单宿主）。
- **职责**：Markdown 所见即所得编辑（md 进 / md 出）+ md→html 渲染。
- **一句话边界**：`create(mount)` 起一个编辑器；`getMarkdown()` / `getHtml()` 出两样东西；一份 CSS 给前台复用。

**因为只有一个消费者**：不做通用化、不做契约双写流程、不做适配层（`mirror` / `mountAuto` / 默认上传全砍——那是"多宿主才付得起"的架子）。

---

## 2. 工程基座（A 组）

| 项 | 定 |
|---|---|
| 仓目录 | `/home/xmsbl/dev/Nib` |
| 包名 | `nib`（内部用，不发布） |
| 发布 | **不发 npm** |
| 交付 | 宿主拷 `dist` 产物 |
| 构建 | vite lib 模式，**ESM + IIFE 双产物**（宿主吃 IIFE） |
| 测试 | vitest |
| 目标环境 | 现代浏览器（不背 IE / 旧 Safari） |
| CSS 变量前缀 | **`--nib-*`**（宿主 `admin.css` 改映射一处） |
| 类名前缀 | `nib-*` / `.cm-nib-*` |

---

## 3. 依赖（B 组）—— 零第三方，除下列

**运行时依赖（全部）**
```
@codemirror/state  @codemirror/view  @codemirror/commands
@codemirror/language  @codemirror/lang-markdown
@lezer/markdown        # GFM 扩展：Table / TaskList / Strikethrough / Autolink
prismjs                # 固定 13 语言
marked                 # md→html 渲染出口（B8），GFM 解析
```

**Prism 语言集**（与 Inkwell 前台一致，直接抄 quilldown 的 `languages.ts` + `prism/components`）
```
markup css clike javascript typescript json bash python sql csharp yaml markdown diff
```

**明确不引**：`@codemirror/autocomplete`、`lint`、`collab`、`search`、`lucide`、`katex`、`mermaid`、`turndown`。

> **`marked` 的例外（B8 定）**：`renderMarkdown()` 的产物要与宿主现存的落库 HTML
> （原 `@xmsbl/quilldown-render`）**逐字节一致** → 解析器必须是 `marked`，不能换成
> lezer 自渲染。配套的消毒层（`htmlparser2 + dom-serializer + domhandler`，≈36k gzip）
> **不引** —— SPEC §5 已定「消毒归宿主写侧」，任务列表的 class 由 marked 渲染钩子补。

**配置**：关掉 `lang-markdown` 的内嵌 HTML 支持（省 `@codemirror/lang-html` + `@lezer/html`，约 9k gzip）。
→ 代价：md 里写的原始 HTML 不高亮（已知可接受）。

---

## 4. 架构

```
src/
  index.ts                  公开 API（create / renderMarkdown / 类型）
  create.ts                 挂载、生命周期、选项装配
  extensions/
    inline-preview.ts       ★ 即时渲染引擎（核心）
    freeze.ts               ★ 鼠标冻结（治光标漂移）
    blocks.ts               块级 line class（标题/引用/代码块/分隔线）
    input-rules.ts          输入触发（# - > ```）
    keymap.ts               快捷键 + 编辑命令（续行 / 加粗 …）
    images.ts               图片 block widget
    embeds.ts               嵌入 block widget（裸 URL）
    table/                  表格（抄 moondown，见 §8）
    slash-menu.ts           斜杠菜单
    toc.ts                  浮动大纲（`scanHeadings` + 三态刻度条，容器由宿主的 `[data-editor-toc]` 给）
    focus-mode.ts           专注模式（当前块 `cm-nib-focus-current`、其余 `cm-nib-focus-dim`）
    read-only.ts            只读 facet（三状态位：facet + `EditorState.readOnly` + `editable(false)`）
    placeholder.ts          空文档占位（零宽 widget，文案 `opts.placeholder`）
  render/
    render.ts               md → html（prism + slug）
    languages.ts            Prism 语言集（冻结）
    prism/                  Prism 组件注册
  theme/
    content.css             内容排版（拷 quilldown，前台复用）
    editor.css              编辑器皮肤 + DOM→排版映射层
```

### 4.1 六条必须照做的机制（来自 atomic-editor 的实战结论）

1. **无布局偏移是铁律**
   行高**只由 CSS class 决定**（`.cm-nib-h1` 的 font-size），**不由 token 可见性决定**。
   隐藏标记用**空 `Decoration.replace({})`**——把字符移出文档流但不改行高。
   （它早先做过"整块 replace 成 HTML widget"的模式，实测 CLS ~0.1/10 次光标移动，肉眼可见抖，废弃。）

2. **鼠标冻结（治光标漂移）**
   `previewFrozenField`(StateField) + `setFrozen` effect；`freezeMousePlugin` 用 **capture 阶段**的 `pointerdown`（必须 capture，否则 `lang-markdown` 的 bubble 处理器抢先重建）→ 冻结；`pointerup` 后 **100ms 尾巴**解冻。
   冻结**只压选区驱动的 reveal**；`docChanged` 时**照常重建**（不重建会位置错乱 + 触发 `replace line breaks may not be specified via plugins`）。

3. **重建触发条件**
   ```
   docChanged ‖ selectionSet ‖ focusChanged ‖ justUnfroze ‖ treeGrew ‖ readOnlyChanged
   ```
   **`viewportChanged` 故意排除**——滚动**不**重建（iOS 动量滚动会被打断）。
   策略不是"只重建变化行"，而是**每次全树走一遍**（`ensureSyntaxTree(state, doc.length, 200)` 保证全覆盖，单位数 ms），换滚动零成本。
   `treeGrew`（B10 接）：大文档单次 200ms 铺不满，解析 worker 每有进展会派发一次无 doc/选区变化的
   `Language.setState` 事务 —— 拿"语法树可用长度变了"当信号补重建（见 `inline-preview.ts`
   `syntaxTreeGrew`），否则超长文档的尾段会永远停在源码。

4. **IME 守卫（我们补，atomic 的 inline-preview 没做）**
   重建 decorations 前先查 **`view.composing`**，组合输入期间直接跳过。
   （atomic 只在表格 widget 里做了这件事——中文输入的命门。）

5. **跨行 replace 必须拆段**
   CM6 禁止 plugin 发出跨行 `Decoration.replace`（会抛错）。lezer 会吐出跨行 token（如多行 LinkTitle）→ 写 `pushReplace()` 按行切段，widget 只挂第一段。

6. **块级 widget 用 StateField + 窄失效**
   `renderBlockWidgets(shouldHandleNode, createWidget)` 工厂（抄 moondown）：
   - `create`：全树扫 → 匹配节点 → `Decoration.replace({ widget })`
   - `update`：`!docChanged && !readOnlyChanged` → 返回 `map(changes)`；docChanged 但改动**不碰**已处理节点（把改动范围扩到整行比对）→ 也返回映射后的旧集
   - 表格 / 图片 / 嵌入**共用这一个工厂**

### 4.2 主题与 CSS 分层

- `content.css`：**拷 quilldown `packages/render/src/content.css`**，前台与编辑器**一份源**（含 Prism token 配色 → 前台不需要 `prism.css`）。
- `editor.css`：编辑器皮肤 + **DOM 映射层**——CM6 里标题是 `.cm-line.cm-nib-h1` 不是 `<h1>`，需补一层别名规则让排版样式命中。规则一律**按 class 写，不按标签写**。

---

## 5. 功能集（C 组）

### 做

| 域 | 内容 |
|---|---|
| 模式 | **所见即所得单模式**（无源码切换、无分屏） |
| 标记显隐 | **光标所在行显示原始标记**，移开即渲染（Typora 式） |
| 即时渲染 | 标题 · 粗/斜/删除线 · 行内码 · 链接 · 列表 · 引用 · 分隔线 · 代码块 · 图片 · 表格 |
| 链接 | 渲染成文字；光标进入才露 `[](url)`；链接**作用域按"光标在链接内"**判定（非整行） |
| 表格 | **整块 widget 化**（方案③，抄 moondown）：点格子直接编辑、Tab 走格、右键增删行列 |
| 图片 | widget 显示成图，光标进入显示源码；**三入口**：粘贴 / 斜杠菜单 / 拖拽 |
| 嵌入 | **裸 URL → widget**（youtube / vimeo / video / audio / bookmark） |
| 代码块 | 编辑面**单色**；Prism 高亮（13 语言）只在 `renderMarkdown()` 出口（B8 遗留，见 README「已知限制」） |
| 输入体验 | 输入触发（`# `→标题、`- `→列表、`> `→引用、` ``` `→代码块）· 自动续行（列表/任务/引用）· 任务框可点 |
| 快捷键 | Ctrl+B/I/K/E · 标题 Ctrl+1–6 · Tab 缩进 · 撤销/重做 |
| 斜杠菜单 | `/` 触发插入菜单（唯一浮层）；**支持继续打字过滤** |
| 浮动大纲 | Notion 式三态刻度条（抄 quilldown `scanHeadings` + CSS，重接"当前标题高亮"） |
| 专注模式 | 当前块高亮、其余变淡（CM6 decoration 重写） |
| 其他 | 只读模式 · placeholder |

### 不做

源码模式 · 分屏预览 · 公式 · 图表 · emoji · 拖拽排序 · 标题折叠 · 搜索替换 ·
**标签 `#tag`**（宿主用逗号分隔元数据输入）· 大纲侧栏 · 工具栏/浮动工具条 ·
消毒（归宿主写侧）· i18n · 插件 API · 移动端专门优化 ·
自动配对括号/强调符（`closeBrackets` 随 `@codemirror/autocomplete` 一起被排除，见 §3）

---

## 6. 对外接口（D 组）

```ts
create(mount: HTMLElement, opts?: NibOptions): NibInstance
```

- 实例：`getMarkdown()` / `getHtml()` / `setMarkdown(md, {silent?})` / `isDirty()` / `focus()` / `destroy()`
- 单独导出 `renderMarkdown(md): string`（`getHtml()` 即它的结果）
- 事件：`onChange(md, html)` · `onDirtyChange(dirty)` · `onReady()`
- `upload(file) => Promise<{ url }>`（返回 `string` 也接受）
- **删掉**：`mirror`（宿主自己写）· `locale`/`strings`（文案写死中文，`placeholder` 可传）· 插件 API
- **保留**：`readOnly` · `placeholder` · `tocDefault` · `focusDefault`

### 图片上传契约

- 三入口 → 同一条 `upload` 管道
- 宿主**未提供** `upload` → 降级**内嵌 base64**
- 上传中：占位 widget（骨架/转圈）；成功：换真图；失败：提示 + **回退成纯文本 `![]()`**
- 斜杠菜单的"图片"项：支持**选文件**与**填 URL** 两种模式（URL 模式不走 `upload`）

---

## 7. 宿主集成（Inkwell 侧改动）

**保留的 DOM 标记**（`_Editor.cshtml` / `EditorTagHelper`）
```
[data-editor-mount]  [data-editor-root]  [data-editor-toc]
data-editor-default-toc  data-editor-default-focus
#cp-body[data-editor-md]  #cp-html[data-editor-html]
data-image-upload-url
```

**改动点**
| 项 | 动作 |
|---|---|
| `data-editor-kind` | **退休**（Nib 只有一个编辑器；`LIBRARIES` 映射整段删） |
| `markdown-editor.js` | 瘦身：删 kind 映射 / `mirror: true` / `locale: 'zh'` |
| 字段写入 | 宿主自己在 `onChange(md, html)` 里写两个隐藏字段（≈5 行）+ submit 时兜一次 |
| `upload` 回调 | 保留（读 `data-image-upload-url`） |
| 脚本加载 | `render.iife.js → core.iife.js → wysiwyg/split` 那套**作废**，只引 `nib.iife.js` |
| CSS 变量 | `--qd-*` / `--ew-*` 映射 → `--nib-*`（`admin.css` 一处） |
| vendor 脚本 | 照 `scripts/vendor-editor.sh` 的 **pin-commit** 模式做一份 |

> ⚠ 宿主侧 `Mirror` 取消后，"submit 捕获阶段再刷"要宿主自己做（`submit` 时调 `getMarkdown()`/`getHtml()`），否则编辑器内建去抖未落盘会丢。

---

## 8. 搬运清单

> **原则：摘代码 ≠ 引依赖。** 只复制函数体 / 算法，**不要**把它目录间的 import 关系一起搬（会连锁拖进一堆无关文件）。
> 摘录处保留版权声明 + 在 `NOTICE` 列明改了哪些文件。

### atomic-editor（MIT · kenforthewin/atomic-editor）

| 摘什么 | 位置 |
|---|---|
| 无布局偏移 + 空 `replace` 隐藏标记 | `src/inline-preview.ts` |
| `previewFrozenField` / `freezeMousePlugin`（capture + 100ms） | 同上 |
| 重建条件（含排除 `viewportChanged` 的理由） | `docs/architecture.md` + 同上 |
| `pushReplace()` 跨行拆段 | 同上 |
| `supplementMidTypingEmphasis()`（打字中途强调符闪烁） | 同上 |
| `insertTightListItem()`（Enter 紧列表续行，`Prec.highest`） | 同上 |
| `readOnlyFacet` | `src/read-only.ts` |
| 图片 block widget 的窄失效 `changeAffectsImages` | `src/image-blocks.ts` |

**没做、我们要补**：inline-preview 里**没有** `view.composing` 守卫（只有表格 widget 有）。

### moondown（Apache-2.0 · LoadShine/moondown）—— 需 NOTICE

| 摘什么 | 位置 |
|---|---|
| `renderBlockWidgets` 工厂（整块 replace + 窄失效） | `src/extensions/table/table-widget-rendering.ts` |
| 表格全量 | `src/extensions/table/*`（27 文件 ≈3000 行） |
| 语法隐藏的 node handlers 分解方式 | `src/extensions/markdown-syntax-hiding/*` |
| 斜杠菜单的 `positionMenu`（视口 / 翻转 / 夹紧 / maxHeight） | `src/extensions/slash-command/slash-command.ts` |
| 斜杠菜单状态外置（`active`/`filterText`/`selectedIndex`） | 同上 + `fields.ts` |
| 图片 widget 思路 | `src/extensions/image/*` |

**不碰**：`lucide`（图标）· `latex` / `mermaid` · `bubble-menu`（含 AI polish）· `theme/*` · plugin runtime。

### quilldown（MIT · 本机 `/home/xmsbl/dev/quilldown`）

| 摘什么 | 位置 |
|---|---|
| 内容排版 CSS（前台复用，一份源） | `packages/render/src/content.css` |
| Prism 语言集 + 组件注册 | `packages/render/src/languages.ts` + `src/prism/` |
| 标题锚点 slug | `packages/render/src/slug.ts` |
| 大纲扫描逻辑 + 浮动 TOC 的 CSS | `packages/wysiwyg/src/toc.ts` + `styles.css`（CSS 直接抄，扫描逻辑重接"当前标题高亮"） |

### purrmd（MIT · luoluoqixi/purrmd）

斜杠菜单**最简版对照**（`packages/core/src/core/view/slashMenu.ts`，~200 行）——只作参考，**别直接用**（无过滤、无滚动重定位）。

### MarkBloom（MIT · yuya296/MarkBloom）

备选路线：`.cm-lp-marker-hidden { display:inline-block; width:0; font-size:0; line-height:0 }`
——**标记保留在布局映射里（光标能穿过），视觉宽度塌到 0**。跟 atomic 的 `replace` 是两种取舍，遇到"跨行 replace"坑时可切换过来。

---

## 9. 体积预算（gzip）

```
CM6 底座（5 包 + lezer + Prism 13 语言 + marked）   ≈ 140k
Nib 自有功能代码（隐藏/表格/图片/嵌入/斜杠/大纲）  ≈ +30~45k
                                        ──────────
合计                                      ≈ 170~185k   （上限 200k）
```

**实测（B10 收口，IIFE gzip）**：B7 116.6k → B8 148.2k → **B10 148.2k**（打磨只加了几行判定，体积不变；`npm run size` 口径）。

> 十万字文档实测：全树解析 ~74ms（< 200ms 预算，一次铺满）；百万字超时，靠 `treeGrew` 补齐。

**守轻路线的三条纪律**
1. **零第三方**：CM6 官方包 + lezer + prism + `marked`（渲染出口），别的一个不加
2. 图标 / UI 装饰**自己画**（字符 / 内联 SVG / CSS）
3. 摘代码只复制函数体，不搬 import 关系

> 源码量 ≠ 打包体积：3000 行表格代码 gzip 后约 10–15k（逻辑代码压缩率高）。会爆体积的是**引三方库**。

---

## 10. 许可证与记账

- Nib 自身：**MIT**。
- 摘录的代码按上游许可保留声明；**Apache-2.0（moondown）部分**必须：
  - 附 `LICENSE`（Apache-2.0 全文）
  - 附 `NOTICE`，列明来源仓 + **改过哪些文件**
  - 文件头保留原版权声明

---

## 11. 关键风险与已定对策

| 风险 | 对策 |
|---|---|
| **中文 IME 崩**（组合输入期间重建 decoration 打断 composition） | 所有重建前查 `view.composing`（§4.1-4） |
| **光标漂移 / 点击跳** | 冻结机制（capture + 100ms 尾巴）（§4.1-2） |
| **布局抖动**（CLS） | 行高只由 CSS class 定；标记用空 replace（§4.1-1） |
| **跨行 replace 抛错** | `pushReplace` 按行拆段（§4.1-5） |
| **滚动卡顿 / iOS 动量中断** | 排除 `viewportChanged` 重建；全树一次走完（§4.1-3） |
| **表格/图片编辑时全量重算** | `renderBlockWidgets` 的窄失效（§4.1-6） |
| **抄 moondown 带进依赖** | 只复制函数体；`lucide` / `latex` / `mermaid` 一律不引（§8） |
| **体积超 200k** | 零第三方；图标自绘；盯 gzip（§9） |
| **宿主丢稿**（原 `mirror` 承担的 submit 兜底取消） | 宿主在 `submit` 时自己 `getMarkdown()` 刷一遍（§7） |

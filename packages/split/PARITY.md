# ByteMD parity 清单

> 目标：分屏要「像 ByteMD」，但「像」是个无底洞 —— 这份清单把**边界**钉死：
> 哪些是刻意的同等能力、哪些是**有意不同**（同一件事换了做法）、哪些是**不做**（附理由）。
> 判据只有一条：**单作者博客的写正文场景**够不够用；ByteMD 那些为「通用组件」付的税（插件体系、
> SSR、体积换功能）我们不跟。
>
> 另：ByteMD（`bytemd` v1，MIT，Svelte）是本仓的**参照物**，不是依赖 —— 一行代码也没抄进产物。

## 1. 对齐（同等能力）

| ByteMD                             | Quilldown split | 备注                                                                                    |
| ---------------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| `Editor` 两栏：源码 + 预览         | ✅              | 左栏源码、右栏预览，比例 1:1                                                            |
| `mode: 'split' \| 'tab' \| 'auto'` | ✅              | 同名同义；`auto` = 窄于 `tabBreakpoint`（默认 720）切单栏                               |
| 滚动同步（双向）                   | ✅              | 块级行锚点 + 回声抑制 + 折线插值（从 Inkwell git 历史移植）                             |
| 工具条默认动作集                   | ✅              | bold / italic / quote / code / codeBlock / link / image / ul / ol / heading(h1–h6) / hr |
| 选中就包、没选中插占位词并选中     | ✅              | 与 ByteMD 一致（`*Text` / `*Item` 那批文案键也照抄）                                    |
| `previewDebounce`                  | ✅              | 改名 `changeDebounceMs`（与 `@quilldown/wysiwyg` 同名，默认 300ms）                     |
| `placeholder`                      | ✅              | `<textarea>` 原生 `placeholder`                                                         |
| `locale` / 覆盖文案                | ✅              | `locale: 'en' \| 'zh'` + `strings` 逐键覆盖（键名照抄 ByteMD 的 locale JSON）           |
| `uploadImages`                     | ✅              | 契约叫 `upload`（`UploadFn`）：配了就出文件选择，没配就插 `![alt](https://)` 骨架       |
| Markdown → HTML                    | ✅ **更强**     | 落库 HTML 恒由 `@quilldown/core` 产出（GFM + Prism 13 语言），**与 wysiwyg 逐字节一致** |
| 默认安全（XSS）                    | ✅              | 原始 HTML 一律转义（core 口径），宿主再叠一层 sanitize 也不冲突                         |
| 官方 GFM 插件                      | ✅ **内置**     | 表格 / 删除线 / 任务列表 / 自动链接在 core 里，不需要插件                               |
| 官方 highlight 插件                | ✅ **内置**     | Prism 在 core 里；着色 CSS 归宿主（CONTRACT §6）                                        |
| 无框架/无运行时依赖                | ✅              | 原生 DOM + 原生 `<textarea>`，零 UI 框架                                                |

## 2. 有意不同（同一件事，换了做法）

| ByteMD                                                 | 这里                                  | 为什么                                                                                                                                                                   |
| ------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 源码栏 = CodeMirror                                    | **原生 `<textarea>`**                 | 省掉一整个编辑器内核的体积 / 主题 / 快捷键 / IME 处理；撤销栈、输入法、拖放、拼写检查都是浏览器白送的。代价是「源码栏没有语法高亮」—— 分屏那栏本来就是看 markdown 原文的 |
| 标题 = 弹出菜单                                        | **原生 `<select>`**                   | 少一套「点外部关 / Esc 关 / 键盘导航」的状态机；宿主样式直接生效                                                                                                         |
| 工具条图标 = 内联 SVG（ByteMD 同款做法）               | 内联 SVG（**自绘几何形**）            | 不引图标字体 / 图标包（否则宿主漏引 = 一排空白方框，还不报错）                                                                                                           |
| 版式切换 = 工具条上的「write only / preview only」动作 | `mode` 选项 + 单栏时的**写/预览页签** | 版式是宿主决定的事（页面宽度），不该混进「格式」工具条                                                                                                                   |
| `editorConfig`（CodeMirror 配置）                      | 无                                    | 没有 CodeMirror；`changeDebounceMs` / `mode` / `toolbar` 就是全部旋钮                                                                                                    |
| `maxLength`                                            | 无                                    | 长度约束是**业务规则**，归宿主的模型层（这里砍掉一半还会静默丢输入）                                                                                                     |
| 状态栏（字数 / 行数）                                  | 无                                    | 宿主两行代码就能算；库不该为它多维护一个 DOM                                                                                                                             |
| `Viewer` 组件（只读渲染）                              | 无                                    | 只读渲染 = `core.renderHtml()` + 宿主自己的正文样式，不需要第二个组件                                                                                                    |

## 3. 不做（附理由，免得以后再问一遍）

| ByteMD                                                       | 不做的理由                                                                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **插件体系**（remark / rehype / `actions` / `viewerEffect`） | 契约 §1：**core 是唯一产出 HTML 的地方**。开放插件 = 开放第二条产出路径，「两编辑器产出逐字节一致」当场作废。要新语法就改 core（一处） |
| `plugin-math` / `plugin-mermaid` / `plugin-gemoji`           | 数学 / 图形 / 表情码：单作者博客用不上；真要用也是 core 的事（换渲染器），不是在编辑器里挂插件                                         |
| `plugin-breaks`（单换行 = `<br>`）                           | core 冻结口径是 `breaks: 关`（CONTRACT §6），改了会让**已落库**的正文换个样子                                                          |
| `plugin-frontmatter`                                         | frontmatter 是**数据**，该在保存时被解析进字段，不是渲染成正文                                                                         |
| `plugin-medium-zoom`                                         | 图片灯箱是**前台**的事（读侧），跟写侧编辑器无关                                                                                       |
| 全屏动作                                                     | 宿主布局的事（E7 里由宿主决定编辑器占多高）                                                                                            |
| 帮助 / Markdown 速查弹窗                                     | 文案与排版是宿主的；库不自带头像弹层                                                                                                   |
| 目录（TOC）动作                                              | 分屏的右栏就是全文；wysiwyg 那边有浮动大纲（读侧锚点靠 core 的标题 `id`）                                                              |
| SSR 兼容                                                     | 库的两款编辑器都是**浏览器端**产物（contenteditable / textarea）。真要 SSR，渲染那一半是纯函数 `core.renderHtml` —— 已经 SSR 友好了    |
| 旧浏览器（IE9+ / ES5 产物）                                  | 目标环境是现代浏览器（`ES2022`）；再压一份 ES5 产物 = 双份维护                                                                         |
| React / Vue / Svelte 包装                                    | 契约是**框架无关的 JS API**（`create(mount, opts)`）；包装件谁要谁写，不进本仓                                                         |

## 4. 验收口径（DoD）

- 同等能力那栏：库仓单测覆盖（`packages/split/test/`：工具条动作逐条、锚点映射、表单字段镜像、往返幂等、产物守卫）。
- 两栏同步滚动：`packages/host-example/split.html`（`npm run dev -w @quilldown/host-example`）——
  这个要**人眼**看一眼（jsdom 量不出布局，几何那半测不了）。
- 与 wysiwyg 的一致性：`getHtml()` 相等（同一个 `renderHtml`），由 `adapter.test.ts` 焊住。

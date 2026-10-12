/**
 * 内置 UI 文案的本地化（fork 新增）。
 *
 * 上游把英文写死在预设 / 插件 / UI 组件里。这里**不改字面量**，而是让可见文案
 * 统一过 `t()`：注册表装配（`resolvePlugins`）翻条目，各 UI 组件在构造时翻自己那几条。
 *
 * 译文与既有 `packages/wysiwyg/locales/zh.tsv`（旧机制：构建期替换 vendor 产物）**逐条对齐**，
 * 所以切到本机制不会造成中文回归；`tests/i18n.test.ts` 保证「字典不遗漏注册表条目」。
 *
 * 词条键 = 上游英文原文（**逐字**，含双空格 / 全角引号）。`en` 不需要表：查不到即回落原文。
 */

import type { EdodoPlugin } from "./types.js";

export type Locale = "en" | "zh";

/** 英文原文 → 中文 */
const ZH: Record<string, string> = {
  // ── 分组 / 菜单标题 ───────────────────────────────────────────────────────
  "Basic blocks": "基本块",
  Media: "媒体",
  Advanced: "高级",
  Actions: "操作",
  "Turn into": "转换为",
  Blocks: "块",

  // ── 斜杠菜单（title / hint）───────────────────────────────────────────────
  Text: "正文",
  "Plain paragraph": "普通段落",
  "Large section title": "大节标题",
  "Medium heading": "中号标题",
  "Small heading": "小号标题",
  "Sub-sub heading": "更小一级的标题",
  "Rarely needed": "很少用到",
  "The smallest heading": "最小的标题",
  "A simple bullet list": "无序要点列表",
  "A numbered list": "按序号排列",
  "Track tasks with checkboxes": "用复选框跟踪任务",
  "Capture a quote": "摘录一段引用",
  "Fenced code block": "围栏代码块",
  "Visual separator": "视觉分隔",
  "Upload, paste, or embed from a URL": "上传 / 粘贴 / 填 URL",
  "3×3 table (Tab to move, Tab at the end adds a row)": "3×3 表格（Tab 跳格，末格 Tab 加一行）",

  // ── 块名（斜杠菜单 / 块菜单 / 工具条共用）─────────────────────────────────
  "Heading 1": "一级标题",
  "Heading 2": "二级标题",
  "Heading 3": "三级标题",
  "Heading 4": "四级标题",
  "Heading 5": "五级标题",
  "Heading 6": "六级标题",
  "Bulleted list": "无序列表",
  "Numbered list": "有序列表",
  "To-do list": "待办列表",
  Quote: "引用",
  "Code block": "代码块",
  Code: "代码",
  Divider: "分隔线",
  Image: "图片",
  Table: "表格",

  // ── 浮动工具条 ────────────────────────────────────────────────────────────
  "Bold  (⌘B)": "加粗  (⌘B)",
  "Italic  (⌘I)": "斜体  (⌘I)",
  Strikethrough: "删除线",
  "Inline code": "行内代码",
  "Link  (⌘K)": "链接  (⌘K)",

  // ── 块手柄 ────────────────────────────────────────────────────────────────
  "Insert block below": "在下方插入块",
  "Drag to move, click for menu": "拖拽移动，点击出菜单",

  // ── 块菜单动作 ────────────────────────────────────────────────────────────
  Duplicate: "创建副本",
  "Copy as Markdown": "复制为 Markdown",
  "Copied as Markdown": "已复制为 Markdown",
  "Copy failed": "复制失败",
  Delete: "删除",

  // ── 表格控件 ──────────────────────────────────────────────────────────────
  "Column options": "列选项",
  "Row options": "行选项",
  "Add column": "添加列",
  "Add row": "添加行",
  "Insert left": "左侧插入",
  "Insert right": "右侧插入",
  "Move left": "左移",
  "Move right": "右移",
  "Clear contents": "清空内容",
  "Delete column": "删除列",
  "Insert above": "上方插入",
  "Insert below": "下方插入",
  "Move up": "上移",
  "Move down": "下移",
  "Delete row (header is required)": "删除行（表头必需）",
  "Delete row": "删除行",

  // ── 链接气泡 ──────────────────────────────────────────────────────────────
  "Link URL": "链接地址",
  "Paste or type a link…": "粘贴或输入链接…",
  Save: "保存",
  Link: "插入链接",
  Open: "打开",
  Remove: "移除",

  // ── 图片气泡 ──────────────────────────────────────────────────────────────
  "Image URL": "图片地址",
  "Paste an image URL…": "粘贴图片链接…",
  "Alt text": "替代文本",
  "Describe the image (alt text)": "描述这张图（替代文本）",
  "Insert image": "插入图片",
  "Upload…": "上传…",

  // ── 提示 / 占位符 ─────────────────────────────────────────────────────────
  "Image upload failed": "图片上传失败",
  "Write something, or type “/” for commands…": "开始写点东西…（输入「/」唤出命令菜单）",
  Cancel: "取消",

  // ── 插件（默认未启用，先备好译文）──────────────────────────────────────────
  "Highlight  (⌘⇧H)": "高亮  (⌘⇧H)",
  Callout: "标注",
  "Highlighted note (> [!NOTE])": "高亮提示（> [!NOTE]）",
  "Warning callout": "警告标注",
  "Attention-grabbing warning": "醒目的警告",
  "Math block": "公式块",
  "Display TeX equation ($$)": "TeX 公式（$$）",
  "Rendering math…": "正在渲染公式…",
  Diagram: "图表",
  "Mermaid diagram": "Mermaid 图表",
  "Mermaid, hand-drawn": "Mermaid 手绘风",
  "Rendering diagram…": "正在渲染图表…",
  "edodo-draw (text to diagram)": "edodo-draw（文字转图表）",
  "Loading embed…": "正在加载嵌入内容…",
  Footnote: "脚注",
  "Insert a [^n] reference + definition": "插入 [^n] 引用与定义",
  File: "文件",
  "Attach a file": "附加文件",
  Toggle: "折叠块",
  "Collapsible details block": "可折叠的详情块",
  "Embed URL": "嵌入 URL",
};

const DICTS: Partial<Record<Locale, Record<string, string>>> = { zh: ZH };

let current: Locale = "en";

/** 设置当前语言（`en` / 未知值 = 原文） */
export function setLocale(locale: string | undefined): void {
  current = locale === "zh" ? "zh" : "en";
}

export function getLocale(): Locale {
  return current;
}

/** 翻译一条内置文案；查不到 / 非 zh 时**原样返回英文**（不会出现空串） */
export function t(text: string): string {
  return DICTS[current]?.[text] ?? text;
}

/** 条目上可翻译的字段 */
interface LocalizableItem {
  title?: string;
  hint?: string;
  group?: string;
  label?: string;
  busyText?: string;
}

function localizeItems<T extends LocalizableItem>(items: T[] | undefined): T[] | undefined {
  if (!items) return items;
  return items.map((item) => {
    const next = { ...item };
    if (next.title !== undefined) next.title = t(next.title);
    if (next.hint !== undefined) next.hint = t(next.hint);
    if (next.group !== undefined) next.group = t(next.group);
    if (next.label !== undefined) next.label = t(next.label);
    if (next.busyText !== undefined) next.busyText = t(next.busyText);
    return next;
  });
}

/** 把一个插件的条目文案过一遍字典（注册表装配时调用） */
export function localizePlugin(plugin: EdodoPlugin): EdodoPlugin {
  return {
    ...plugin,
    slashItems: localizeItems(plugin.slashItems),
    toolbarItems: localizeItems(plugin.toolbarItems),
    blockMenuItems: localizeItems(plugin.blockMenuItems),
  };
}

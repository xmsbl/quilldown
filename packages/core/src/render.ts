import { Marked, type Renderer, type RendererObject, type Tokens } from "marked";

import { escapeHtml, htmlToText } from "./html";
import { prismGrammar } from "./languages";
import Prism from "./prism";
import { createSlugger } from "./slug";

/** 自定义语法高亮（默认走内置 Prism）；返回 `undefined` = 交给默认转义（= 不高亮） */
export type Highlight = (code: string, language: string) => string | undefined;

export interface RenderOptions {
  /** 覆盖内置 Prism 高亮（宿主想换主题 / 换高亮器时用；输出必须是**已转义**的 HTML） */
  highlight?: Highlight;
}

/** 默认高亮：只处理收录语言（`language-x` 里的 `x` 直接查 Prism 语法表，别名由 Prism 登记） */
const prismHighlight: Highlight = (code, language) => {
  const grammar = language ? prismGrammar(language) : undefined;
  if (!grammar) return undefined;

  try {
    return Prism.highlight(code, grammar, language);
  } catch {
    // 单个代码块高亮失败（语法边界 bug）不许炸掉整篇正文 → 回退纯转义
    return undefined;
  }
};

/**
 * 渲染器 —— 落库 HTML 的**唯一**产出者（契约 v1 硬规则）。
 *
 * 只用普通对象覆盖**已存在的三个方法**：marked 对未知方法名直接抛错，
 * 而 class 实例的私有字段会成为 renderer 的自有属性、被当成「新方法」→ 所以不用 class。
 *
 * 两条与正文安全相关的口径：
 *  · 原始 HTML **一律转义**（`<script>` 进来只显示成文字 —— 等价于服务端的 `DisableHtml`）；
 *  · 标题带 `id` 锚点（前台目录靠它跳转），同名标题追加 `-1` / `-2`。
 */
function buildRenderer(slug: (text: string) => string, highlight: Highlight): RendererObject {
  return {
    /** 原始 HTML token（块级 + 行内都走这里）→ 转义 */
    html({ text }: Tokens.HTML | Tokens.Tag): string {
      return escapeHtml(text);
    },

    heading(this: Renderer, { tokens, depth }: Tokens.Heading): string {
      const inner = this.parser.parseInline(tokens);
      const id = slug(htmlToText(inner));

      return `<h${depth} id="${escapeHtml(id)}">${inner}</h${depth}>\n`;
    },

    code({ text, lang, escaped }: Tokens.Code): string {
      // 围栏信息串可能带额外参数（```js title=demo）→ 只取第一个词当语言
      const language = (lang ?? "").trim().split(/\s+/)[0] ?? "";
      const klass = language ? ` class="language-${escapeHtml(language)}"` : "";
      // `escaped` = 该 token 上游已转义过（Prism 再跑一遍会二次转义 `&amp;`）→ 直接放行
      const body = escaped ? text : (highlight(text, language) ?? escapeHtml(text));

      return `<pre><code${klass}>${body}</code></pre>\n`;
    },
  };
}

/**
 * Markdown → HTML（GFM：表格 / 删除线 / 任务列表 / 自动链接；`breaks` 关 —— 与迁移前一致）。
 * 无状态纯函数：同一份 md 恒产出同一份 HTML（「两编辑器产出逐字节一致」的前提）。
 * 每次调用建一套 renderer / slugger（锚点去重表不能跨文档复用）。
 */
export function renderHtml(md: string, options: RenderOptions = {}): string {
  const renderer = buildRenderer(createSlugger(), options.highlight ?? prismHighlight);
  const parser = new Marked({ gfm: true, breaks: false, async: false, renderer });

  // marked 的类型收不窄实例选项（`async: false` 恒同步）→ 只有这一处断言
  return parser.parse(md ?? "") as string;
}

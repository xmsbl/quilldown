import "./core.js";

// ③ 官方语言组件 —— 静态 import 的**书写顺序即求值顺序**（`./core` 已把全局换成我们那份 Prism 实例）。
// 依赖方向：csharp ← clike、typescript ← javascript、markdown ← markup —— 上面三者由 prismjs 本体提供，
// 所以这 9 个之间没有互相依赖。加语言 = 本文件加 import + `src/languages.ts` 的冻结表加名（两侧必须同批改）。
// ⚠ 必须带 `.js`：prismjs 无 `exports` 字段，打到 dist 的 ESM 里若写成无扩展名，
// 打包器能解析、但 **Node 直接 import 会 ERR_MODULE_NOT_FOUND**。
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-python.js";
import "prismjs/components/prism-sql.js";
import "prismjs/components/prism-csharp.js";
import "prismjs/components/prism-yaml.js";
import "prismjs/components/prism-markdown.js";
import "prismjs/components/prism-diff.js";

export {};

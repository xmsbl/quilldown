import "./core.js";

// ③ 官方语言组件 —— 静态 import 的**书写顺序即求值顺序**（`./core` 已把全局换成我们那份 Prism 实例）。
// 依赖方向：csharp ← clike、typescript ← javascript、markdown ← markup —— 上面三者由 prismjs 本体提供，
// 所以这 9 个之间没有互相依赖。加语言 = 本文件加 import + `src/languages.ts` 的冻结表加名（两侧必须同批改）。
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-diff";

export {};

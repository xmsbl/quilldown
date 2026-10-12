/**
 * ① 预置全局 `Prism` 占位 —— **必须排在 prismjs 求值之前**。
 *
 * prism 核心在浏览器里读 `globalThis.Prism.manual` 决定「要不要在 DOMContentLoaded 扫全站做自动高亮」：
 * 本库只按需渲染、**不碰宿主 DOM**，所以先占位把 `manual` 立起来。
 * （等价于在 `<script>` 上写 `data-manual`；库没有自己的 script 标签，只能靠全局占位。）
 */
// `as unknown as`：`@types/prismjs` 把 `Prism` 声明成了 UMD 全局（`globalThis.Prism` 已带类型），
// 这里要的是一个「还不完整的占位对象」，跟那个类型不相容，只能绕过。
const scope = globalThis as unknown as { Prism?: { manual?: boolean } };

scope.Prism = { manual: true };

export {};

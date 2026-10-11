/** katex 桩：edodo 原件里有 `import("katex")` 的懒加载（数学公式），单测环境不需要真渲染。 */
export default {
  render: () => undefined,
  renderToString: () => "",
};

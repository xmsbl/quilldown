/** edododraw 桩：edodo 原件的绘图插件懒加载（`import("edododraw")`），单测环境不需要真绘图。 */
export class EdodoDraw {
  constructor(..._args: unknown[]) {
    void _args;
  }
  destroy(): void {
    // no-op
  }
}

/**
 * 占位守卫（中文输入法）：edodo 的占位有两处 —— 空文档的 `.ew-content--empty::before`
 * （`isEmpty()` 只看**已进 DOM 的文本**）与空段落的 `.ew-block-empty::before`
 * （只在 selection 事件里重算）。组字缓冲里的字**已经在 DOM 里**，但这两处判据都不重跑 →
 * 占位原地不动、和组字串叠字（文档以表格 / 图片开头时，尾巴上那个空段落尤其明显）。
 *
 * 库内部改不了：组字期间整体压掉（`.is-composing`，样式见同包 `styles.css`）＋ 按 DOM 文本
 * 清陈旧标记（判早了无所谓 —— 下一个 selection 事件会把该有的补回来）。
 */
export function bindPlaceholder(mount: HTMLElement): () => void {
  const content = (): HTMLElement | null => mount.querySelector(".ew-content");
  const composing = (on: boolean): void => {
    content()?.classList.toggle("is-composing", on);
  };
  const strip = (): void => {
    const el = content();
    if (!el) return;
    for (const block of el.querySelectorAll(".ew-block-empty")) {
      if (block.textContent?.trim() !== "") block.classList.remove("ew-block-empty");
    }
  };

  const onStart = (): void => composing(true);
  const onInput = (): void => strip();
  const onEnd = (): void => {
    composing(false);
    strip();
  };

  mount.addEventListener("compositionstart", onStart);
  mount.addEventListener("input", onInput);
  mount.addEventListener("compositionend", onEnd);
  return () => {
    mount.removeEventListener("compositionstart", onStart);
    mount.removeEventListener("input", onInput);
    mount.removeEventListener("compositionend", onEnd);
  };
}

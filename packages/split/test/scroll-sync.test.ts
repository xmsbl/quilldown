import { describe, expect, it } from "vitest";

import { interpolateMap } from "../src/index";

/**
 * 折线插值是滚动同步里**唯一**「错了也不报错」的一段：映射一错位，预览就跟着源文乱跳。
 * 所以这里逐条焊住三条口径：端点钉死 / 同行只留第一个 / 偏移回退要拉平。
 */
describe("interpolateMap", () => {
  it("锚点之间线性插值，首尾钉死", () => {
    const map = interpolateMap([{ line: 5, offset: 50 }], 10, 100);

    expect(map.length).toBe(11);
    expect(map[0]).toBe(0);
    expect(map[5]).toBe(50);
    expect(map[10]).toBe(100);
    expect(map[3]).toBe(30); // 0 行 → 5 行之间按比例
    expect(map[7]).toBe(70); // 5 行 → 末行之间按比例
  });

  it("同行锚点只留第一个（嵌套块共享行；不去重就整体错位）", () => {
    // `ul` 与它的第一个 `li`、`blockquote` 与内层 `p` 都报同一行
    const map = interpolateMap(
      [
        { line: 2, offset: 10 },
        { line: 2, offset: 40 },
        { line: 6, offset: 60 },
      ],
      6,
      100,
    );

    expect(map[2]).toBe(10); // 不是 40
  });

  it("偏移回退时拉平（测量偶尔回退 → 保证单调不减）", () => {
    const map = interpolateMap(
      [
        { line: 1, offset: 50 },
        { line: 2, offset: 20 },
      ],
      2,
      30,
    );

    expect([...map]).toEqual([0, 50, 50]);
  });

  it("没有锚点（空文档 / 只有空行）不炸", () => {
    expect([...interpolateMap([], 0, 0)]).toEqual([0]);
    expect([...interpolateMap([], 3, 120)]).toEqual([0, 40, 80, 120]);
  });

  it("锚点乱序也能用（按行号排序后建表）", () => {
    const map = interpolateMap(
      [
        { line: 6, offset: 60 },
        { line: 2, offset: 20 },
      ],
      6,
      60,
    );

    expect(map[2]).toBe(20);
    expect(map[4]).toBe(40);
  });
});

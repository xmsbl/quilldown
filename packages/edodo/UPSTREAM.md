# edodo-write fork（内部包）

- 上游：https://github.com/vivmagarwal/edodo-write
- 基线：`master` @ `a7960a0`（v0.10.0，2026-10-12 取）
- 许可：MIT —— 保留上游 `LICENSE` 与原版权声明（`author: vivmagarwal`）
- 包名：`@xmsbl/quilldown-edodo`，`private: true`（**不发布**）

## 为什么 fork

上游只发「已构建产物」。我们要改的是**渲染管线**（Prism 高亮 / 标题 id / 行锚点）、**i18n**、以及**按需摇树**——这些只能动源码。

## 与上游的差异（每批改动记到这里）

- （待填）

## 同步上游

```bash
git clone --depth 1 https://github.com/vivmagarwal/edodo-write.git /tmp/edodo-src
```

对照基线 commit 手工 diff 后搬进来；改动越集中在少数文件，重放越省事。

## 目录

| 路径 | 内容 |
| --- | --- |
| `src/core/**` | 编辑器内核（parse / serialize / sanitize / editor / ui / keymap …） |
| `src/lib/**` | 对外入口（`index` / `parse-api` / `testing` …） |
| `src/plugins/**` | 插件（math / emoji / embeds / diagram …）；**没 import 的会被下游摇掉** |
| `tests/**` | 上游单测 |
| `dist-lib/` | 构建产物（ESM 多入口，**node_modules 依赖不打包**） |

**已剔除**（相对上游）：`src/site`（React 演示站）、`src/main.tsx`、`src/e2e`、`src/lib/react.tsx`、`tests/e2e`、`tests/react.test.tsx`、`tests/llms-txt.test.ts`、`tests/docs-examples.test.ts`（依赖上游 README/docs）。

## 构建 / 测试

```bash
npm run build -w @xmsbl/quilldown-edodo   # vite lib → dist-lib/ + .d.ts
npm run test  -w @xmsbl/quilldown-edodo
```

消费方（`wysiwyg`）把它**打进自己的产物**，所以本包 `private`、不进 npm。

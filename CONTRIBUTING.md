# Contributing

> Best-effort project — PR 会被看，但没有 SLA。

## 开发环境

1. Node LTS（`>=20`）。
2. `npm ci`
3. `npm run ci`（= lint + format:check + build + typecheck + test + lint:pkg）必须全绿。
   · `lint:pkg` = publint + are-the-types-wrong（`--profile esm-only`，先 `npm pack` 再体检）。
   · 改了源码的**相对导入**记得带 `.js` 扩展名（`./foo.js`）—— d.ts 要能在 Node16 ESM 下解出，
   否则 attw 报 `internal-resolution-error`；构建器自己会把 `.js` 映回 `.ts`。

## 规矩

- **契约优先**：改 `CONTRACT.md` 里冻结的东西（编程接口 / DOM 标记 / 语义）必须：
  1. 同时改 `CONTRACT.md` 与 `packages/core` 的 `CONTRACT_VERSION`；
  2. 升契约版本号（破坏性改动才升）；
  3. 在同一个 PR 里改完 `host-example`（契约的可执行版）。
- **HTML 只在 `core` 产出**：编辑器包不许自己拼落库 HTML。
- 提交前跑 `npm run format`；CI 会查 `format:check`。
- 一个 PR 一个目标，别混重构与功能。

## 提交信息

`<scope>: <what>`，scope 用包名（`core` / `wysiwyg` / `split` / `host-example` / `repo`）。

## 发布

三个发布包（`core` / `wysiwyg` / `split`）**同一个版本号**、同一个 tag 发车；`host-example` 是
`private`，不发布。

1. 改三个 `packages/*/package.json` 的 `version`（semver，当前线 `0.x`；契约版本另算，见 `CONTRACT.md` §5）。
2. 本地 `npm run ci` 全绿（`lint:pkg` 会走真 `npm pack` 体检）。
3. `npm i` 刷新 `package-lock.json`（内部依赖范围写 `^0.x.0`，靠 workspaces 本地链接）。
4. 推 tag `v0.x.0` → `.github/workflows/release.yml` 跑 `npm publish --workspaces --access public --provenance`。
   · 前置：仓库 Secrets 配 `NPM_TOKEN`（npm Automation token，写权限）。
   · provenance 需要**公开**仓库 + `id-token: write`；仓库不公开时去掉 `--provenance`。
5. 手工首发（没配 CI 时）：`npm login` 后 `npm publish --workspaces --access public`。
   · 发布顺序：`core` 先（另两个依赖它）；`npm publish --workspaces` 已按拓扑排序。

**纯 ESM**：三个包都只出 `import` 条件（无 CJS 产物），这是有意的 —— CJS 消费者用动态 `import()`。

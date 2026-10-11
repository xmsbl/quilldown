# Contributing

> Best-effort project — PR 会被看，但没有 SLA。

## 开发环境

1. Node LTS（`>=20`）。
2. `npm ci`
3. `npm run ci`（= lint + format:check + typecheck + test + build）必须全绿。

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

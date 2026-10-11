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
4. 推 tag `v0.x.0` → `.github/workflows/release.yml` 跑 `npm publish --workspaces --access public`
   （`--workspaces` 跳过 `private` 的 `host-example`，并按拓扑序先发 `core`）。

### 认证（2025-11 起只剩两条路，legacy / Automation token 已移除）

- **trusted publishing（首选）**：npmjs.com → 包 → Settings → Trusted publishing → GitHub Actions，
  填 `xmsbl` / `quilldown` / `release.yml`（并勾上 **Allow `npm publish`**，否则只会静默 stage —— 只允许 stage 时
  `npm publish` 会「成功」但只进暂存，registry 上看不到），**三包各配一次**。要求 **npm CLI ≥ 11.5.1 + Node ≥ 22.14 + 公开仓**；
  OIDC 自动换取短期发布令牌，provenance 也自动生成（不用写 `--provenance`），**不需要任何 Secret**。
  · ⚠ **已有连接不可修改**（字段写错了只能删掉重建）。
  · ⚠ **首发只能手工**：包在 registry 上还不存在 → 配不了 trusted publisher。
  · ⚠ 配置建好后 **2 天内必须完成首次成功发布**，否则过期（只能删掉重建）。
  · ⚠ 发布后**别马上查 registry** —— 传播延迟可达数分钟（刚 publish 完是 404 / 缺版本号，不代表失败）。
  · ⚠ 发布时校验 `repository.url` 与仓库一致（本仓已填 `git+https://github.com/xmsbl/quilldown.git`）。
- **Granular access token（备选）**：建 token 时选 **Read and write（publish and stage）** +
  **Bypass 2FA = true**；否则 `npm publish` 报 `E_STAGE_REQUIRED`（那种 token 只能 `npm stage publish`，
  要维护者二次 2FA 批准）。存成仓库 Secrets 的 `NPM_TOKEN`，并在 workflow 里补 `env: NODE_AUTH_TOKEN`。

首发（手工，一次性）：`npm login` → `npm publish --workspaces --access public`。
发完之后建议在包设置里选 **Require two-factor authentication and disallow tokens**。

**纯 ESM**：三个包都只出 `import` 条件（无 CJS 产物），这是有意的 —— CJS 消费者用动态 `import()`。

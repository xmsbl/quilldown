# Contributing

Best-effort project. PRs are read; there is no SLA.

## Setup

```bash
npm ci
npm run ci   # must pass: lint + format:check + build + typecheck + test + lint:pkg
```

Run `npm run format` before committing.

## Rules

- **Contract first.** Changing anything frozen in `docs/CONTRACT.md` (API, DOM markers, semantics)
  means: update `docs/CONTRACT.md` **and** `CONTRACT_VERSION` in `packages/core`, bump the contract
  version, and fix `examples/` in the same PR.
- **HTML is produced in `core` only.** Editor packages must not build output HTML.
- One PR, one goal.

## Commits

`<scope>: <what>`, scope = `core` / `wysiwyg` / `split` / `repo`.

## Release

`core` / `wysiwyg` / `split` share one version and one tag. Bump the three `package.json` files, run
`npm run ci`, refresh `package-lock.json`, then push tag `vX.Y.Z` — `release.yml` publishes via npm
trusted publishing (OIDC).

# @xmsbl/quilldown-edodo

Fork of [edodo-write](https://github.com/vivmagarwal/edodo-write) (MIT, upstream `a7960a0` / v0.10.0), kept as the internal WYSIWYG engine of [Quilldown](https://github.com/xmsbl/quilldown).

**Do not install this directly** — use `@xmsbl/quilldown-wysiwyg`, which depends on it and wires the styles, i18n and toolbar for you.

Fork delta (see `UPSTREAM.md` for the full list): the render/parse/sanitize layer now points at `@xmsbl/quilldown-render`, UI strings moved into source (`src/core/i18n.ts`, `locale` option), publishing metadata added, and the upstream demo/e2e/react sites dropped. Version numbers here are independent of upstream's.

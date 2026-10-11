import "./seed";

import Prism from "prismjs";

/**
 * ② prismjs 本体：自带 markup / css / clike / javascript（+ `html` / `js` 等别名）。
 *
 * 官方组件文件（`prism-*.js`）以**全局** `Prism` 为宿主 —— 浏览器里 prismjs 自己就会挂 `window.Prism`，
 * 但 node（单测）下它挂在一个临时对象上，所以这里显式补齐：组件才会注册到我们这一份实例上。
 * （`import "./seed"` 已在求值顺序上先跑完：prismjs 读得到 `manual: true`，不自动扫全站。）
 */
const scope = globalThis as typeof globalThis & { Prism?: typeof Prism };

scope.Prism = Prism;

export default Prism;

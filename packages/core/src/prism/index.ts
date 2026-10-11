import Prism from "./core";
import "./components";

/**
 * 库自带的那份 Prism（语言集见 `PRISM_LANGUAGES`）。
 * ⚠ 求值顺序即 `./core` → `./components`，改顺序 = 语法注册不到本实例上（高亮静默失效）。
 */
export default Prism;

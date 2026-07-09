import { parse, compileTemplate, compileScript, babelParse } from '@vue/compiler-sfc';
import * as Vue from 'vue';

export function compileVue(code: string) {
  if (!code) return '';
  try {
    const parseValue = parse(code, {});
    /**模版解析 */
    const templatedata = compileTemplate({
      source: parseValue.descriptor.template.content,
    });
    const render = Babel.transform(templatedata.code, {
      presets: ['env'],
      comments: false,
    }).code.replace(`var _vue = require("vue");`, '');
    /**js 解析 */
    const jsstr = parseValue.descriptor.script.content;
    const js = Babel.transform(jsstr, {
      presets: ['env'],
      comments: false,
    }).code;
    return JSON.stringify({ js, render });
  } catch (error) {
    return '';
  }
}

/**转化 字符串vue 组件 */
export function getVueComponentByCode(comStr) {
  try {
    const exports = {
      default: {},
    };
    const { js, render } = JSON.parse(comStr);
    const fun = new Function('exports', js);
    const renderFun = new Function('exports', '_vue', render);
    fun(exports);
    renderFun(exports.default, Vue);
    /**检查data是否合法 */
    exports.default.data && exports.default.data();
    return exports.default;
  } catch (error) {
    return {};
  }
}

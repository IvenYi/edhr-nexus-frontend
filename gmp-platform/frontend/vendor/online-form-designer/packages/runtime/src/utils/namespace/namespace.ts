export const defaultNamespace = 'gct';
const statePrefix = 'is-';

/**
 * css bem 命名规则拼接
 * _bem('gct', 'layout') => gct-layout
 * _bem('gct', 'layout', '', 'title') => gct-layout__title
 * _bem('gct', 'layout', '', '', 'right') => gct-layout--right
 * _bem('gct', 'layout', '', 'title', 'right') => gct-layout__title--right
 * _bem('gct', 'layout', 'header', 'title', 'right') => gct-layout-header__title--right
 *
 * @author zhanghanrui
 * @date 2024-03-19 21:03:04
 * @param {string} namespace 命名空间
 * @param {string} block 块
 * @param {string} blockSuffix 块后缀
 * @param {string} element 元素
 * @param {string} modifier 修饰符
 * @return {*}  {string}
 */
function _bem(
  namespace: string,
  block: string,
  blockSuffix?: string,
  element?: string,
  modifier?: string,
): string {
  let cls = `${namespace}-${block}`;
  if (blockSuffix) {
    cls += `-${blockSuffix}`;
  }
  if (element) {
    cls += `__${element}`;
  }
  if (modifier) {
    cls += `--${modifier}`;
  }
  return cls;
}

/**
 * 全局样式处理命名空间
 *
 * @author zhanghanrui
 * @date 2024-03-19 21:03:59
 * @export
 * @class Namespace
 */
export class Namespace {
  /**
   * 命名空间
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:04
   * @type {string}
   */
  readonly namespace: string;

  /**
   * Creates an instance of Namespace.
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:11
   * @param {string} block 当前命名空间的根模块,例如组件的名称
   * @param {string} [namespace] 指定命名空间，未指定使用默认值 gct
   */
  constructor(protected block: string, namespace?: string) {
    this.namespace = namespace || defaultNamespace;
  }

  /**
   * namespace-block
   * namespace-block-blockSuffix
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:31
   * @param {string} [blockSuffix='']
   * @return {*}  {string}
   */
  b(blockSuffix = ''): string {
    return _bem(this.namespace, this.block, blockSuffix, '', '');
  }

  /**
   * namespace-block__element
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:38
   * @param {string} [element]
   * @return {*}  {string}
   */
  e(element?: string): string {
    return element ? _bem(this.namespace, this.block, '', element, '') : '';
  }

  /**
   * namespace-block--modifier
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:44
   * @param {string} [modifier]
   * @return {*}  {string}
   */
  m(modifier?: string): string {
    return modifier ? _bem(this.namespace, this.block, '', '', modifier) : '';
  }

  /**
   * namespace-block-blockSuffix__element
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:50
   * @param {string} [blockSuffix]
   * @param {string} [element]
   * @return {*}  {string}
   */
  be(blockSuffix?: string, element?: string): string {
    return blockSuffix && element ? _bem(this.namespace, this.block, blockSuffix, element, '') : '';
  }

  /**
   * namespace-block__element--modifier
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:56
   * @param {string} [element]
   * @param {string} [modifier]
   * @return {*}  {string}
   */
  em(element?: string, modifier?: string): string {
    return element && modifier ? _bem(this.namespace, this.block, '', element, modifier) : '';
  }

  /**
   * namespace-block-blockSuffix--modifier
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:02
   * @param {string} [blockSuffix]
   * @param {string} [modifier]
   * @return {*}  {string}
   */
  bm(blockSuffix?: string, modifier?: string): string {
    return blockSuffix && modifier
      ? _bem(this.namespace, this.block, blockSuffix, '', modifier)
      : '';
  }

  /**
   * namespace-block-blockSuffix__element--modifier
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:10
   * @param {string} [blockSuffix]
   * @param {string} [element]
   * @param {string} [modifier]
   * @return {*}  {string}
   */
  bem(blockSuffix?: string, element?: string, modifier?: string): string {
    return blockSuffix && element && modifier
      ? _bem(this.namespace, this.block, blockSuffix, element, modifier)
      : '';
  }

  /**
   * 返回状态 class
   *
   * is('loading', false) => '';
   * is('loading', true) => 'is-loading';
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:18
   * @param {string} name
   * @param {boolean} [state]
   * @return {*}  {string}
   */
  is(name: string, state?: boolean): string {
    return name && state ? `${statePrefix}${name}` : '';
  }

  /**
   * 生成使用到的 css 变量 style 对象
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:26
   * @param {Record<string, string>} object
   * @return {*}  {Record<string, string>}
   */
  cssVar(object: Record<string, string>): Record<string, string> {
    const styles: Record<string, string> = {};
    for (const key in object) {
      if (object[key]) {
        styles[this.cssVarName(key)] = object[key];
      }
    }
    return styles;
  }

  /**
   * 生成使用到的 css block 变量 style 对象
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:35
   * @param {Record<string, string>} object
   * @return {*}  {Record<string, string>}
   */
  cssVarBlock(object: Record<string, string>): Record<string, string> {
    const styles: Record<string, string> = {};
    for (const key in object) {
      if (object[key]) {
        styles[this.cssVarBlockName(key)] = object[key];
      }
    }
    return styles;
  }

  /**
   * 生成 css var 变量名称
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:41
   * @param {string} name
   * @return {*}  {string}
   */
  cssVarName(name: string): string {
    return `--${this.namespace}-${name}`;
  }

  /**
   * 生成块 css var 变量名称
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:46
   * @param {string} name
   * @return {*}  {string}
   */
  cssVarBlockName(name: string): string {
    return `--${this.namespace}-${this.block}-${name}`;
  }
}

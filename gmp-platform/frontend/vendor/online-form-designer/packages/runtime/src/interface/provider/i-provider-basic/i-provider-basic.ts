/**
 * 适配器基础接口
 *
 * @author zhanghanrui
 * @date 2024-04-01 13:04:58
 * @export
 * @interface IProviderBasic
 */
export interface IProviderBasic {
  /**
   * 具体组件或者组件名称
   *
   * @author zhanghanrui
   * @date 2024-03-27 10:03:05
   * @type {*}
   */
  component?: any;
  /**
   * 绘制
   *
   * @author zhanghanrui
   * @date 2024-03-27 10:03:41
   */
  render?: (...args) => any;
}

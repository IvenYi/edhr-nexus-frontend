/**
 * 全局呈现容器
 *
 * @author zhanghanrui
 * @date 2024-03-19 18:03:21
 * @export
 * @interface IOverlayContainer
 */
export interface IOverlayContainer {
  /**
   * 展示容器
   *
   * @author zhanghanrui
   * @date 2024-03-19 18:03:02
   * @return {*}  {Promise<void>}
   */
  present(): Promise<void>;

  /**
   * 关闭容器
   *
   * @author zhanghanrui
   * @date 2024-03-19 18:03:08
   * @param {unknown} [data]
   * @return {*}  {Promise<void>}
   */
  dismiss(data?: unknown): Promise<void>;

  /**
   * 等待容器关闭并返回返回值
   *
   * @author zhanghanrui
   * @date 2024-03-19 18:03:12
   * @template T
   * @return {*}  {Promise<T>}
   */
  onWillDismiss<T = unknown>(): Promise<T>;
}

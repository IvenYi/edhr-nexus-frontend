/**
 * 放置结果回执
 *
 * @export
 * @interface IDropResult
 */
export interface IDropResultData {
  /**
   * 放置分组标识
   *
   * @type {string}
   */
  group: string;
  /**
   * 是否成功放置
   *
   * @type {boolean}
   */
  success: boolean;
}

/**
 * 拖拽操作返回值
 *
 * @author zhanghanrui
 * @date 2024-07-08 19:07:51
 * @export
 * @interface IDropResult
 */
export interface IDropResult {
  /**
   * 放置异步沟通操作
   *
   * @type {Promise<IDropResultData>}
   */
  asyncDrop: Promise<IDropResultData>;
}

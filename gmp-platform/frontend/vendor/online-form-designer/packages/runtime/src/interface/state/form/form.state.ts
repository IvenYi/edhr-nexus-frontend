/**
 * 表单状态
 *
 * @author zhanghanrui
 * @date 2024-04-01 11:04:19
 * @export
 * @interface IFormState
 */
export interface IFormState {
  /**
   * 是否正在加载中
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-03 16:04:17
   * @type {boolean}
   */
  loading: boolean;

  /**
   * 数据变更不识别的补救措施
   *
   * @type {number}
   */
  count: number;

  /**
   * 是否已加载完成
   *
   * @author zhanghanrui
   * @date 2024-04-03 17:04:59
   * @type {boolean}
   */
  loaded: boolean;

  /**
   * 是否新建数据模式
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-04-03 14:04:01
   * @type {boolean}
   */
  isNew: boolean;

  /**
   * 是否已销毁
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-04-03 16:04:53
   * @type {boolean}
   */
  destroyed: boolean;

  /**
   * 表单数据（表单值，纯用于触发状态管理，需要值还是从项的控制器取）
   *
   * @author zhanghanrui
   * @date 2024-04-01 11:04:04
   * @type {IData}
   */
  data: IData;
}

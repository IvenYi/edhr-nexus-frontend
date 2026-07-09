/**
 * 模态打开界面，关闭时返回数据
 *
 * @author zhanghanrui
 * @date 2024-03-19 20:03:55
 * @export
 * @interface IModalData
 */
export interface IModalData<T = IData> {
  /**
   * 关闭模态窗时是否操作成功
   *
   * @author zhanghanrui
   * @date 2024-03-19 20:03:36
   * @type {boolean}
   */
  ok: boolean;
  /**
   * 是否直接关闭模态窗
   *
   * @default true
   * @type {boolean}
   */
  close?: boolean;
  /**
   * 返回的数据
   *
   * @author zhanghanrui
   * @date 2024-03-19 20:03:44
   * @type {T[]}
   */
  data?: T[];
  /**
   * 额外参数
   *
   * @author zhanghanrui
   * @date 2024-03-19 20:03:49
   * @type {IParams}
   */
  params?: IParams;
}

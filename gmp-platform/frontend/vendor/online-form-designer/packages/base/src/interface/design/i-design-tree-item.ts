/**
 * 设计树项
 *
 * @author zhanghanrui
 * @date 2024-08-20 10:08:36
 * @export
 * @interface IDesignTreeItem
 */
export interface IDesignTreeItem {
  /**
   * 标识
   *
   * @author zhanghanrui
   * @date 2024-08-20 10:08:48
   * @type {string}
   */
  id: string;

  /**
   * 子项
   *
   * @author zhanghanrui
   * @date 2024-08-20 10:08:56
   * @type {IDesignTreeItem[]}
   */
  children?: IDesignTreeItem[];
}

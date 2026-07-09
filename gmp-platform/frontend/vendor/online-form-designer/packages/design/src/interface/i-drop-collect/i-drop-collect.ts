/**
 * 放置状态收集器
 *
 * @author zhanghanrui
 * @date 2024-07-05 15:07:13
 * @export
 * @interface IDropCollect
 */
export interface IDropCollect {
  /**
   * 拖拽元素标识
   *
   * @author zhanghanrui
   * @date 2024-07-05 15:07:30
   * @type {string}
   */
  handlerId: string;
  /**
   * 是否可以放置
   *
   * @author zhanghanrui
   * @date 2024-07-05 15:07:36
   * @type {boolean}
   */
  canDrop: boolean;
  /**
   * 是否只在单一元素放置
   *
   * @author zhanghanrui
   * @date 2024-07-05 15:07:47
   * @type {boolean}
   */
  isShallowOver: boolean;
  /**
   * 是否放置中
   *
   * @type {boolean}
   */
  isOver: boolean;
}

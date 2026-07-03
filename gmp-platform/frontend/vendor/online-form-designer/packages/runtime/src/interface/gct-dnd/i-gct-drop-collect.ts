/**
 * 放置时状态
 *
 * @export
 * @interface IGctDropCollect
 */
export interface IGctDropCollect {
  /**
   * 拖拽元素标识
   *
   * @type {string}
   */
  handlerId: string;
  /**
   * 是否可以放置
   *
   * @type {boolean}
   */
  canDrop: boolean;
  /**
   * 是否只在单一元素放置
   *
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

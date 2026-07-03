/**
 * 拖拽状态收集器
 *
 * @author zhanghanrui
 * @date 2024-07-05 15:07:01
 * @export
 * @interface IDragCollect
 */
export interface IDragCollect {
  /**
   * 是否可以拖拽
   *
   * @author zhanghanrui
   * @date 2024-07-05 15:07:20
   * @type {boolean}
   */
  canDrag: boolean;
  /**
   * 是否正在拖拽
   *
   * @author zhanghanrui
   * @date 2024-07-05 15:07:26
   * @type {boolean}
   */
  isDragging: boolean;
}

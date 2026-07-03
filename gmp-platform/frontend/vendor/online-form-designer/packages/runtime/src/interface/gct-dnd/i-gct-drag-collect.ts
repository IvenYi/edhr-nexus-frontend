/**
 * 拖拽时状态
 *
 * @export
 * @interface IGctDragCollect
 */
export interface IGctDragCollect {
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

import { ConnectDragSource, DragSourceOptions } from "vue3-dnd";

/**
 * 拖拽项绘制 props 参数
 *
 * @export
 * @interface IGctDndRenderItemOptions
 * @template T
 */
export interface IGctDndRenderItemOptions<T = IObject> {
  /**
   * 当前拖拽项开始拖拽时的索引
   *
   * @type {number}
   */
  index: number;
  /**
   * 拖拽数据
   *
   * @type {T}
   */
  data: T
  /**
   * 设置拖拽项的 DOM 元素
   *
   * @type {ConnectDragSource<DragSourceOptions>}
   */
  drag: ConnectDragSource<DragSourceOptions>;
}

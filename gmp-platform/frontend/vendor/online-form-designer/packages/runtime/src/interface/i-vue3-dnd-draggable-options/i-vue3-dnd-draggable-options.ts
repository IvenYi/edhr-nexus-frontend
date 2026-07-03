import {
  ConnectDragPreview,
  ConnectDragSource,
  DragPreviewOptions,
  DragSourceMonitor,
  DragSourceOptions,
  DropTargetMonitor,
  DropTargetOptions,
} from 'vue3-dnd';

/**
 * 拖拽绘制项参数
 *
 * @author zhanghanrui
 * @date 2024-08-20 16:08:30
 * @export
 * @interface IRenderOptions
 * @template O
 */
export interface IRenderOptions<O = unknown> {
  /**
   * 节点数据
   *
   * @author zhanghanrui
   * @date 2024-08-20 16:08:42
   * @type {O}
   */
  item: O;
  /**
   * 当前排序
   *
   * @author zhanghanrui
   * @date 2024-08-20 16:08:47
   * @type {number}
   */
  index: number;
  /**
   * 是否正在拖拽
   *
   * @author zhanghanrui
   * @date 2024-08-20 16:08:53
   * @type {boolean}
   */
  isDragging: boolean;
  /**
   * 是否悬浮于当前元素内，并且只有当前元素。多层悬浮时，以最底层触发此参数
   *
   * @author zhanghanrui
   * @date 2024-08-20 16:08:00
   * @type {boolean}
   */
  isShallowOver: boolean;
  /**
   * 是否在此元素上
   *
   * @author zhanghanrui
   * @date 2024-08-20 16:08:57
   * @type {boolean}
   */
  isOver: boolean;
  /**
   * 是否悬浮于此元素前半段（需要根据拖拽线方向，判断是上下还是左右）
   *
   * @author zhanghanrui
   * @date 2024-08-20 16:08:07
   * @type {boolean}
   */
  isBeforeHover: boolean;
  /**
   * 是否悬浮于此元素后半段（需要根据拖拽线方向，判断是上下还是左右）
   *
   * @author zhanghanrui
   * @date 2024-08-20 16:08:29
   * @type {boolean}
   */
  isAfterHover: boolean;
  /**
   * 放置线方向
   *
   * @author zhanghanrui
   * @date 2024-08-20 16:08:34
   * @type {('vertical' | 'horizontal')}
   */
  direction: 'vertical' | 'horizontal';
  /**
   * 自定义拖拽 handle 元素
   *
   * @author zhanghanrui
   * @date 2024-08-20 17:08:35
   * @type {ConnectDragSource<DragSourceOptions>}
   */
  drag?: ConnectDragSource<DragSourceOptions>;
  /**
   * 自定义拖拽预览
   *
   * @author zhanghanrui
   * @date 2024-09-26 17:09:42
   * @type {ConnectDragPreview<DragPreviewOptions>}
   */
  preview?: ConnectDragPreview<DragPreviewOptions>;
}

/**
 * 放置结果回执
 *
 * @author zhanghanrui
 * @date 2024-08-20 16:08:38
 * @export
 * @interface IDropResult
 */
export interface IDropResult {
  /**
   * 放置分组标识
   *
   * @author zhanghanrui
   * @date 2024-08-20 16:08:52
   * @type {string}
   */
  group: string;
}

/**
 * 拖拽数据项
 *
 * @author zhanghanrui
 * @date 2024-08-20 16:08:57
 * @export
 * @interface IDragDataItem
 * @template O
 */
export interface IDragDataItem<O = unknown> {
  /**
   * 拖拽分组实例标识
   *
   * @author zhanghanrui
   * @date 2024-08-20 16:08:03
   * @type {string}
   */
  group: string;
  /**
   * 当前拖拽数据
   *
   * @author zhanghanrui
   * @date 2024-08-20 16:08:22
   * @type {O}
   */
  item: O;
}

/**
 * 拖拽配置
 *
 * @author zhanghanrui
 * @date 2024-08-20 14:08:48
 * @export
 * @interface IVue3DndDraggableOptions
 * @template O
 * @template R
 */
export interface IVue3DndDraggableOptions<O = unknown, R extends IDropResult = IDropResult> {
  /**
   * 拖拽分组类型（同类型下，可跨分组拖拽）
   *
   * @author zhanghanrui
   * @date 2024-08-20 14:08:26
   * @type {string}
   */
  type: string;

  /**
   * 放置线方向
   *
   * @author zhanghanrui
   * @date 2024-08-20 14:08:09
   * @type {('vertical' | 'horizontal')} 垂直方向 | 水平方向
   */
  direction: 'vertical' | 'horizontal';

  /**
   * 放置线偏移量
   *
   * @author zhanghanrui
   * @date 2024-09-22 10:09:36
   * @type {number}
   */
  offset?: number;

  /**
   * 自定义拖拽元素选择器
   *
   * @author zhanghanrui
   * @date 2024-08-20 19:08:30
   * @type {string}
   */
  handle?: string;

  /**
   * 项数据标识
   *
   * @default 'id'
   * @author zhanghanrui
   * @date 2024-09-22 10:09:43
   * @type {string}
   */
  key?: string;

  /**
   * 是否自定义拖拽节点
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-08-20 17:08:41
   * @type {boolean}
   */
  isCustomHandle?: boolean;

  /**
   * 是否允许拖拽
   *
   * @author zhanghanrui
   * @date 2024-08-20 14:08:35
   * @template O
   * @template R
   * @param {DragSourceMonitor<IDragDataItem<O>, R>} monitor
   * @return {*}  {boolean}
   */
  canDrag?(monitor: DragSourceMonitor<IDragDataItem<O>, R>): boolean;

  /**
   * 是否允许放置
   *
   * @author zhanghanrui
   * @date 2024-08-20 14:08:45
   * @template O
   * @template R
   * @param {O} item
   * @param {DropTargetMonitor<IDragDataItem<O>, R>} monitor
   * @return {*}  {boolean}
   */
  canDrop?(item: IDragDataItem<O>, monitor: DropTargetMonitor<IDragDataItem<O>, R>): boolean;

  /**
   * 是否允许放置容器内
   *
   * @author zhanghanrui
   * @date 2024-08-20 15:08:22
   * @param {O} item
   * @param {DropTargetMonitor<IDragDataItem<O>, R>} monitor
   * @return {*}  {boolean}
   */
  canDropContainer?(
    item: IDragDataItem<O>,
    monitor: DropTargetMonitor<IDragDataItem<O>, R>,
  ): boolean;

  /**
   * 放置钩子
   *
   * @author zhanghanrui
   * @date 2024-08-20 14:08:36
   * @param {O} item
   * @param {DropTargetMonitor<IDragDataItem<O>, R>} monitor
   * @return {*}  {(O | undefined)}
   */
  drop?(item: IDragDataItem<O>, monitor: DropTargetMonitor<IDragDataItem<O>, R>): R | undefined;

  /**
   * 放置容器钩子
   *
   * @author zhanghanrui
   * @date 2024-08-20 15:08:26
   * @param {O} item
   * @param {DropTargetMonitor<IDragDataItem<O>, R>} monitor
   * @return {*}  {(O | undefined)}
   */
  dropContainer?(
    item: IDragDataItem<O>,
    monitor: DropTargetMonitor<IDragDataItem<O>, R>,
  ): O | undefined;

  /**
   * 放置悬浮钩子
   *
   * @author zhanghanrui
   * @date 2024-08-20 14:08:34
   * @param {O} item
   * @param {DropTargetMonitor<IDragDataItem<O>, R>} monitor
   */
  hover?(item: IDragDataItem<O>, monitor: DropTargetMonitor<IDragDataItem<O>, R>): void;

  /**
   * 拖拽结束
   *
   * @author zhanghanrui
   * @date 2024-08-20 14:08:02
   * @param {O} item
   * @param {DragSourceMonitor<IDragDataItem<O>, R>} monitor
   */
  end?(item: IDragDataItem<O>, monitor: DragSourceMonitor<IDragDataItem<O>, R>): void;

  /**
   * 预览配置
   *
   * @author zhanghanrui
   * @date 2024-08-20 14:08:41
   * @type {DragPreviewOptions}
   */
  previewOptions?: DragPreviewOptions;

  /**
   * 拖拽配置
   *
   * @author zhanghanrui
   * @date 2024-08-20 14:08:46
   * @type {DragSourceOptions}
   */
  dragOptions?: DragSourceOptions;

  /**
   * 放置配置
   *
   * @author zhanghanrui
   * @date 2024-08-20 14:08:58
   * @type {DropTargetOptions}
   */
  dropOptions?: DropTargetOptions;
}

import {
  ConnectDragPreview,
  ConnectDragSource,
  DragPreviewOptions,
  DragSourceOptions,
  DropTargetOptions,
} from 'vue3-dnd';
import { LowCodeWidget } from '@gct/runtime';
import { IVue3DndItemHooks } from '@gct-paas/design';

/**
 * 拖拽绘制项参数
 *
 * @export
 * @interface IRenderOptions
 * @template O
 */
export interface IRenderOptions<O = LowCodeWidget.BasicSchema> {
  /**
   * 节点数据
   *
   * @type {O}
   */
  item: O;
  /**
   * 位置
   *
   * @type {number}
   */
  index: number;
  /**
   * 是否正在拖拽
   *
   * @type {boolean}
   */
  isDragging: boolean;
  /**
   * 是否悬浮于当前元素内，并且只有当前元素。多层悬浮时，以最底层触发此参数
   *
   * @type {boolean}
   */
  isShallowOver: boolean;
  /**
   * 是否在此元素上
   *
   * @type {boolean}
   */
  isOver: boolean;
  /**
   * 是否悬浮于此元素后半段（需要根据拖拽线方向，判断是上下还是左右）
   *
   * @type {boolean}
   */
  isBeforeHover: boolean;
  /**
   * 是否悬浮于此元素后半段（需要根据拖拽线方向，判断是上下还是左右）
   *
   * @type {boolean}
   */
  isAfterHover: boolean;
  /**
   * 放置线方向
   *
   * @type {('vertical' | 'horizontal')}
   */
  direction: 'vertical' | 'horizontal';
  /**
   * 自定义拖拽 handle 元素
   *
   * @type {ConnectDragSource<DragSourceOptions>}
   */
  drag?: ConnectDragSource<DragSourceOptions>;
  /**
   * 自定义拖拽预览
   *
   * @type {ConnectDragPreview<DragPreviewOptions>}
   */
  preview?: ConnectDragPreview<DragPreviewOptions>;
}

/**
 * 绘制参数
 *
 * @export
 * @interface IRenderContentOptions
 * @template O
 */
export interface IRenderContentOptions<O = LowCodeWidget.BasicSchema> {
  /**
   * 父部件
   *
   * @type {O}
   */
  parentWidget?: O;
  /**
   * 部件清单
   *
   * @type {O[]}
   */
  children: O[];
  /**
   * 特殊情况下绘制项和子项不一致，为了确保引用关系修改数据实时生效，children 将用于数据修改，renderChildren 将用于绘制
   *
   * @type {O[]}
   */
  renderChildren?: O[];
  /**
   * 容器绘制额外参数
   *
   * @type {*}
   */
  props?: any;
  /**
   * 额外配置信息
   *
   * @type {IVue3DndItemOptions}
   */
  config?: IVue3DndItemOptions;
  /**
   * 子绘制内容，可选项，只有单独插槽时有用
   *
   * @type {*}
   */
  content?: any;
  /**
   * 容器中子项单一项内容绘制
   *
   */
  itemContent?: (data: { element: O; index: number }) => any;
  /**
   * 容器子项前额外绘制
   *
   */
  renderItemBefore?: (data: { element: O; index: number }) => any;
  /**
   * 容器中子项后额外绘制
   *
   */
  renderItemAfter?: (data: { element: O; index: number }) => any;
}

/**
 * 容器绘制选项
 *
 * @export
 * @interface IRenderContainerOptions
 * @extends {IRenderContentOptions<O>}
 * @template O
 */
export interface IRenderContainerOptions<O = LowCodeWidget.BasicSchema>
  extends IRenderContentOptions<O> {
  /**
   * 放置分组标识
   *
   * @type {string}
   */
  groupId?: string;

  /**
   * 子项绘制额外参数
   *
   * @type {*}
   */
  itemProps?: any;
}

/**
 * 项绘制参数
 *
 * @export
 * @interface IRenderContentItemOptions
 * @extends {IRenderContentOptions<O>}
 * @template O
 */
export interface IRenderContentItemOptions<O = LowCodeWidget.BasicSchema>
  extends IRenderContentOptions<O> {
  /**
   * 部件数据
   *
   * @type {O}
   */
  widget: O;
  /**
   * 部件索引
   *
   * @type {number}
   */
  index: number;
}

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
 * 异步放置结果
 */
export type IDropResult = {
  asyncDrop: Promise<IDropResultData>;
};

/**
 * 拖拽状态收集器
 *
 * @interface IDragCollect
 */
export interface IDragCollect {
  /**
   * 是否允许拖拽
   *
   * @type {boolean}
   */
  canDrag: boolean;
  /**
   * 是否正在拖拽
   *
   * @type {boolean}
   */
  isDragging: boolean;
}

/**
 * 放置状态收集器
 *
 * @interface IDropCollect
 */
export interface IDropCollect {
  /**
   * 拖拽标识
   *
   * @type {string}
   */
  handlerId: string;
  /**
   * 是否允许放置
   *
   * @type {boolean}
   */
  canDrop: boolean;
  /**
   * 是否只悬浮在当前元素上
   *
   * @type {boolean}
   */
  isShallowOver: boolean;
  /**
   * 是否悬浮在当前元素上
   *
   * @type {boolean}
   */
  isOver: boolean;
}

/**
 * 拖拽数据项
 *
 * @export
 * @interface IDragDataItem
 * @template O
 */
export interface IDragDataItem<O = LowCodeWidget.BasicSchema> {
  /**
   * 拖拽组别类型
   *
   * @type {string}
   */
  dragType: string;
  /**
   * 当前数据标识，如果是新数据则主键为空
   *
   * @type {string}
   */
  id: string;
  /**
   * 拖拽分组实例标识
   *
   * @type {string}
   */
  group: string;
  /**
   * 拖拽项原位置索引
   *
   * @type {number}
   */
  index: number;
  /**
   * 当前拖拽数据
   *
   * @type {O}
   */
  data: O;
  /**
   * 数据模式
   *
   * @type {('create' | 'move')} 新建 | 移动
   */
  mode: 'create' | 'move';
  /**
   * 包含自身 + 所有子的类型，目前主要用于拖拽限制
   *
   * @type {string[]}
   */
  types: string[];
}

/**
 * 拖拽配置
 *
 * @interface IVue3DndItemOptions
 * @template O
 * @template R
 */
export interface IVue3DndItemOptions<O = LowCodeWidget.BasicSchema> {
  /**
   * 数据处理模式
   *
   * @type {('create' | 'move')} 新建 | 移动
   */
  mode: 'create' | 'move';

  /**
   * 额外指定类型
   *
   * @type {string}
   */
  type?: string;

  /**
   * 放置线方向
   *
   * @default 'vertical'
   * @type {('vertical' | 'horizontal')} 垂直方向 | 水平方向
   */
  direction?: 'vertical' | 'horizontal';

  /**
   * 放置线偏移量
   *
   * @type {number}
   */
  offset?: number;

  /**
   * 是否自定义放置
   *
   * @default false
   * @type {boolean}
   */
  isCustomDrop?: boolean;

  /**
   * 是否自定义预览
   *
   * @default false
   * @type {boolean}
   */
  isCustomPreview?: boolean;

  /**
   * 是否允许拖拽
   *
   * @default true
   * @type {boolean}
   */
  isDrag?: boolean;

  /**
   * 是否允许放置
   *
   * @default true
   * @type {boolean}
   */
  isDrop?: boolean;

  /**
   * 是否允许删除
   *
   * @default true
   * @type {boolean}
   */
  isDelete?: boolean;

  /**
   * 特殊情况下，例如表格将表格元素自己复制了好几份，需要指定实际呈现元素在 querySelectorAll 中的位置
   *
   * @type {number}
   */
  selectorIndex?: number;

  /**
   * 预览配置
   *
   * @type {DragPreviewOptions}
   */
  previewOptions?: DragPreviewOptions;

  /**
   * 拖拽配置
   *
   * @type {DragSourceOptions}
   */
  dragOptions?: DragSourceOptions;

  /**
   * 放置配置
   *
   * @type {DropTargetOptions}
   */
  dropOptions?: DropTargetOptions;

  /**
   * 放置事件回调
   *
   */
  onDrop?: (item: IDropItem, widgets: O[]) => void;

  /**
   * 是否允许拖拽回调函数
   *
   * @author chitanda
   * @date 2025-09-12 17:09:54
   */
  canDrag?: (data: O) => boolean;
}

/**
 * 放置参数项
 *
 * @export
 * @interface IDropItem
 * @template O
 */
export interface IDropItem<O = LowCodeWidget.BasicSchema> {
  /**
   * 放置模式
   *
   * @type {('move' | 'create')}
   */
  mode: 'move' | 'create';
  /**
   * 放置下标
   *
   * @type {number}
   */
  index: number;
  /**
   * 原位置下标，新建模式下无效
   *
   * @default -1
   * @type {number}
   */
  oldIndex: number;
  /**
   * 拖拽数据
   *
   * @type {O}
   */
  data: O;
}

/**
 * 拖拽项钩子
 *
 * @export
 * @interface IVue3DndItemHooks
 * @template O
 */
export type { IVue3DndItemHooks };

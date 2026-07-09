import { IGctDndData } from "./i-gct-dnd-data";
import { IGctDragDndData } from "./i-gct-drag-dnd-data";
import { IGctDropResultData } from "./i-gct-drop-result";

/**
 * 拖拽配置
 *
 * @export
 * @interface IGctDndConfig
 */
export interface IGctDndConfig {
  /**
   * 拖拽分组标识
   *
   * @type {string}
   */
  group: string;

  /**
   * 拖拽时额外携带的标签，可以用于做特殊区分
   *
   * @type {IObject}
   */
  tagMap?: IObject;

  /**
   * 拖拽模式，默认移动
   *
   * @default 'move'
   * @type {('copy' | 'move' | string)}
   */
  mode?: 'copy' | 'move' | string;

  /**
   * 自定义拖拽标识
   *
   * @type {string}
   */
  handle?: string;

  /**
   * 是否开启放置功能，默认 开启
   *
   * @default true
   * @type {boolean}
   */
  isDrop?: boolean;

  /**
   * 是否开启拖拽功能，默认 开启
   *
   * @default true
   * @type {boolean}
   */
  isDrag?: boolean;

  /**
   * 拖拽方向，默认水平方向
   *
   * @default 'horizontal'
   * @type {('vertical' | 'horizontal')}
   */
  direction?: 'vertical' | 'horizontal';

  /**
   * 拖拽放置偏移量，用于控制放置区移动鼠标的交互优化
   *
   * @type {number}
   */
  offset?: number;

  /**
   * 拖入容器时，默认插入位置
   *
   * @default 'after'
   * @type {('first' | 'last')}
   */
  insertPos?: 'first' | 'last';

  /**
   * 是否允许放置
   *
   */
  canDrop?: (data: IGctDragDndData) => boolean;

  /**
   * 是否允许拖拽
   *
   */
  canDrag?: (data: IGctDndData) => boolean;

  /**
   * 放置数据处理
   *
   */
  drop?: (data: IGctDragDndData) => IGctDndData | null;

  /**
   * 放置数据处理
   *
   */
  end?: (data: IGctDragDndData, res: IGctDropResultData) => void;

  /**
   * 新增
   *
   */
  add?: (data: IGctDndData) => void;

  /**
   * 删除项
   *
   */
  remove?: (data: IGctDndData) => void;
}

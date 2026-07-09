import { IDesignNode } from './i-design-node';

/**
 * 拖拽数据项
 *
 * @export
 * @interface IDragDataItem
 * @template O
 */
export interface IDragDataItem<O extends IDesignNode = IDesignNode> {
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

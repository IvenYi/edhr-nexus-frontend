import { IDesignNode } from '@gct/base';

/**
 * 拖拽项
 *
 * @author zhanghanrui
 * @date 2024-07-05 14:07:56
 * @export
 * @interface IDragItem
 */
export interface IDragItem {
  /**
   * 下标
   *
   * @author zhanghanrui
   * @date 2024-07-05 14:07:04
   * @type {number}
   */
  index: number;
  /**
   * 标识
   *
   * @author zhanghanrui
   * @date 2024-07-05 14:07:08
   * @type {string}
   */
  id: string;
  /**
   * 类型
   *
   * @author zhanghanrui
   * @date 2024-07-05 14:07:12
   * @type {string}
   */
  type: string;
  /**
   * 拖拽数据
   *
   * @author zhanghanrui
   * @date 2024-07-05 14:07:20
   * @type {IDesignNode}
   */
  data: IDesignNode;
}

import { IMaterialData } from '../i-material-data/i-material-data';

/**
 * 素材分组
 *
 * @author zhanghanrui
 * @date 2024-07-09 13:07:41
 * @export
 * @interface IMaterialGroup
 */
export interface IMaterialGroup {
  /**
   * 分组标识
   *
   * @author zhanghanrui
   * @date 2024-07-09 13:07:26
   * @type {string}
   */
  tag: string;
  /**
   * 分组标题
   *
   * @author zhanghanrui
   * @date 2024-07-09 13:07:33
   * @type {string}
   */
  label: string;
  /**
   * 分组图标
   *
   * @author zhanghanrui
   * @date 2024-07-09 16:07:13
   * @type {string}
   */
  icon?: string;
  /**
   * 分组排序
   *
   * @author zhanghanrui
   * @date 2024-07-09 13:07:55
   * @type {number}
   */
  order: number;
  /**
   * 分组项
   *
   * @author zhanghanrui
   * @date 2024-07-09 15:07:37
   * @type {IMaterialData[]}
   */
  children?: IMaterialData[];
}

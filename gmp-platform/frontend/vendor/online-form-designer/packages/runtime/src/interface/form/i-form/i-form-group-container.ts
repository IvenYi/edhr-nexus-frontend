import { IFormContainer } from './i-form-container';

/**
 * 表单分组容器
 *
 * @author zhanghanrui
 * @date 2024-03-28 15:03:32
 * @export
 * @interface IFormGroupContainer
 * @extends {IFormContainer}
 */
export interface IFormGroupContainer extends IFormContainer {
  /**
   * 分组类型
   *
   * @author zhanghanrui
   * @date 2024-04-01 14:04:44
   * @type {'group'}
   */
  type: 'group';

  /**
   * 分组标题
   */
  title: string;
}

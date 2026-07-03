import { IFormContainer } from './i-form-container';

/**
 * 表单分组容器
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:06
 * @export
 * @interface IFormGroup
 * @extends {IFormContainer}
 */
export interface IFormGroup extends IFormContainer {
  /**
   * 分组标题
   */
  title?: string;

  /**
   * 是否显示标题
   *
   * @description 当值为 false 时，title 配置不生效。若不指定，title 有值时显示标题，否则不显示标题
   * @author zhanghanrui
   * @date 2024-04-01 18:04:57
   * @type {boolean}
   */
  showHeader?: boolean;

  /**
   * 是否可折叠
   *
   * @description 当值为 true 时，showHeader 配置不生效
   * @default false
   * @author zhanghanrui
   * @date 2024-04-01 18:04:12
   * @type {boolean}
   */
  isCollapse?: boolean;
}

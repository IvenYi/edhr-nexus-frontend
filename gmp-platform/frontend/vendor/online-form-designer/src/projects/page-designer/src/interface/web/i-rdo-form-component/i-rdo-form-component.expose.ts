import { IFormComponentExpose } from '../i-form-component/i-form-component.expose';

/**
 * rdo表单组件
 *
 * @interface IRdoFormComponentExpose
 * @extends {IFormComponentExpose}
 */
export interface IRdoFormComponentExpose extends IFormComponentExpose {
  /**
   * 复制版本
   *
   * @param {IObject} data
   */
  copyVersion(data: IObject): void;

  /**
   * 创建版本
   *
   * @param {IObject} data
   */
  createVersion(data: IObject): void;
}

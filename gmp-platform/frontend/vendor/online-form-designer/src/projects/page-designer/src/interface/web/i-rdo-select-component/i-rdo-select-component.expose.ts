import { ICheckboxComponentExpose } from '../i-checkbox-component/i-checkbox-component.expose';

/**
 * rdo选择组件
 *
 * @interface IRdoSelectComponentExpose
 * @extends {ICheckboxComponentExpose}
 */
export interface IRdoSelectComponentExpose extends ICheckboxComponentExpose {
  /**
   * 设置选项数据
   *
   * @param {IObject} data 选项数据
   *
   */
  setOptions(data?: IObject): void;
  /**
   * 获取选项数据
   *
   * @returns {IObject} 选项数据
   */
  getOptions(): IObject;
  /**
   * 重新加载选项数据
   *
   * @returns {IObject} 选项数据
   */
  reload(): Promise<void>;
}

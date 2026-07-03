import { IRadioComponentExpose } from "../i-radio-component/i-radio-component.expose";

/**
 * 单选框组件
 *
 * @interface IGenRadioComponentExpose
 * @extends {IRadioComponentExpose}
 */
export interface IGenRadioComponentExpose extends IRadioComponentExpose {
  /**
   * 获取选中的选项
   *
   * @return {*} {IObject[]}
   */
  getOptionValue(): IObject[];


}

import { IFormController, IFormItemBasicController } from '../../controller';
import { IFormItemBasic } from '../../form';
import { IProviderBasic } from '../i-provider-basic/i-provider-basic';

/**
 * 表单项提供者
 *
 * @author zhanghanrui
 * @date 2024-04-01 13:04:46
 * @export
 * @interface IFormItemProvider
 * @extends {IProviderBasic}
 */
export interface IFormItemProvider extends IProviderBasic {
  /**
   * 表单项组件，可是组件名称或组件实例
   *
   * @author zhanghanrui
   * @date 2024-04-01 14:04:45
   * @type {*}
   */
  component: any;

  /**
   * 直接特殊绘制
   *
   * @author zhanghanrui
   * @date 2024-04-01 13:04:52
   * @param {IFormController} form 表单控制器
   * @param {*} value 当前项的值
   * @param {IData} data 当前表单数据
   * @param {IFormItemBasic} item 当前表单项模型
   * @return {*}  {*}
   */
  render?(form: IFormController, value: any, data: IData, item: IFormItemBasic): any;

  /**
   * 创建控制器实例
   *
   * @author zhanghanrui
   * @date 2024-04-02 10:04:37
   * @param {IFormController} form
   * @param {IFormItemBasic} item
   * @return {*}  {IFormItemBasicController}
   */
  createController(form: IFormController, item: IFormItemBasic): IFormItemBasicController;
}

import { IFormController } from '../../controller';
import { IForm } from './i-form';

/**
 * 编辑表单
 *
 * @author zhanghanrui
 * @date 2024-04-01 18:04:17
 * @export
 * @interface IEditForm
 * @extends {IForm}
 */
export interface IEditForm extends IForm {
  readonly type: 'edit';

  /**
   * 默认隐藏所有表单项的异常展示高度空间
   *
   * @type {boolean}
   */
  hiddenError?: boolean;

  /**
   * 监控表单项值变更
   *
   * @author zhanghanrui
   * @date 2024-06-11 17:06:55
   */
  watch?: {
    [key: string]: (form: IFormController, val: any, oldValue: any) => void;
  };

  /**
   * 新建请求
   *
   * @author zhanghanrui
   * @date 2024-04-03 16:04:31
   * @param {IData} data
   * @return {*}  {Promise<IData>}
   */
  newRequest?(data: IData): Promise<IData>;

  /**
   * 更新请求
   *
   * @author zhanghanrui
   * @date 2024-04-03 16:04:34
   * @param {{ id: string }} params
   * @param {IData} data
   * @return {*}  {Promise<IData>}
   */
  updateRequest?(params: { id: string }, data: IData): Promise<IData>;
}

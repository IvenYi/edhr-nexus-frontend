import { IFormController } from '../form/form.controller';

/**
 * 编辑表单控制器
 *
 * @author zhanghanrui
 * @date 2024-04-01 18:04:24
 * @export
 * @interface IEditFormController
 * @extends {IFormController}
 */
export interface IEditFormController extends IFormController {
  /**
   * 保存表单数据
   *
   * @author zhanghanrui
   * @date 2024-04-02 20:04:25
   * @return {*}  {Promise<IData>}
   */
  save(): Promise<IData>;
}

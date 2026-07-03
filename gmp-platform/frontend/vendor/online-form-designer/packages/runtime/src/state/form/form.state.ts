import { IFormState } from '../../interface';

/**
 * 表单状态
 *
 * @author zhanghanrui
 * @date 2024-04-01 13:04:01
 * @export
 * @class FormState
 * @implements {IFormState}
 */
export class FormState implements IFormState {
  loaded: boolean = false;

  count: number = 0;

  isNew: boolean = true;

  loading: boolean = false;

  destroyed: boolean = false;

  /**
   * 表单数据
   *
   * @author zhanghanrui
   * @date 2024-04-01 13:04:12
   * @type {IData}
   */
  data: IData = {};
}

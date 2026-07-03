import { IFormItemBasicState } from '../../interface';

/**
 * 表单项基础状态
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:19
 * @export
 * @class FormItemBasicState
 * @implements {IFormItemBasicState}
 */
export class FormItemBasicState implements IFormItemBasicState {
  disabled: boolean = false;

  readonly: boolean = false;

  visible: boolean = true;

  keepalive: boolean = false;

  destroyed: boolean = false;
}

import { IFormTabState } from '../../interface';
import { FormItemBasicState } from '../form-item-basic/form-item-basic.state';

/**
 * 表单分页状态
 *
 * @author lingxiaoming
 * @date 2024-07-14 02:01:12
 * @export
 * @class FormTabState
 * @extends {FormItemBasicState}
 * @implements {IFormTabState}
 */
export class FormTabState extends FormItemBasicState implements IFormTabState {
  activePane: string = '';
}

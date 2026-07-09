import { IDictionaryItem, IFormEditItemState } from '../../interface';
import { FormItemBasicState } from '../form-item-basic/form-item-basic.state';

/**
 * 表单编辑项状态
 *
 * @author zhanghanrui
 * @date 2024-04-02 22:04:45
 * @export
 * @class FormEditItemState
 * @extends {FormItemBasicState}
 * @implements {IFormEditItemState}
 */
export class FormEditItemState extends FormItemBasicState implements IFormEditItemState {
  label: string = '';

  value: any = null;

  options: IDictionaryItem[] = [];
}

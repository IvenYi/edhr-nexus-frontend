import { IFormItemState } from '../../interface';
import { FormEditItemState } from '../form-edit-item/form-edit-item.state';

/**
 * 表单项状态
 *
 * @author zhanghanrui
 * @date 2024-04-02 22:04:22
 * @export
 * @class FormItemState
 * @extends {FormEditItemState}
 * @implements {IFormItemState}
 */
export class FormItemState extends FormEditItemState implements IFormItemState {}

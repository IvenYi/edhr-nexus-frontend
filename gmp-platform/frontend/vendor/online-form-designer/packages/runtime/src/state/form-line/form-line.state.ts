import { IFormLineState } from '../../interface';
import { FormItemBasicState } from '../form-item-basic/form-item-basic.state';

/**
 * 表单项状态
 *
 * @export
 * @class FormLineState
 * @implements {IFormItemState}
 */
export class FormLineState extends FormItemBasicState implements IFormLineState {}

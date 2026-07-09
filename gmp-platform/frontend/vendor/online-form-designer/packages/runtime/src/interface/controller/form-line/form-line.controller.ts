import { IFormLine } from '../../form';
import { IFormLineState } from '../../state';
import { IFormItemBasicController } from '../form-item-basic/form-item-basic.controller';

/**
 * 表单分组
 *
 * @export
 * @interface IFormLineController
 * @extends {IFormItemBasicController<M, S>}
 * @template M
 * @template S
 */
export interface IFormLineController<
  M extends IFormLine = IFormLine,
  S extends IFormLineState = IFormLineState,
> extends IFormItemBasicController<M, S> {
  /**
   * 分组类型
   *
   * @type {'line'}
   */
  type: 'line';
}

import { ITableEditItemState } from '../../interface';
import { TableITemState } from './table-item.state';

/**
 * 表格编辑项状态
 *
 * @author zhanghanrui
 * @date 2024-04-16 21:04:47
 * @export
 * @class TableEditItemState
 * @extends {TableITemState}
 * @implements {ITableEditItemState}
 */
export class TableEditItemState extends TableITemState implements ITableEditItemState {
  error: boolean = false;

  errMessage: string = '';

  readonly: boolean = false;

  disabled: boolean = false;
}

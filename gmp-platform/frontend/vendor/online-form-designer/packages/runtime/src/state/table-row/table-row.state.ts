import { ITableRowState } from '../../interface';

/**
 * 表格行数据状态
 *
 * @author zhanghanrui
 * @date 2024-04-16 21:04:41
 * @export
 * @class TableRowState
 * @implements {ITableRowState}
 */
export class TableRowState implements ITableRowState {
  hover: boolean = false;

  active: boolean = false;

  deleted: boolean = false;
}

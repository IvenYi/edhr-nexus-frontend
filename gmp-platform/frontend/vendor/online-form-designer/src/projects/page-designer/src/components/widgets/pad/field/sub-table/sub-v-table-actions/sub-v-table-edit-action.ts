import { IVTableDataItem } from '@gct/universal-component/gct-v-table';
import { SubVTableBaseAction } from "./sub-v-table-base-action";

/**
 * 编辑按钮
 *
 * @export
 * @class SubVTableEditAction
 * @extends {SubVTableBaseAction}
 */
export class SubVTableEditAction extends SubVTableBaseAction {
  protected override async onClick(row: IVTableDataItem, rowIndex?: number): Promise<void> {
    this.table.editRow(row, rowIndex);
  }
}

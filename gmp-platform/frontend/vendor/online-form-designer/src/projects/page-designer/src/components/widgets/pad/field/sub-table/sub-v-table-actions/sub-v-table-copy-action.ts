import { SubVTableBaseAction } from "./sub-v-table-base-action";

/**
 * 操作列-详情按钮
 *
 * @export
 * @class SubVTableCopyAction
 * @extends {SubVTableBaseAction}
 */
export class SubVTableCopyAction extends SubVTableBaseAction {
  protected override async onClick(row: IData, rowIndex?: number): Promise<void> {
    this.table.copyRow(row, rowIndex);
  }
}

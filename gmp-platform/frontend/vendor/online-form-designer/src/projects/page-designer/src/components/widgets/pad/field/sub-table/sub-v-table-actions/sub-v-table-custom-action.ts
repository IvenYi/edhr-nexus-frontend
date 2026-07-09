import { IVTableDataItem } from "@gct/universal-component/gct-v-table";
import { SubVTableBaseAction } from "./sub-v-table-base-action";

/**
 * 自定义按钮
 *
 * @export
 * @class SubVTableCustomAction
 * @extends {SubVTableBaseAction}
 */
export class SubVTableCustomAction extends SubVTableBaseAction {
  protected override async onClick(row: IVTableDataItem, rowIndex?: number): Promise<void> {
    await this.event.runEventByName('onClick', this.widget.events, row, rowIndex);
  }
}

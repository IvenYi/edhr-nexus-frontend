import { VTableBaseAction } from "./v-table-base-action";

/**
 * 自定义按钮
 *
 * @export
 * @class VTableCustomAction
 * @extends {VTableBaseAction}
 */
export class VTableCustomAction extends VTableBaseAction {

  protected override async onClick(row: IData, rowIndex?: number): Promise<void> {
    await this.event.runEventByName('onClick', this.widget.events, row, rowIndex);
  }
}

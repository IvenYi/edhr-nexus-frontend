import { VTableBaseAction } from './v-table-base-action';

export class VTableJumpAction extends VTableBaseAction {
  protected override async onClick(row: IData, rowIndex?: number): Promise<void> {
    const { linkPage } = this.widget.props;
    this.event.context.$push!(linkPage, { id: row.id_ });
  }
}

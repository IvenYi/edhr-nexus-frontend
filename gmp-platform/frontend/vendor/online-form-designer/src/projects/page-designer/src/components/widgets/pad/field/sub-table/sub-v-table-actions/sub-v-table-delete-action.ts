import { IVTableDataItem } from '@gct/universal-component/gct-v-table';
import { SubVTableBaseAction } from './sub-v-table-base-action';

export class SubVTableDeleteAction extends SubVTableBaseAction {
  protected override async onClick(row: IVTableDataItem, rowIndex?: number): Promise<void> {
    this.table.deleteRow(row, rowIndex);
  }
}

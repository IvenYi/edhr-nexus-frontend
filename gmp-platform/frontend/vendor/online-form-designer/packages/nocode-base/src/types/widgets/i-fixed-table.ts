import type { BaseCoreComponent } from '../common/base';

export interface IFixedTableProps extends BaseCoreComponent.FieldBasicProps {
  /** 单元格内文字与边框的距离 */
  cellpadding: string;
  /** 单元格之间的距离 */
  cellspacing: string;
  /**表头 ids */
  theadIds: [];
  /** 子表单元格宽度 */
  colsWidth: number[];
}

export interface IFixedTable extends BaseCoreComponent.BasicSchema {
  props: IFixedTableProps;
}

import type { BaseCoreComponent } from '../common/base';

export interface ISubTableProps extends BaseCoreComponent.FieldBasicProps {
  /** 单元格内文字与边框的距离 */
  cellpadding: string;
  /** 单元格之间的距离 */
  cellspacing: string;
  /** 动态行tr ids */
  dynamicIds: string[];
  /**表头 ids */
  theadIds: [];
  /** 子表单元格宽度 */
  colsWidth: number[];

  /** 二维表的横向动态表 */
  isRowSubTable2d?: boolean;
  /** 二维表的横向动态表需要初始化行数 */
  childInitRowLen?: number;
  /** 动态表快速填报 */
  quickFill?: boolean;
  /** 是否是物料消耗表 */
  isMaterialConsumeTable?: boolean;
  /** 绑定的物料消耗表id */
  materialConsumeTableId?: string;
  /** 表名称 */
  tableTitle?: string;
  /** 子表模型的key */
  modelKey?: string;
  /** 子模型类型 */
  subModelType?: string;
}

export interface ISubTable extends BaseCoreComponent.BasicSchema {
  props: ISubTableProps;
}

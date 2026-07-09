import { CellType } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface ITdProps {
  /** 合并的列数（列合并） */
  colspan?: string;
  /** 合并的行数（行合并） */
  rowspan?: string;
  /** 边框类名 */
  class?: string;
  /** 文本内容自动换行 */
  autoLineBreak: boolean;
  sourceBorderAttrs?: string[];
  /** 是否是新固定表td */
  isNewFixedTableTd?: boolean;
  /** 新固定表主子字段key */
  fixedTableFieldId?: string;
  /** 固定表在动态表中 */
  isNewFixedTableInDyn?: boolean;

  /** 二维检验表 */
  isNewCheckTable2D?: boolean;
  /** 二维检验表所属 col row child */
  checkTableType?: string;
}

/** 表格单元格 */
export interface ITd extends BaseCoreComponent.BasicSchema {
  props: ITdProps;
  /** 单元格内容类型 */
  cellValueType: CellType;
  cellWidget: BaseCoreComponent.BasicSchema;
  /** 固定表数据分组所属下标 */
  cellFixedTableDataIdx?: number;
  /** 单元格是否隐藏 */
  cellHidden: boolean;

  /** 检验表横向数据下标 */
  cellCheckTableDataRowIdx?: number;
  /** 检验表纵向数据下标 */
  cellCheckTableDataColIdx?: number;
  autoMerge?: boolean;
  xAutoMerge?: boolean;
  fillDirection?: 'x' | 'y';
}

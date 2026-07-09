import { ComponentTypeEnum } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface ITrProps {
  /** 行最小高度 */
  height?: string;
  /**
   * 当前组件标识符
   * @alias thead 标识为【表头】
   * @alias tfoot 标识为【表尾】
   * @alias dynamicTr 标识为【动态行】
   */
  identifier?: 'thead' | 'tfoot' | 'dynamicTr';
  /** 当前行是否存在列合并 */
  mergeCells?: Record<string, number>;
  /**  当前行是否是子表行 */
  subTableRow?: string;
  /** 子表行类型 */
  subTableCmpType?: ComponentTypeEnum;
  /** 如果当前行是子表行那么从当前行开始可能是表头或者数据行 */
  subTableRowTypes?: Array<'thead' | 'tfoot' | 'fixed' | 'dynamicTr'>;
}

/** 表格行 */
export interface ITr extends BaseCoreComponent.BasicSchema {
  props: ITrProps;
}

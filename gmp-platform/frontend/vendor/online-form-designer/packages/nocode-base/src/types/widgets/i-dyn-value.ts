import { BooleanShowMode, LabelPosition, Orientation } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface IDynValueProps extends BaseCoreComponent.FieldBasicProps {
  /** 文字前后位置 */
  labelPos?: LabelPosition;
  /** 显示方式 */
  displayMode?: BooleanShowMode;
  /** 排列方式 */
  direction?: Orientation;
  /*** 间距 */
  letterSpace?: number;

  /**组件类型 */
  dateType?: 'YYYY HH' | 'YYYY-MM HH:mm' | 'YYYY-MM-DD HH:mm:ss';
  /** 分割符 */
  separator?: string;
  /** 日期类型 */
  format?: string;
}

export interface IDynValue extends BaseCoreComponent.BasicSchema {
  props: IDynValueProps;
}

import { PaperWidgeType, DiagonalDirection } from '../../constant';
import type { BaseCoreComponent, IBindField } from '../common/base';

export interface IDiagonalProps {
  /** 表头分栏id */
  id: string;
  /** 页面组件类型 */
  type: PaperWidgeType;
  /** 分栏名称内容值 */
  names: string[];
  size: number;
  /** 是否启用绑定字段 */
  enableFields?: [boolean, boolean, boolean];
  /** 绑定的字段 */
  bindFields?: [IBindField | undefined, IBindField | undefined, IBindField | undefined];
  /** 分栏方向 */
  direction: DiagonalDirection;
}

/** 表格列的属性 */
export interface IDiagonal extends BaseCoreComponent.BasicSchema {
  props: IDiagonalProps;
}

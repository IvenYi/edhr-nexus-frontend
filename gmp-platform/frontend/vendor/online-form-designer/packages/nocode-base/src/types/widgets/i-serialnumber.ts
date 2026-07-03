import { PaperWidgeType } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface ISerialnumberProps {
  /** 序号id */
  id: string;
  /** 页面组件类型 */
  type: PaperWidgeType;
  /** 初始数值 */
  initialValue: number;
  /** 自增跨度 */
  autoAddValue: number;
}

export interface ISerialnumber extends BaseCoreComponent.BasicSchema {
  props: ISerialnumberProps;
}

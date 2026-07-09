import type { BaseCoreComponent, IBindField } from '../common/base';

import { PaperWidgeType, TimeDiffFormat } from '../../constant';

export interface ITimediffProps {
  /** 时间差id */
  id: string;
  /** 页面组件类型 */
  type: PaperWidgeType;
  /** 格式 */
  format: TimeDiffFormat;
  /** 绑定的开始时间字段 */
  startDefault: boolean;
  startField: IBindField;
  /** 绑定的结束时间字段 */
  endDefault: boolean;
  endField: IBindField;
  layout: any;
}

export interface ITimediff extends BaseCoreComponent.BasicSchema {
  props: ITimediffProps;
}

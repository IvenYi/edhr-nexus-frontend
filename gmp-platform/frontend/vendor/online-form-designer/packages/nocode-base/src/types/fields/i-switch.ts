import { BindCmpStyleEnum, LabelPosition, Orientation, BooleanShowMode } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface ISwitchProps extends BaseCoreComponent.FieldBasicProps {
  /** 布尔选项-真值 */
  trueText: string;
  /** 布尔选项-假值 */
  falseText: string;
  /** 组件类型 */
  bindCompStyleType: BindCmpStyleEnum;
  /** 文字前后位置 */
  labelPos: LabelPosition;
  /** 显示方式 */
  displayMode: BooleanShowMode;
  /** 排列方式 */
  direction: Orientation;
  /*** 间距 */
  letterSpace: number;
  /** 布尔选项-真值的引用字段 */
  trueRefFields: BaseCoreComponent.BasicSchema[];
  /** 布尔选项-假值的引用字段 */
  falseRefFields: BaseCoreComponent.BasicSchema[];

  /** 布尔真校验 */
  validateTrue?: boolean;
  /** 布尔假校验 */
  validateFalse?: boolean;
}

export interface ISwitch extends BaseCoreComponent.BasicSchema {
  props: ISwitchProps;
}

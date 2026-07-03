import { BindCmpStyleEnum, LabelPosition, Orientation } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface IEnumSelectProps extends BaseCoreComponent.FieldBasicProps {
  /** options内容 */
  optionsJson?: string;

  /** 组件类型 */
  bindCompStyleType: BindCmpStyleEnum;
  /** 文字前后位置 */
  labelPos: LabelPosition;
  /** 排列方式 */
  direction: Orientation;
  /*** 间距 */
  letterSpace: number;
}

export interface IEnumSelect extends BaseCoreComponent.BasicSchema {
  props: IEnumSelectProps;
}

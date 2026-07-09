import { BindCmpStyleEnum } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface IInputProps extends BaseCoreComponent.FieldBasicProps {
  /** 最小长度 */
  minlength?: number;
  /** 最大长度 */
  maxlength?: number;
  /** 组件类型 */
  bindCompStyleType: BindCmpStyleEnum;
  /** 正则校验 */
  regex?: string;
  /** 正则校验提示文案 */
  regexHint?: string;
  /** 下拉内容 */
  optionString?: string;
}

export interface IInput extends BaseCoreComponent.BasicSchema {
  props: IInputProps;
}

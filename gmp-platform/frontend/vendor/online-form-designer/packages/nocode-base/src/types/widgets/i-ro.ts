import type { BaseCoreComponent } from '../common/base';

export interface IROProps {
  /** 值 */
  value?: string | number;
}

export interface IRO extends BaseCoreComponent.BasicSchema {
  props: IROProps;
}

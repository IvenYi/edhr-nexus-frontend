import type { BaseCoreComponent } from '../common/base';

export interface ICombineFieldsProps extends BaseCoreComponent.FieldBasicProps {
  /** 字段合集 */
  fields: BaseCoreComponent.BasicSchema[];
}

export interface ICombineFields extends BaseCoreComponent.BasicSchema {
  props: ICombineFieldsProps;
}

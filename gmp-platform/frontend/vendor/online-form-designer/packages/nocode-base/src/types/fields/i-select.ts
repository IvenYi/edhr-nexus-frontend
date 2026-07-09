import type { BaseCoreComponent } from '../common/base';

export interface ISelectProps extends BaseCoreComponent.FieldBasicProps {
  /** options内容 */
  optionsJson?: string;
  /** 数据筛选 */
  dataFilter?: {
    dataRule: string;
    dataRuleConfig: string;
    dataRuleEnabled: boolean;
  };
  /** 自动填充 */
  autofillRules?: Array<{
    fromField: string;
    toField: string;
  }>;
  /** 快速搜索 */
  quickSearchField?: string[];
  quickSearchExp?: string;
}

export interface ISelect extends BaseCoreComponent.BasicSchema {
  props: ISelectProps;
}

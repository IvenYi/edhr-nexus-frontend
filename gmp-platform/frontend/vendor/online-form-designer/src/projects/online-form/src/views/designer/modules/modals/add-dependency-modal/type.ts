import { Dependency_ENUM, ASSIGNMENTSTRATEGY_ENUM } from '/@page-designer/enum';

export type FormState = {
  type: Dependency_ENUM;
  expression: string;
  /**
   * 规则的描述信息
   */
  expressionStr?: string;
  strategy: ASSIGNMENTSTRATEGY_ENUM;
};

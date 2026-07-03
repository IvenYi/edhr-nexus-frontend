// import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { BizServiceEnum } from '@/enums/httpEnum';
import { FormComponents } from '/@page-designer/enum';
import { processDateValue } from '/@/components/Form/src/helper';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
export interface InitNodeOptions {
  /**组件方法 */
  elRef: Record<string, Function> | null;
  /**组件类型 */
  type: FormComponents;
}

export interface PathType {
  key: string;
  action: keyof typeof BizServiceEnum;
  modelCategory?: EntityModelCategoryEnum;
}
export interface EventsConstructor {
  js: string;
  css: string;
  pageKey?: string;
}

export interface processDateValue {
  bizServiceKey: string; //服务key
  button: ButtonTypeEnum;
  message?: string;
  processInstanceId?: string;
  processKey: string; //流程key
}

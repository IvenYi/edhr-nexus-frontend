import { Postion, BorderStyle, EventCategory, GLOBAL_VAR_TYPE } from '../enum';
import { LowCodeWidget } from './widget-basic-types';

export interface PostionOpt {
  label: Postion;
  value: Postion;
}

export interface BorderStyleOpt {
  label: string;
  value: BorderStyle;
}

export interface EventModalState {
  eventCategory: EventCategory;
  inner: LowCodeWidget.InnerEvents[];
  js: {
    isNew: boolean;
    methodName: string;
    extParams: string;
  };
  lo: {
    isNew: boolean;
    methodName: string; //lo函数
    methodTitle?: string; // lo标题
    extParams: string;
  };
}
/**
 * 自动填充配置
 */

export interface AutofillRules {
  /**
   * 是否打开此配置
   */
  open: boolean;
  /**
   * field:填充字段ID
   * widget:填充表单控件ID
   */
  rules: {
    field: string;
    widget: string;
  }[];
}

export interface GlobalVar {
  key: string;
  type: GLOBAL_VAR_TYPE;
  defaultValue?: string;
  description: string;
  /**持久化缓存 */
  appredis: boolean;
}

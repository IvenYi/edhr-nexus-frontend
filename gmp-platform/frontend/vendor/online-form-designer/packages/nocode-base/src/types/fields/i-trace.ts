import { BindCmpStyleEnum } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface ITraceProps extends BaseCoreComponent.FieldBasicProps {
  /** 组件类型 */
  bindCompStyleType: BindCmpStyleEnum;
  /**组件类型 */
  dateType: 'YYYY' | 'YYYY-MM' | 'YYYY-MM-DD';
  /** 分割符 */
  separator: string;
  /** 日期类型 */
  format: string;
  /**是否启用自定义格式化 */
  enableCustomFormat: boolean;
  /** 自定义格式化字符串 */
  customFormat: string;
  /**默认系统日期 */
  defaultSysDate?: boolean;
  /** 自动填充 */
  autofillRules?: Array<{
    fromField: string;
    toField: string;
  }>;
  /** 条码解析规则配置 */
  parseRuleProps?: ParseRuleProps;
}

/**
 * 条码解析规则配置参数
 * @export
 * @interface ParseRuleProps
 */
export interface ParseRuleProps {
  /** 条码解析规则id */
  parsingRuleId?: string;
  /** 条码字段到表单字段的映射 */
  fillMapArr?: Array<{
    /** 条码字段 */
    barcodeField?: string;
    /** 表单字段 */
    formFields?: string[];
  }>;
}

export interface ITrace extends BaseCoreComponent.BasicSchema {
  props: ITraceProps;
}

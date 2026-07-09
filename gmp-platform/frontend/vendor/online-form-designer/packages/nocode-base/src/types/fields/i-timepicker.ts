import type { BaseCoreComponent } from '../common/base';

export interface ITimepickerProps extends BaseCoreComponent.FieldBasicProps {
  /**组件类型 */
  timeType: 'HH:mm:ss' | 'HH:mm' | 'HH';
  /** 时间类型 */
  format: string;
  /**是否启用自定义格式化 */
  enableCustomFormat: boolean;
  /** 自定义格式化字符串 */
  customFormat: string;
  /**默认系统日期 */
  defaultSysDate?: boolean;
}

export interface ITimepicker extends BaseCoreComponent.BasicSchema {
  props: ITimepickerProps;
}

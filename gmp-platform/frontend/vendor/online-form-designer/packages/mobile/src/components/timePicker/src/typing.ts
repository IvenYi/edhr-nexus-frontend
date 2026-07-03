import { type TimePickerColumnType } from 'vant';

export interface openTimePickerType {
  val: string[];
  columnsType?: any[TimePickerColumnType];
  minTime?: string;
  maxTime?: string;
  callback: openPickerCallback;
  /**对选项的文字进行格式化 */
  formatter?: () => void;
  /**对选项数组进行过滤 */
  filter?: () => void;
}

export type openPickerCallback = (value: string) => void;

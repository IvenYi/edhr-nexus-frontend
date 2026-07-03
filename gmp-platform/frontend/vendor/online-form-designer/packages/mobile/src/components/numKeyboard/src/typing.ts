export interface openNumPickerType {
  val: string;
  extra?: string;
  minmax?: {
    maxValue?: number;
    minValue?: number;
  };
  callback: openPickerCallback;
  /**回车事件 */
  onEnter?: () => void;
  /**丢失焦点事件 */
  onBlur?: () => void;
  /**聚焦事件 */
  onFocus?: () => void;
  /**小数精度 */
  precision?: string | number;
}

export type openPickerCallback = (value: string) => void;

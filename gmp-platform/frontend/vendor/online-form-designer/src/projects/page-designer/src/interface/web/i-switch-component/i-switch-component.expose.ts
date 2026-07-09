/**
 * 开关组件
 *
 * @interface ISwitchComponentExpose
 */
export interface ISwitchComponentExpose {
  /**
   * 设置开关状态
   *
   * @param {boolean} value
   */
  setValue(value: boolean): void;

  /**
   * 获取开关状态
   *
   * @return {*} {boolean}
   */
  getValue(): boolean;
}

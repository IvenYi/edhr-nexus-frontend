/**
 * 设备选择组件
 *
 * @interface IDeviceSelectComponentExpose
 */
export interface IDeviceSelectComponentExpose {
  /**
   * 获取选中值

   * @return {*}  {string} 返回字符串
   */
  getValue(): string;

  /**
   * 设置选中值
   *
   * @param {string | string[]} value 设置设备值，组件使用为多选项时传入数组
   */
  setValue(value: string | string[]): void;

  /**
   * 重载数据
   * @param {object} params 重载数据所需参数
   */
  reload(params: object): void;
}

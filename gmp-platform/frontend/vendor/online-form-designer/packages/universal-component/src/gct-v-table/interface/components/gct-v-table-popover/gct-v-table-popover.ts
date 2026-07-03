/**
 * Popover 组件 Props 接口
 *
 * @export
 * @interface GctVTablePopoverProps
 */
export interface GctVTablePopoverProps {
  /**
   * 按钮 x 坐标
   *
   * @type {number}
   */
  x: number;
  /**
   * 按钮 y 坐标
   *
   * @type {number}
   */
  y: number;
  /**
   * 最大宽度
   *
   * @default 400
   * @type {number}
   */
  maxWidth?: number;
  /**
   * 最大高度
   *
   * @default 360
   * @type {number}
   */
  maxHeight?: number;
}

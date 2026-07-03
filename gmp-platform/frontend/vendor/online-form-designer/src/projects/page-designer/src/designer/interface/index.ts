export type * from './i-vue3-dnd-item-options/i-vue3-dnd-item-options';

/**
 * 偏移矩形参数
 *
 * @export
 * @interface IHalfRect
 */
export interface IHalfRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface IPosRect extends IHalfRect {
  width: number;
  height: number;
}

export declare type Alignment = 'start' | 'end';
export declare type Side = 'top' | 'right' | 'bottom' | 'left';
export declare type AlignedPlacement = `${Side}-${Alignment}`;
export declare type Placement = Side | AlignedPlacement;
interface AxesOffsets {
  /**
   * 浮动元素与参考元素之间的间距
   *
   * @author lxm
   * @date 2022-11-16 18:11:27
   * @type {number}
   */
  mainAxis?: number;
  /**
   * 浮动元素与参考元素之间的偏移量，与mainAxis垂直
   *
   * @author lxm
   * @date 2022-11-16 18:11:49
   * @type {number}
   */
  crossAxis?: number;
  alignmentAxis?: number | null;
}

/**
 * 飘窗参数
 *
 * @author chitanda
 * @date 2022-11-08 16:11:37
 * @export
 * @interface IPopoverOptions
 */
export interface IPopoverOptions<O = unknown> {
  /**
   * 飘窗组件类名
   *
   * @type {string}
   */
  className?: string;
  /**
   * 宽度 数字0-100的时候算百分比，100以上算像素px，字符串原样设置
   *
   * @author lxm
   * @date 2022-09-12 20:09:20
   * @type {string | number}
   */
  width?: string | number;
  /**
   * 高度 数字0-100的时候算百分比，100以上算像素px，字符串原样设置
   *
   * @author lxm
   * @date 2022-09-12 20:09:22
   * @type {string | number}
   */
  height?: string | number;
  maxHeight?: string | number;
  /**
   * 展示方向
   *
   * @author chitanda
   * @date 2022-11-08 16:11:41
   * @type {Placement}
   */
  placement?: Placement;
  /**
   * 是否自动关闭
   *
   * @default true
   * @author chitanda
   * @date 2022-11-08 16:11:43
   * @type {boolean}
   */
  autoClose?: boolean;

  /**
   * offset的参数
   *
   * @author lxm
   * @date 2022-11-16 18:11:13
   * @type {(AxesOffsets | number)}
   */
  offsetOpts?: AxesOffsets | number;

  /**
   * 不显示箭头
   *
   * @author lxm
   * @date 2022-11-16 20:11:58
   * @type {boolean}
   */
  noArrow?: boolean;

  /**
   * 原始飘窗参数
   *
   * @author chitanda
   * @date 2024-01-26 09:01:20
   * @type {O}
   */
  options?: O;
}

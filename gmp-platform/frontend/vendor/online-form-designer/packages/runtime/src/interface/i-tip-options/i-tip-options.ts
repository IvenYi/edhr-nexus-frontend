export declare type Alignment = 'start' | 'end';
export declare type Side = 'top' | 'right' | 'bottom' | 'left';
export declare type AlignedPlacement = `${Side}-${Alignment}`;
export declare type Placement = Side | AlignedPlacement;

/**
 * 提示框参数
 *
 * @author chitanda
 * @date 2025-06-23 16:06:23
 * @export
 * @interface ITipOptions
 */
export interface ITipOptions {
  /**
   * 展示方向
   *
   * @author chitanda
   * @date 2022-11-08 16:11:41
   * @type {Placement}
   */
  placement?: Placement;
}

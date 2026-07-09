import { ITableItemState } from '../../interface';

/**
 *
 *
 * @author zhanghanrui
 * @date 2024-04-16 20:04:19
 * @export
 * @class TableITemState
 * @implements {ITableItemState}
 */
export class TableITemState implements ITableItemState {
  /**
   * 是否保活
   *
   * @author zhanghanrui
   * @date 2024-04-17 13:04:32
   * @type {boolean}
   */
  keepalive: boolean = true;

  /**
   * 是否显示
   *
   * @author zhanghanrui
   * @date 2024-04-16 20:04:58
   * @type {boolean}
   */
  visible: boolean = true;
}

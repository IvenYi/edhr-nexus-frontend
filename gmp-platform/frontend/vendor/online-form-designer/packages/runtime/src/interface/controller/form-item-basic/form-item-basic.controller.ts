import { IFormItemBasic } from '../../form';
import { IFormItemBasicState } from '../../state';

/**
 * 表单项基础接口
 *
 * @author zhanghanrui
 * @date 2024-04-01 14:04:46
 * @export
 * @interface IFormItemBasicController
 */
export interface IFormItemBasicController<
  M extends IFormItemBasic = IFormItemBasic,
  S extends IFormItemBasicState = IFormItemBasicState,
> {
  /**
   * 表单项类型
   *
   * @author zhanghanrui
   * @date 2024-04-01 14:04:54
   * @type {string} 表单项类型具体子实现定义
   */
  type: string;

  /**
   * 表单数据
   *
   * @author zhanghanrui
   * @date 2024-04-02 10:04:48
   * @type {IData}
   */
  readonly data: IData;

  /**
   * 表单项模型
   *
   * @author zhanghanrui
   * @date 2024-04-01 14:04:42
   * @type {IFormItemBasic}
   */
  readonly model: M;

  /**
   * 表单项状态
   *
   * @author zhanghanrui
   * @date 2024-04-01 14:04:15
   * @type {IFormItemBasicState}
   */
  state: S;

  /**
   * 表单销毁调用
   *
   * @author zhanghanrui
   * @date 2024-04-03 16:04:32
   */
  destroy(): void;

  /**
   * 状态变化
   *
   * @author chitanda
   * @date 2025-06-24 09:06:38
   * @param {string} stateKey 状态标识
   * @param {*} newState 新状态
   * @param {*} oldState 旧状态
   */
  // stateChange(stateKey: string, newState: any, oldState: any): void;
}

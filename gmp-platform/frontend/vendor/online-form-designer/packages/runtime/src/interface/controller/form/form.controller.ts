import { QXEvent } from 'qx-util';
import { IFormItemProvider } from '../../provider';
import { IFormState } from '../../state';
import { IFormItemBasicController } from '../form-item-basic/form-item-basic.controller';
import { IFormEvent } from '../../events';

/**
 * 表单控制器
 *
 * @author zhanghanrui
 * @date 2024-04-01 13:04:48
 * @export
 * @interface IFormController
 */
export interface IFormController {
  /**
   * 表单内部事件
   *
   * @author zhanghanrui
   * @date 2024-04-02 13:04:51
   * @type {QXEvent<IFormEvent>}
   */
  readonly evt: QXEvent<IFormEvent>;

  /**
   * 表单状态
   *
   * @author zhanghanrui
   * @date 2024-04-01 13:04:51
   * @type {IFormState}
   */
  state: IFormState;

  /**
   * 表单项控制器实例
   *
   * @author zhanghanrui
   * @date 2024-04-01 13:04:17
   * @type {Record<string, IFormItemBasicController>}
   */
  readonly item: Record<string, IFormItemBasicController>;

  /**
   * 表单项适配器实例
   *
   * @author zhanghanrui
   * @date 2024-04-01 19:04:31
   * @type {Record<string, IFormItemProvider>}
   */
  readonly provider: Record<string, IFormItemProvider>;

  /**
   * 表单上下文
   *
   * @author zhanghanrui
   * @date 2024-04-03 14:04:57
   * @type {IParams}
   */
  readonly context: IParams;

  /**
   * 表单参数
   *
   * @author zhanghanrui
   * @date 2024-04-03 14:04:10
   * @type {IParams}
   */
  readonly params: IParams;

  /**
   * 获取表单数据
   *
   * @author zhanghanrui
   * @date 2024-04-01 13:04:32
   * @return {*}  {IData}
   */
  getData(): IData;

  /**
   * 重置表单数据
   *
   * @author zhanghanrui
   * @date 2024-04-01 13:04:52
   */
  resetData(): void;

  /**
   * 加载表单数据
   *
   * @author zhanghanrui
   * @date 2024-04-02 20:04:29
   * @return {*}  {Promise<IData>}
   */
  load(): Promise<IData>;

  /**
   * 数据加载完毕
   *
   * @author zhanghanrui
   * @date 2024-08-01 11:08:42
   */
  loaded(): void;

  /**
   * 组件销毁调用
   *
   * @author zhanghanrui
   * @date 2024-04-03 16:04:26
   */
  destroy(): void;

  /**
   * 校验表单
   * @author lingxiaoming
   * @date 2024-07-19 04:07:54
   * @return {*}  {Promise<boolean>}
   */
  validate(): Promise<boolean>;

  /**
   * 触发指定表单项值规则校验
   *
   * @param {string} key
   * @returns {*}  {Promise<boolean>}
   */
  validateItem(key: string): Promise<boolean>;

  /**
   * 组件初始化完毕
   *
   * @author zhanghanrui
   * @date 2024-08-01 11:08:18
   */
  mounted(): void;
}

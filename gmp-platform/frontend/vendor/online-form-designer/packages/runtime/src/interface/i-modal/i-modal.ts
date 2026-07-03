import { AsyncSeriesHook } from 'qx-util';
import { IModalData } from '../i-modal-data/i-modal-data';

type ModalHooks = {
  shouldDismiss: AsyncSeriesHook<
    [],
    {
      allowClose?: boolean;
    }
  >;
  beforeDismiss: AsyncSeriesHook<[], IModalData>;
};

/**
 * 模态操作对象，在模态等形式打开视图时，操作类需给视图注入此对象实现类
 *
 * @author zhanghanrui
 * @date 2024-03-19 21:03:44
 * @export
 * @interface IModal
 */
export interface IModal {
  /**
   * 是否忽略关闭检查，用于强制关闭视图
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:50
   * @type {boolean}
   */
  ignoreDismissCheck: boolean;

  /**
   * 钩子
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:55
   * @type {ModalHooks}
   */
  hooks: ModalHooks;

  /**
   * 模态界面状态
   *
   * @type {{
   *     okDisabled?: boolean; // 确认按钮是否禁用
   *     cancelDisabled?: boolean; // 取消按钮是否禁用
   *   }}
   */
  state: {
    okDisabled?: boolean; // 确认按钮是否禁用
    cancelDisabled?: boolean; // 取消按钮是否禁用
  };

  /**
   * 统一关闭入口
   *
   * @author zhanghanrui
   * @date 2024-03-19 21:03:04
   */
  dismiss: (data?: IModalData) => Promise<boolean>;
  /**
   * 设置模态框属性
   * @param options
   * @returns
   */
  setOptions?: (options: object) => void;
  /**
   * 确认操作
   *
   * @author zhanghanrui
   * @date 2024-03-25 16:03:37
   */
  ok?: () => Promise<IModalData | null>;

  /**
   * 提供 vue 文件下的回调注入，用于模态确认操作回调
   *
   * @param {(() => Promise<IModalData | null>)} [ok]
   * @param {() => Promise<boolean>} [cancel]
   */
  callback(ok?: () => Promise<IModalData | null>, cancel?: () => Promise<boolean>): void;

  /**
   * 取消操作
   *
   * @author zhanghanrui
   * @date 2024-03-25 16:03:01
   */
  cancel?: () => Promise<boolean>;
}

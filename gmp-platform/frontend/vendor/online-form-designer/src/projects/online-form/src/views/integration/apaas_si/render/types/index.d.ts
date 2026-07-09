import { IBaseButtonConfig } from '/@app-designer/views/online-form/components/base-button-setting';

export interface IActionButtonItem extends IBaseButtonConfig {
  /** 自定义按钮标题 */
  customTitle?: string;
  /** 不需要刷新表单 */
  notNeedRefreshForm?: boolean;
  /** 来自于表单变更审核 */
  belongFormChangeApproval?: boolean;
  /** 回调接口api */
  api?: Function;
}

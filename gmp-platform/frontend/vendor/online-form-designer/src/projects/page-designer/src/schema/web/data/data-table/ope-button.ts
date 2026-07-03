import { ButtonColorTheme, ButtonColorType, FormComponents, Platform } from '/@page-designer/enum';
import { OperateButton } from '/@page-designer/types/web';
import {} from '/@page-designer/types/widget-basic-types';

export const widget: OperateButton = {
  //字段标识
  id: '',
  type: FormComponents.OpeButton,
  // 国际化信息
  i18n: {},
  name: '',
  alias: '',
  icon: '',
  platform: Platform.WEB,
  props: {
    buttonTheme: ButtonColorTheme.DEFAULT,
    buttonType: ButtonColorType.LINK,
    icon: '',
    sysMethedType: undefined,
    linkPage: '',
    label: '',
    /**二次确认 */
    confirm: false,
    confirmText: '',
    eventName: '',
    innerEvent: false,
    displayRule: '',
    // ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
};

import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import commonStyle from '../../common-config/common-style';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { buttonProps, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { baseBtnProp } from '../../common-config/base-button-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.copy',
  alias: '',
  type: FormComponents.SubTableCopyBtn,
  display: DisplayEnums.INLINE_BLOCK,
  icon: 'icon-fuzhi1',
  children: [],
  internal: true,
  props: {
    ...baseBtnProp,
    title: '${sys.copy}',
    icon: '',
    type: 'link',
  },
  style: {},
  events: {},
  formItem: false,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'text-editor',
    name: 'title',
    label: 'sys.pageDesigner.title',
    group: PropGroup.BUTTON,
    _config: {
      i18n: true,
      maxlength: 10,
      showCount: true,
      defaultValue: 'sys.copy'
    },
  },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeCopy',
    title: 'sys.pageDesigner.beforeCopy',
    params: [],
  },
  {
    name: 'afterCopy',
    title: 'sys.pageDesigner.afterCopy',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };

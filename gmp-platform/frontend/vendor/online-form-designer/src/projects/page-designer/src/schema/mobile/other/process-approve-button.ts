import { Platform, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { approveButton } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { buttonEditor, buttonStyleEditor } from '../../common-config/button-editor-config';
import { baseBtnProp } from '../../common-config/base-button-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: approveButton = {
  id: '',
  platform: Platform.MOBILE,
  name: '',
  alias: '',
  type: FormComponents.ProcessApproveButton,
  display: DisplayEnums.INLINE_BLOCK,
  icon: 'icon-Custom',
  children: [],
  props: {
    ...baseBtnProp,
    title: '',
    icon: '',
    noDelete: true,
    noEdit: true,
    action: undefined,
  },
  style: {},
  events: {},
  formItem: false,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  // {
  //   component: 'text-editor',
  //   name: 'title',
  //   label: 'sys.pageDesigner.title',
  //   group: PropGroup.BUTTON,
  //   _config: {
  //     i18n: true,
  //     maxlength: 10,
  //     showCount: true,
  //   },
  // },

  ...buttonEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeClick',
    title: 'sys.pageDesigner.beforeClick',
    params: [],
  },
  {
    name: 'afterClick',
    title: 'sys.pageDesigner.afterClick',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

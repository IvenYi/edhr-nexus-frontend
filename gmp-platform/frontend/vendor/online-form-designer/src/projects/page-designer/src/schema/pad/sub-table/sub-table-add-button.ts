import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import commonStyle from '../../common-config/common-style';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { buttonProps, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { baseBtnProp } from '../../common-config/base-button-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.PAD,
  name: 'sys.pageDesigner.createNew',
  alias: '',
  type: FormComponents.SubTableAddBtn,
  display: DisplayEnums.INLINE_BLOCK,
  icon: 'icon-Custom',
  children: [],
  internal: true,
  props: {
    ...baseBtnProp,
    title: '${sys.pageDesigner.createNew}',
    icon: 'icon-park:add',
    // ...displayProps,
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
      showCount: true,
      maxlength: 10,
      defaultValue: 'sys.pageDesigner.createNew'
    },
  },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeAdd',
    title: 'sys.pageDesigner.beforeAdd',
    params: [],
  },
  {
    name: 'afterAdd',
    title: 'sys.pageDesigner.afterAdd',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };

import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor } from '../../common-config/display-editor-config';
import { buttonEditor, buttonStyleEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { baseBtnProp } from '../../common-config/base-button-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.PAD,
  name: 'sys.pageDesigner.deletebutton',
  alias: '',
  type: FormComponents.BatchDeleteButton,
  display: DisplayEnums.INLINE_BLOCK,
  icon: 'icon-Custom',
  children: [],
  props: {
    ...baseBtnProp,
    title: '${sys.delete}',
    icon: 'icon-park:writing-fluently',

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
      defaultValue: 'sys.pageDesigner.deletebutton'
    },
  },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeDelete',
    title: 'sys.pageDesigner.beforeDelete',
    params: [],
  },
  {
    name: 'afterDelete',
    title: 'sys.pageDesigner.afterDelete',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { approveButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { buttonEditor, buttonStyleEditor } from '../../common-config/button-editor-config';
import { baseBtnProp } from '../../common-config/base-button-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: approveButton = {
  id: '',
  platform: Platform.WEB,
  name: '',
  alias: '',
  type: FormComponents.ProcessApproveButton,
  display: DisplayEnums.INLINE_BLOCK,
  icon: 'icon-Custom',
  children: [],
  props: {
    ...baseBtnProp,
    processId: '',
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

export const propEditorList: LowCodeWidget.PropEditor[] = [...buttonEditor];

export const eventList: (w) => LowCodeWidget.EventsType[] = (widget) => {
  const action = widget.props.action;
  return [
    {
      name: `after${action}`,
      title: `sys.pageDesigner.after${action}`,
      params: [],
    },
    {
      name: `before${action}`,
      title: `sys.pageDesigner.before${action}`,
      params: [],
    },
  ];
};

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

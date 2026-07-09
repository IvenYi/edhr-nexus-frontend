import { Platform, PropGroup, DisplayEnums } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { buttonStyleEditor } from '../../common-config/button-editor-config';
import { baseBtnProp } from '../../common-config/base-button-config';
import { schemaType as MedProKitButtonType } from '/@page-designer/_kit/kit-medpro/web/button-group/type';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.deletebutton',
  alias: '',
  type: MedProKitButtonType.DELETE,
  display: DisplayEnums.INLINE_BLOCK,
  displayName: 'sys.pageDesigner.toolkitButton.delete',
  icon: 'icon-shanchu2',
  children: [],
  props: {
    ...baseBtnProp,
    title: '${sys.delete}',
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
    },
  },
  {
    component: 'permission-editor',
    label: '',
    group: PropGroup.PERMISSION,
  },
  {
    component: 'switch-editor',
    name: 'confirm',
    label: 'sys.pageDesigner.confirm',
    group: PropGroup.ButtonStyle,
    _config: {
      tooltip: 'sys.pageDesigner.buttonConfirm',
    },
  },
  {
    component: 'texteare-editor',
    name: 'confirmText',
    label: 'sys.pageDesigner.regHint',
    group: PropGroup.ButtonStyle,
    _config: {
      i18n: true,
      placeholder: 'sys.pageDesigner.confirmTodo',
    },
    hidden: (widget): boolean => {
      return !widget.props.confirm;
    },
  },
  {
    component: 'dependency-editor',
    name: 'componentDependency',
    label: '',
    group: PropGroup.COMPONENTDEPENDENCY,
  },
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

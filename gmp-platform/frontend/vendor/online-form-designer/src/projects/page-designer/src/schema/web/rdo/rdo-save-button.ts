import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  StyleGroup,
} from '/@page-designer/enum';
import { Button } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { buttonProps, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: Button = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.savebutton',
  alias: '',
  type: FormComponents.RdoSaveButton,
  display: DisplayEnums.INLINE_BLOCK,
  internal: true,
  icon: 'icon-baocun',
  children: [],
  props: {
    title: '${sys.pageDesigner.savebutton}',
    ...displayProps,
    basic: buttonProps,
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
      defaultValue: 'sys.pageDesigner.savebutton',
    },
  },
  {
    component: 'ref-form-editor',
    name: 'refForm',
    label: 'sys.pageDesigner.refForm',
    group: PropGroup.BUTTON,
    required: true,
    onMounted(widget: Button) {
      if (!widget.props.refForm) return;
      const { excludeSubTableFormWidget } = useDesigner();
      const formWidget = excludeSubTableFormWidget.value.find(
        (item) => item.id === widget.props.refForm,
      );
      if (!formWidget) {
        widget.props.refForm = undefined;
      }
    },
  },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeSubmit',
    title: 'sys.pageDesigner.beforeSubmit',
    params: ['formdata'],
  },
  {
    name: 'afterSubmit',
    title: 'sys.pageDesigner.afterSubmit',
    params: ['id'],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
  },
];

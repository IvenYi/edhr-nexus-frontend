import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor } from '../../common-config/display-editor-config';
import { buttonStyleEditor, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { baseBtnProp } from '../../common-config/base-button-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.submitbutton',
  alias: '',
  type: FormComponents.SubmitButton,
  display: DisplayEnums.INLINE_BLOCK,
  displayName: 'sys.pageDesigner.toolkitButton.submit',
  icon: 'icon-tijiao1',
  children: [],
  props: {
    ...baseBtnProp,
    refForm: '',
    title: '${sys.pageDesigner.submit}',
    icon: 'icon-park:check-one',
    // ...displayProps,
    // basic: buttonProps,
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
      defaultValue: 'sys.pageDesigner.submit'
    },
  },
  {
    component: 'ref-form-editor',
    name: 'refForm',
    label: 'sys.pageDesigner.refForm',
    group: PropGroup.BUTTON,
    required: true,
    onMounted(widget: BaseButton) {
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
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

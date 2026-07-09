import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { ResetButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor } from '../../common-config/display-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { baseBtnProp } from '../../common-config/base-button-config';
import { buttonEditor, buttonStyleEditor } from '../../common-config/button-editor-config';
import { ResetRuleType } from '@gct/runtime';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: ResetButton = {
  id: '',
  platform: Platform.PAD,
  name: 'sys.pageDesigner.resetbutton',
  alias: '',
  type: FormComponents.ResetButton,
  icon: 'icon-recover',
  children: [],
  display: DisplayEnums.INLINE_BLOCK,
  displayName: 'sys.pageDesigner.toolkitButton.reset',
  props: {
    ...baseBtnProp,
    refForm: undefined,
    title: '${sys.reset}',
    icon: 'icon-park:refresh',
    resetRule: ResetRuleType.WIPE_DATA,
  },
  style: {},
  events: {},
  formItem: false,
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
      defaultValue: 'sys.reset',
    },
  },
  {
    component: 'ref-form-editor',
    name: 'refForm',
    label: 'sys.pageDesigner.refForm',
    group: PropGroup.BUTTON,
    required: true,
    _config: {
      multiple: true,
    },
    onMounted(widget: ResetButton) {
      // if (!widget.props.refForm) return;
      // const { excludeSubTableFormWidget } = useDesigner();
      // const formWidget = excludeSubTableFormWidget.value.find((item) =>
      //   widget.props.refForm?.includes(item.id),
      // );
      // if (!formWidget) {
      //   widget.props.refForm = undefined;
      // }
    },
  },
  {
    component: 'radio-editor',
    name: 'resetRule',
    label: 'sys.pageDesigner.resetRule',
    group: PropGroup.BUTTON,
    hidden: (widget) => !widget.props.refForm,
    onMounted(widget: ResetButton) {
      if (!widget.props.resetRule) {
        widget.props.resetRule = ResetRuleType.WIPE_DATA;
      }
    },
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.' + ResetRuleType.WIPE_DATA,
          value: ResetRuleType.WIPE_DATA,
        },
        {
          label: 'sys.pageDesigner.' + ResetRuleType.REFRESHDATA,
          value: ResetRuleType.REFRESHDATA,
        },
      ],
    },
  },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  // {
  //   name: 'onClick',
  //   title: 'sys.pageDesigner.onClick',
  //   params: [],
  // },
  {
    name: 'beforeReset',
    title: 'sys.pageDesigner.beforeReset',
    params: [],
  },
  {
    name: 'afterReset',
    title: 'sys.pageDesigner.afterReset',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

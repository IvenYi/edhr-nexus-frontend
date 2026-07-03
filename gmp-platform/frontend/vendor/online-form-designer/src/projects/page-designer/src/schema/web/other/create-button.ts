import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor } from '../../common-config/display-editor-config';
import { buttonStyleEditor, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';
import { baseBtnProp } from '../../common-config/base-button-config';

const { t } = useI18n();
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.createbutton',
  alias: '',
  type: FormComponents.CreateButton,
  display: DisplayEnums.INLINE_BLOCK,
  displayName: 'sys.pageDesigner.toolkitButton.create',
  icon: 'icon-chuangjian',
  children: [],
  props: {
    ...baseBtnProp,
    title: '${sys.new}',
    // ...displayProps,
    refForm: '',
    refList: undefined,
    // basic: buttonProps,
    icon: 'icon-park:add',
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
      defaultValue: 'sys.new'
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
  {
    component: 'select-editor',
    name: 'refList',
    label: 'sys.pageDesigner.refList',
    group: PropGroup.BUTTON,
    _config: {
      options: () => {
        const { allListWidget } = useDesigner();
        return allListWidget.value.map((i) => {
          return { label: `${t(i.name)} ${i.id}`, value: i.id };
        });
      },
    },
    hidden(widget: BaseButton) {
      return !widget.props.refForm;
    },
  },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onClick',
    title: 'sys.pageDesigner.onClick',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

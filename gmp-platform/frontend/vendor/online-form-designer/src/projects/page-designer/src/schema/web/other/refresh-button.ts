import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor } from '../../common-config/display-editor-config';
import { buttonStyleEditor, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { baseBtnProp } from '../../common-config/base-button-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.refreshbutton',
  alias: '',
  type: FormComponents.RefreshButton,
  display: DisplayEnums.INLINE_BLOCK,
  displayName: 'sys.pageDesigner.toolkitButton.refresh',
  icon: 'icon-shuaxin',
  children: [],
  props: {
    ...baseBtnProp,
    title: '${sys.redo}',
    // ...displayProps,
    refForm: '',
    icon: 'icon-park:redo',
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
      defaultValue: 'sys.redo'
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
      const formWidget = excludeSubTableFormWidget.value.find((item) =>
        widget.props.refForm?.includes(item.id),
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
    name: 'beforeRefresh',
    title: 'sys.pageDesigner.beforeRefresh',
    params: [],
  },
  {
    name: 'afterRefresh',
    title: 'sys.pageDesigner.afterRefresh',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { ProcessButton } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor } from '../../common-config/display-editor-config';
import { buttonStyleEditor, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';
import { UserServiceType } from '/@app-designer/enum';
import { baseBtnProp } from '../../common-config/base-button-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: ProcessButton = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.pageDesigner.process',
  alias: '',
  type: FormComponents.ProcessButton,
  display: DisplayEnums.INLINE_BLOCK,
  displayName: 'sys.pageDesigner.process',
  icon: 'icon-liucheng',
  children: [],
  props: {
    ...baseBtnProp,
    title: '${sys.pageDesigner.process}',
    refForm: '',
    model: undefined,
    refService: undefined,
    icon: 'icon-park:whole-site-accelerator',
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
      defaultValue: 'sys.pageDesigner.process'
    },
  },
  {
    component: 'select-editor',
    name: 'refForm',
    label: 'sys.pageDesigner.refProcessForm',
    group: PropGroup.BUTTON,
    required: true,
    _config: {
      selectChange(widget, value, row) {
        widget.props.model = row?.model;
      },
      options: async (widget) => {
        const { getWidgetByScope } = useDesigner();
        return getWidgetByScope(FormComponents.FormProcess)
          .filter((i) => i.props.model)
          .map((i) => {
            return { label: `${$t(i.alias)} ${i.id}`, value: i.id, model: i.props.model };
          });
      },
    },
  },
  {
    component: 'select-editor',
    name: 'refService',
    label: 'sys.pageDesigner.refService',
    group: PropGroup.BUTTON,
    hidden: (widget) => !widget.props.refForm,
    _config: {
      options: async (widget) => {
        if (!widget.props.model) return [];
        const data = (await getBizServiceCrudList({ modelKey: widget.props.model })) || [];
        return data
          .filter((i) => i.type !== UserServiceType.BUILTIN_SERVICE)
          .map((i) => {
            return { value: i.key, label: i.name };
          });
      },
    },
  },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeSubmit',
    title: 'sys.pageDesigner.beforeProcess',
    params: [],
  },
  {
    name: 'afterSubmit',
    title: 'sys.pageDesigner.endProcess',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

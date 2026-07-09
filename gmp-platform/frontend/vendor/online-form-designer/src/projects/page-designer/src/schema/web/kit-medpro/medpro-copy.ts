import { Platform, PropGroup, DisplayEnums, FormComponents } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { buttonStyleEditor } from '../../common-config/button-editor-config';
import { baseBtnProp } from '../../common-config/base-button-config';
import { schemaType as MedProKitButtonType } from '/@page-designer/_kit/kit-medpro/web/button-group/type';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { findNodeAll } from '/@/utils/helper/treeHelper';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { getCompPos } from '/@page-designer/schema/utils';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.copybutton',
  alias: '',
  type: MedProKitButtonType.COPY,
  display: DisplayEnums.INLINE_BLOCK,
  displayName: 'sys.pageDesigner.toolkitButton.copy',
  icon: 'icon-fuzhi1',
  children: [],
  props: {
    ...baseBtnProp,
    title: '${sys.copy}',
    showModal: false,
    refModal: undefined,
    refForm: undefined,
    icon: 'icon-park:copy',
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
  {
    component: 'switch-editor',
    name: 'openModal',
    label: 'sys.pageDesigner.openModal',
    group: PropGroup.BUTTON,
    changeCallback(widget) {
      widget.props.refModal = undefined;
      widget.props.refForm = undefined;
    },
  },
  {
    component: 'select-editor',
    name: 'refModal',
    label: 'sys.pageDesigner.modalBox',
    group: PropGroup.BUTTON,
    required: true,
    changeCallback(widget) {
      widget.props.refForm = undefined;
    },
    _config: {
      options: () => {
        const { pageJson } = useDesigner();
        return pageJson.modals.map((i) => {
          return { label: `${$t(i.modalName)}[${i.id}] `, value: i.id };
        });
      },
    },
    hidden: (widget): boolean => {
      return !widget.props.openModal;
    },
  },
  {
    component: 'select-editor',
    name: 'refForm',
    label: 'sys.pageDesigner.assignPage',
    group: PropGroup.BUTTON,
    required: true,
    _config: {
      options: (widget) => {
        if (!widget.props.refModal) return [];
        const { pageJson } = useDesigner();
        const scope =
          pageJson.modals.find((modal) => widget.props.refModal === modal.id)?.children || [];
        return findNodeAll(scope, (widget) => {
          if (
            widget.type === FormComponents.RdoForm ||
            widget.type === FormComponents.MedProRdoForm
          ) {
            return true;
          }
          return (
            widget.type === FormComponents.Form &&
            !getCompPos(widget, FIELD_TYPE.MASTERSLAVE, FormComponents.Form)
          );
        }).map((i) => {
          return { value: i.id, label: `${$t(i.name)}[${i.id}] ` };
        });
      },
    },
    hidden: (widget): boolean => {
      return !widget.props.openModal;
    },
  },
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

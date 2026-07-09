import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import commonStyle from '../../common-config/common-style';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { buttonProps, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { baseBtnProp } from '../../common-config/base-button-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { findNodeAll } from '/@/utils/helper/treeHelper';
import { getCompPos } from '/@page-designer/schema/utils';
import { FIELD_TYPE } from '@gct/runtime';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.copy',
  alias: '',
  type: FormComponents.SubTableCopyBtn,
  display: DisplayEnums.INLINE_BLOCK,
  icon: 'icon-fuzhi1',
  children: [],
  internal: true,
  props: {
    ...baseBtnProp,
    model: '',
    title: '${sys.copy}',
    icon: '',
    type: 'link',
    refModal: undefined,
    refForm: undefined,
    excludeField: [],
    syncBtnNameToModal: false,
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
      defaultValue: 'sys.copy',
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
    hidden(widget: any) {
      return [FormComponents.SubTable, FormComponents.SubDataTable, FormComponents.DynamicTable].includes(widget.parentComponent)
    },
  },
  {
    component: 'checkbox-editor',
    name: 'syncBtnNameToModal',
    label: '',
    group: PropGroup.BUTTON,
    hidden(widget: any) {
      return [FormComponents.SubTable, FormComponents.SubDataTable, FormComponents.DynamicTable].includes(widget.parentComponent)
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
        return findNodeAll(scope, (w) => {
          return (
            [
              FormComponents.Form,
              FormComponents.RdoForm,
              FormComponents.MedProRdoForm,
              FormComponents.FormProcess,
            ].includes(w.type) &&
            !getCompPos(w, FIELD_TYPE.MASTERSLAVE, FormComponents.Form) &&
            w.props?.model === widget.props.model
          );
        }).map((i) => {
          return { value: i.id, label: `${$t(i.name)}[${i.id}] ` };
        });
      },
    },
    hidden(widget: any) {
      return [FormComponents.SubTable, FormComponents.SubDataTable, FormComponents.DynamicTable].includes(widget.parentComponent)
    },
  },

  {
    component: 'add-field-list-editor',
    name: 'excludeField',
    label: 'sys.pageDesigner.copyConfig',
    group: PropGroup.BUTTON,
    _config: {
      excludeFieldType: [FIELD_TYPE.SERIAL],
      modelKey: 'model',
    },
    hidden(widget: any) {
      return [FormComponents.SubTable, FormComponents.SubDataTable, FormComponents.DynamicTable].includes(widget.parentComponent)
    },
  },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeCopy',
    title: 'sys.pageDesigner.beforeCopy',
    params: [],
  },
  {
    name: 'afterCopy',
    title: 'sys.pageDesigner.afterCopy',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };

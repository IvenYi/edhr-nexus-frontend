import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor } from '../../common-config/display-editor-config';
import { buttonStyleEditor, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';
import { baseBtnProp } from '../../common-config/base-button-config';
import { findNodeAll } from '/@/utils/helper/treeHelper';
import { FIELD_TYPE } from '@gct/runtime';

const { t } = useI18n();

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.version_copyText',
  alias: '',
  type: FormComponents.CopyVersionButton,
  display: DisplayEnums.INLINE_BLOCK,
  icon: 'icon-fuzhibanben',
  children: [],
  props: {
    ...baseBtnProp,
    title: '${sys.pageDesigner.version_copyText}',
    refModal: undefined,
    refForm: undefined,
    excludeField: [],
    type: 'link',
    icon: 'icon-park:copy-link',
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
      showCount: true,
      maxlength: 32,
      defaultValue: 'sys.pageDesigner.version_copyText',
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
  },
  {
    component: 'checkbox-editor',
    name: 'syncBtnNameToModal',
    label: '',
    group: PropGroup.BUTTON,
    // hidden(widget: any) {
    //   return !widget.props.refModal;
    // },
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
              FormComponents.RdoForm,
              FormComponents.MedProRdoForm,
              FormComponents.FormProcess,
            ].includes(w.type) && w.props?.model === widget.props.model
          );
        }).map((i) => {
          return { value: i.id, label: `${$t(i.name)}[${i.id}] ` };
        });
      },
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

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

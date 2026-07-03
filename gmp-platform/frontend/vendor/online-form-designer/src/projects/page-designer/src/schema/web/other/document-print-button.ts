import { DisplayEnums, FormComponents, Platform, PropGroup } from '../../../enum';
import { Descriptions, DocumentPrintButton } from '../../../types/web';
import { LowCodeWidget } from '../../../types/widget-basic-types';
import { baseBtnProp } from '../../common-config/base-button-config';
import { buttonEditor, buttonStyleEditor } from '../../common-config/button-editor-config';
import { displayEditor } from '../../common-config/display-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { useDesigner } from '../../../hooks/useDesigner';
import { getDocumentList } from '/@/apis/gct-apaas/DocumentController';
import { beginDrag } from '../../utils';
import { CreateType, MaterialEnum } from '/@/enums/appEnum';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { FIELD_TYPE, KeyMode, TransactionMode, PrintModeEnums } from '@gct/runtime';
import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';

export const widget: DocumentPrintButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.documentPrintButton',
  alias: '',
  type: FormComponents.DocumentPrintButton,
  icon: 'icon-dayinanniu',
  children: [],
  display: DisplayEnums.INLINE_BLOCK,
  displayName: 'sys.pageDesigner.toolkitButton.documentPrint',
  props: {
    ...baseBtnProp,
    model: '',
    documentType: KeyMode.SYSTEM,
    ruleConfig: {},
    printField: '',
    title: '${sys.documentPrint}',
    icon: 'icon-park:printer',
    documentKey: '',
    printMode: PrintModeEnums.PREVIEW_PRINT,
    refModel: '',
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
      defaultValue: 'sys.documentPrint'
    },
  },
  {
    component: 'ref-form-editor',
    name: 'refForm',
    label: 'sys.pageDesigner.refForm',
    group: PropGroup.BUTTON,
    required: true,
    hidden(widget: any) {
      return widget.parentComponent === FormComponents.DataTable || widget.parentComponent === FormComponents.DataVTable;
    },
    _config: {
      filterFn: (item) => !!item.props.model,
    },
    changeCallback(widget: DocumentPrintButton, value: string) {
      widget.props.documentKey = '';
      const { excludeSubTableFormWidget } = useDesigner();
      const formWidget = excludeSubTableFormWidget.value.find((item) => item.id === value);
      if (formWidget) {
        widget.props.model = formWidget.props.model!;
      } else {
        widget.props.model = undefined;
      }
    },
    onMounted(widget: DocumentPrintButton) {
      if (!widget.props.refForm) return;
      if (!widget.props.model) {
        widget.props.model = widget.props.refModel;
      }
      const { excludeSubTableFormWidget } = useDesigner();
      const formWidget = excludeSubTableFormWidget.value.find(
        (item) => item.id === widget.props.refForm,
      );
      if (formWidget) {
        /**说明表单的模型切换了 */
        if (widget.props.model !== formWidget.props.model) {
          widget.props.model = formWidget.props.model!;
          widget.props.documentKey = '';
        }
      } else {
        /**表单被删除了 */
        widget.props.model = undefined;
        widget.props.refForm = undefined;
        widget.props.documentKey = '';
      }
    },
  },
  {
    component: 'label-rdo-editor',
    name: { list: 'documentType;documentKey' },
    label: 'sys.pageDesigner.documentTemplate',
    group: PropGroup.BUTTON,
    hidden: (widget) => !widget.props.model,
    _config: {
      tooltip: [
        '1.系统模板可选择应用设计器中维护的单据模板;',
        '2.业务模板可选择关联表单中的单据模板模型字段;',
      ],
      width: 70,
      moduleType: PrintTypeEnum.RECEIPT,
      options: [
        {
          label: 'sys.pageDesigner.system',
          value: KeyMode.SYSTEM,
        },
        { label: 'sys.pageDesigner.transaction', value: KeyMode.TRANSACTION },
      ],
      options2: async (widget, val, _data) => {
        if (val) {
          if (val === KeyMode.SYSTEM) {
            const data = (await getDocumentList({ modelKey: widget.props.model })) || [];
            return data.map((i) => {
              return { value: i.key, label: i.name };
            });
          }
          if (val === KeyMode.TRANSACTION) {
            return [
              { value: TransactionMode.CURRENT, label: 'sys.pageDesigner.currentModel' },
              { value: TransactionMode.REFERENCE, label: 'sys.pageDesigner.referenceOtherModel' },
            ];
          }
        }
        return [];
      },
    },
  },
  {
    component: 'select-editor',
    name: 'printField',
    label: '',
    group: PropGroup.BUTTON,
    hidden: (widget) => {
      return !widget.props.model || widget.props.documentKey !== TransactionMode.CURRENT;
    },
    _config: {
      placeholder: 'sys.pageDesigner.pleaseSelectDocumentTemplateFieldCurrentModel',
      options: async (widget) => {
        const files = await getFieldMetaList({
          includeBuiltin: true,
          sys: false,
          modelKey: widget.props.model,
        });
        if (files) {
          return files
            .filter((i) => i.type === FIELD_TYPE.DOCUMENT_TEMPLATE)
            .map((i) => {
              return { value: i.key, label: i.name };
            });
        }
      },
    },
  },
  {
    component: 'reference-relationship-editor',
    name: 'ruleConfig',
    label: '',
    group: PropGroup.BUTTON,
    _config: {
      modelKey: 'model',
      filterFields: [FIELD_TYPE.REF],
      filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      modalTitle: 'sys.pageDesigner.configReferenceRelationship',
      contentTitle: 'sys.pageDesigner.createReferenceDiagram',
      endPlaceholder: 'sys.pageDesigner.pleaseSelectDocumentTemplateFields',
      endFieldTypes: [FIELD_TYPE.DOCUMENT_TEMPLATE],
    },
    hidden(widget) {
      return !widget.props.model || widget.props.documentKey !== TransactionMode.REFERENCE;
    },
  },
  {
    component: 'radio-editor',
    name: 'printMode',
    label: 'sys.pageDesigner.printMode',
    group: PropGroup.BUTTON,
    hidden: (widget) => !widget.props.model,
    _config: {
      options: [
        {
          value: PrintModeEnums.PREVIEW_PRINT,
          label: 'sys.pageDesigner.documentPrintButtonOption.previewPrint',
        },
        {
          value: PrintModeEnums.DIRECT_PRINTING,
          label: 'sys.pageDesigner.documentPrintButtonOption.directPrinting',
        },
      ],
    },
  },
  {
    component: 'table-field-list-editor',
    name: 'root:children',
    label: 'sys.pageDesigner.fieldProp',
    required: true,
    group: PropGroup.BUTTON,
    hidden(widget) {
      return !widget.props.model;
    },
    _config: {
      modelByKey: 'model',
      createField: (item, widget: DocumentPrintButton) => {
        try {
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.DescriptionsFormField,
            preLocation: widget.id,
          });
          return fieldWidget;
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforePrint',
    title: 'sys.pageDesigner.beforePrint',
    params: [],
  },
  {
    name: 'afterPrint',
    title: 'sys.pageDesigner.afterPrint',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

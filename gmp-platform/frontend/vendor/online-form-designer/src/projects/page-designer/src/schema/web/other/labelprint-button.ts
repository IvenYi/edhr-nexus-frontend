import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { LabelPrintButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor } from '../../common-config/display-editor-config';
import { buttonStyleEditor, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';
import { UserServiceType } from '/@app-designer/enum';
import { baseBtnProp } from '../../common-config/base-button-config';
import { FIELD_TYPE, PrintModeEnums, KeyMode, TransactionMode, CreateType } from '@gct/runtime';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { getPrintPrintDropdownList } from '/@/apis/gct-apaas/PrintController';
import { h } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';

const { t } = useI18n();

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: LabelPrintButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.labelprint',
  alias: '',
  type: FormComponents.LabelPrintButton,
  icon: 'icon-biaoqian1',
  children: [],
  display: DisplayEnums.INLINE_BLOCK,
  props: {
    ...baseBtnProp,
    printMode: PrintModeEnums.Local,
    labelMode: KeyMode.SYSTEM,
    printType: KeyMode.SYSTEM,
    printVal: '',
    printKey: '',
    serverKey: '',
    refModel: '',
    model: '',
    refForm: '',
    title: '${sys.pageDesigner.labelprint}',
    icon: 'icon-park:printer',
    printField: '',
    printRuleConfig: '',
    ruleConfig: '',
    printRefType: '',
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
      defaultValue: 'sys.pageDesigner.labelprint',
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
    changeCallback(widget: LabelPrintButton, value: string) {
      widget.props.printKey = undefined;
      widget.props.serverKey = undefined;
      const { excludeSubTableFormWidget } = useDesigner();
      const formWidget = excludeSubTableFormWidget.value.find((item) => item.id === value);
      if (formWidget) {
        widget.props.model = formWidget.props.model!;
      } else {
        widget.props.model = undefined;
      }
    },
    onMounted(widget: LabelPrintButton) {
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
          widget.props.printKey = undefined;
          widget.props.serverKey = undefined;
        }
      } else {
        /**表单被删除了 */
        widget.props.model = undefined;
        widget.props.refForm = undefined;
        widget.props.printKey = undefined;
        widget.props.serverKey = undefined;
      }
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
          label: 'sys.pageDesigner.localPrint',
          value: PrintModeEnums.Local,
        },
        {
          label: 'sys.pageDesigner.servicePrint',
          value: PrintModeEnums.Server,
        },
      ],
    },
  },
  {
    component: 'linkage-editor',
    name: { list: 'printType;printRefType' },
    label: 'sys.pageDesigner.printer',
    group: PropGroup.BUTTON,
    hidden: (widget) => {
      return !widget.props.model || widget.props.printMode !== PrintModeEnums.Server;
    },
    _config: {
      tooltip: [
        '1.系统类型可选择集成中心中连接的打印机;',
        '2.业务类型可选择关联表单中的打印机模型字段;',
      ],
      width: 70,
      isTreeSelect: (data) => {
        return data.printType === KeyMode.SYSTEM;
      },
      slots: {
        title: (_) => {
          return !Object.prototype.hasOwnProperty.call(_, 'selected')
            ? _.dftPrintInfo?.label || _.label
            : _.defaultPrint === '是'
            ? h('div', { class: 'ks-row', style: { maxWidth: '180px' } }, [
                h('div', { class: 'gct-text-overflow', title: _.name }, _.name),
                h(
                  'div',
                  { class: 'gct-custom-tag ml8px', style: { wordBreak: 'keep-all' } },
                  t('sys.default'),
                ),
              ])
            : _.name;
        },
      },
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
            const data = (await getPrintPrintDropdownList()) || [];
            const arr: any[] = [];
            data.forEach((i) => {
              const dftInfo =
                (i.printChildNode && i.printChildNode.filter((e) => e.defaultPrint === '是')[0]) ||
                undefined;
              i.label = i.name;
              i.value = i.printKey;
              i.children = i.printChildNode || [];
              i.disabled = i.type === PrintResourceEnum.INTERNET_PRINT;
              i.dftPrintInfo =
                i.type === PrintResourceEnum.CLIENT_PRINT && dftInfo
                  ? { ...dftInfo, value: dftInfo.printKey, label: dftInfo.name }
                  : undefined;
              i.children?.forEach((_) => {
                arr.push({
                  value: _.printKey,
                  label: `${i.name} - ${_.name}`,
                });
                _.label = _.name;
                _.value = _.printKey;
              });
            });
            return data;
          }
          if (val === KeyMode.TRANSACTION) {
            return [
              { value: TransactionMode.CURRENT, label: 'sys.pageDesigner.currentModel' },
              { value: TransactionMode.REFERENCE, label: 'sys.pageDesigner.referenceOtherModel' },
            ];
          }
        }
      },
    },
  },
  {
    component: 'select-editor',
    name: 'printVal',
    label: '',
    group: PropGroup.BUTTON,
    hidden: (widget) => {
      return (
        !widget.props.model ||
        widget.props.printRefType !== TransactionMode.CURRENT ||
        widget.props.printMode !== PrintModeEnums.Server
      );
    },
    _config: {
      options: async (widget) => {
        const files = await getFieldMetaList({
          includeBuiltin: true,
          sys: false,
          modelKey: widget.props.model,
        });
        if (files) {
          return files
            .filter((i) => i.type === FIELD_TYPE.PRINTER)
            .map((i) => {
              return { value: i.key, label: i.name };
            });
        }
      },
    },
  },
  {
    component: 'reference-relationship-editor',
    name: 'printRuleConfig',
    label: '',
    group: PropGroup.BUTTON,
    _config: {
      modelKey: 'model',
      filterFields: [FIELD_TYPE.REF],
      filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      modalTitle: 'sys.pageDesigner.configReferenceRelationship',
      contentTitle: 'sys.pageDesigner.createReferenceDiagram',
      endPlaceholder: 'sys.pageDesigner.pleaseSelectPrintFields',
      endFieldTypes: [FIELD_TYPE.PRINTER],
    },
    hidden(widget) {
      return (
        !widget.props.model ||
        widget.props.printRefType !== TransactionMode.REFERENCE ||
        widget.props.printMode !== PrintModeEnums.Server
      );
    },
  },
  {
    component: 'label-rdo-editor',
    name: { list: 'labelMode;printKey' },
    label: 'sys.pageDesigner.labelTemplateRef',
    group: PropGroup.BUTTON,
    hidden: (widget) => !widget.props.model,
    _config: {
      tooltip: [
        '1.系统模板可选择应用设计器中维护的标签模板;',
        '2.业务模板可选择关联表单中的标签模板字段;',
      ],
      width: 70,
      moduleType: PrintTypeEnum.LABEL,
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
            return [];
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
      return !widget.props.model || widget.props.printKey !== TransactionMode.CURRENT;
    },
    _config: {
      placeholder: 'sys.pageDesigner.pleaseSelectLabelTemplateFieldCurrentModel',
      options: async (widget) => {
        const files = await getFieldMetaList({
          includeBuiltin: true,
          sys: false,
          modelKey: widget.props.model,
        });
        if (files) {
          return files
            .filter((i) => i.type === FIELD_TYPE.LABEL_TEMPLATE_REF)
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
      endPlaceholder: 'sys.pageDesigner.pleaseSelectLabelTemplateFields',
      endFieldTypes: [FIELD_TYPE.LABEL_TEMPLATE_REF],
    },
    hidden(widget) {
      return !widget.props.model || widget.props.printKey !== TransactionMode.REFERENCE;
    },
  },
  {
    component: 'select-editor',
    name: 'serverKey',
    label: 'sys.pageDesigner.businessServices',
    required: true,
    group: PropGroup.BUTTON,
    hidden: (widget) => {
      return !widget.props.model;
    },
    _config: {
      options: async (widget) => {
        if (!widget.props.model) return [];
        const data = (await getBizServiceCrudList({ modelKey: widget.props.model })) || [];
        return data
          .filter(
            (i) =>
              i.type !== UserServiceType.BUILTIN_SERVICE ||
              i.key === 'getById' ||
              i.key === 'rdoGetVersionById',
          )
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

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];

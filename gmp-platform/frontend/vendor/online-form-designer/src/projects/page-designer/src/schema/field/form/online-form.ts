import {
  FormComponents,
  StyleGroup,
  TagTypeEnum,
  DisplayEnums,
  Platform,
} from '/@page-designer/enum';
import { OnlineForm } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { TransactionMode, PropGroup, FIELD_TYPE, CreateType } from '@gct/runtime';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { MaterialEnum } from '/@/enums/appEnum';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<OnlineForm, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.OnlineForm,
  icon: 'icon-zaixianbiaodan',
  display: DisplayEnums.INLINE_BLOCK,
  props: {
    ...formItemProps,
    fieldType: undefined,
    refField: '',
    ruleConfig: {},
    templateRefType: TransactionMode.CURRENT,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,
  ...commonFieldEditorConfig.getInputAttrEditor(['required', 'readonly']),
  ...commonFieldEditorConfig.placeholderEditor,
  ...commonFieldEditorConfig.validatorEditor,
  ...editor,
  {
    component: 'select-editor',
    name: 'templateRefType',
    label: 'sys.pageDesigner.formTemplate',
    group: PropGroup.FIELD_CONFIG,
    required: true,
    _config: {
      clearable: false,
      options: [
        { value: TransactionMode.CURRENT, label: 'sys.pageDesigner.currentModel' },
        { value: TransactionMode.REFERENCE, label: 'sys.pageDesigner.referenceOtherModel' },
      ],
    },
  },
  {
    component: 'select-editor',
    name: 'refField',
    label: '',
    group: PropGroup.FIELD_CONFIG,
    hidden: (widget) => {
      return widget.props.templateRefType !== TransactionMode.CURRENT;
    },
    required: true,
    _config: {
      placeholder: 'sys.pageDesigner.pleaseSelectLabelonlineForm',
      options: async (widget) => {
        const files = await getFieldMetaList({
          includeBuiltin: true,
          sys: false,
          modelKey: widget.props.modelKey,
        });
        if (files) {
          return files
            .filter((i) => i.type === FIELD_TYPE.ONLINE_FORM_TEMPLATE)
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
    group: PropGroup.FIELD_CONFIG,
    required: true,
    _config: {
      modelKey: 'modelKey',
      filterFields: [FIELD_TYPE.REF],
      filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      modalTitle: 'sys.pageDesigner.configReferenceRelationship',
      contentTitle: 'sys.pageDesigner.createReferenceDiagram',
      endPlaceholder: 'sys.pageDesigner.pleaseSelectOnlineFormTemplateFields',
      endFieldTypes: [FIELD_TYPE.ONLINE_FORM_TEMPLATE],
    },
    hidden(widget) {
      return widget.props.templateRefType !== TransactionMode.REFERENCE;
    },
  },
  ...commonFieldEditorConfig.submitInHideEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  // {
  //   name: 'afterSelect',
  //   title: 'sys.pageDesigner.afterSelect',
  //   params: ['value', 'valueData', 'formData'],
  // },
  {
    name: 'onClick',
    title: 'sys.pageDesigner.onClick',
    params: ['value', 'valueData', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType !== MaterialEnum.MaterialTableField ||
        (widget.materialType === MaterialEnum.MaterialTableField &&
          widget.platform !== Platform.WEB)
      );
    },
  },
  {
    name: 'onChange',
    title: 'sys.pageDesigner.onChange',
    params: ['value', 'valueData', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
  {
    name: 'afterClear',
    title: 'sys.pageDesigner.afterClear',
    params: ['value', 'valueData', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
];
export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'position-editor',
    name: 'position',
    label: 'sys.pageDesigner.position',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'font-editor',
    name: 'labelFont',
    label: 'sys.name',
    group: StyleGroup.STYLE,
  },
];
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

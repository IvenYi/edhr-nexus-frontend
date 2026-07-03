import {
  PropGroup,
  FormComponents,
  BindCmpStyleEnum,
  BindCmpStyleTypeEnum,
  TagTypeEnum,
  StyleGroup,
  Platform,
} from '/@page-designer/enum';
import { Userpicker } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import getAutofillEditor from '../../common-config/autofill-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
// import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { FIELD_TYPE, CreateType, MaterialEnum } from '@/enums/appEnum';
import { useDesigner } from '/@page-designer/hooks/useDesigner';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Userpicker, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Userpicker,
  icon: '',
  props: {
    clearable: true,
    placeholder: '${sys.chooseText}',
    required: false,
    fieldRequired: false,
    defaultMain: undefined,
    selectType: BindCmpStyleEnum.CMP_DROPDOWN_SELECT,
    enableAutofill: false,
    autofillRules: [],
    ...formItemProps,
    fieldType: undefined,
    enableDepScope: false,
    departmentScope: '',
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
  // 默认值
  {
    component: 'select-editor',
    name: 'defaultMain',
    label: 'sys.pageDesigner.defaultValue',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      supportGlobData: true,
      options: [
        { label: 'sys.none', value: FieldSysVarDefaultValueEnum.NULL },
        { label: 'sys.sysCurrentUser', value: FieldSysVarDefaultValueEnum.CURRENT_USER },
      ],
    },
    formField: true,
    hidden(widget: Userpicker) {
      return widget.props.bindFieldKey || widget.props.readonly || widget.props.fieldReadonly;
    },
  },
  ...commonFieldEditorConfig.getBindCmpTypeEditor({
    name: 'selectType',
    type: BindCmpStyleTypeEnum.BindPerson,
    hiddenCallback(widget) {
      return widget.platform !== Platform.WEB;
    },
  }),
  ...commonFieldEditorConfig.validatorEditor,
  ...commonFieldEditorConfig.explainEditor,
  ...getAutofillEditor({ groupName: PropGroup.FIELD_CONFIG }),
  // 部门范围
  {
    component: 'switch-editor',
    name: 'enableDepScope',
    label: 'sys.pageDesigner.departmentScope',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      tooltip: 'sys.pageDesigner.departmentScope_tip',
    },
    formField: true,
    hidden: (widget: Userpicker) => {
      if (widget.props.bindFieldKey || widget.props.fieldReadonly) {
        return true;
      }
      return widget.props.selectType !== BindCmpStyleEnum.CMP_DROPDOWN_SELECT;
    },
  },
  {
    component: 'select-editor',
    name: 'departmentScope',
    label: '',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      options: async (widget) => {
        const { allDeptWidget } = useDesigner();
        const list = allDeptWidget.value.filter((i) => i.preLocation === widget.preLocation);
        return list.map((i) => {
          return {
            value: i.props.field + '$' + i.id,
            label: i.props.label || i.alias,
          };
        });
      },
    },
    hidden: (widget) => {
      return (
        widget.props.selectType !== BindCmpStyleEnum.CMP_DROPDOWN_SELECT ||
        widget.props.enableDepScope === false ||
        !widget.props.enableDepScope
      );
    },
  },
  // {
  //   component: 'field-editor',
  //   name: 'departmentScope',
  //   label: '',
  //   group: PropGroup.FIELD_CONFIG,
  //   _config: {
  //     filterFields: [FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI],
  //     filterTypes: [CreateType.USER_DEFINED],
  //     filterSelf: true,
  //   },
  //   hidden: (widget) => {
  //     return (
  //       widget.props.selectType !== BindCmpStyleEnum.CMP_DROPDOWN_SELECT ||
  //       widget.props.enableDepScope === false ||
  //       !widget.props.enableDepScope
  //     );
  //   },
  // },
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
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
    params: ['value', 'formData'],
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
    component: 'number-editor',
    name: 'width',
    label: 'sys.width',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'number-editor',
    name: 'height',
    label: 'sys.height',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'font-editor',
    name: 'labelFont',
    label: 'sys.name',
    group: StyleGroup.STYLE,
  },
  {
    component: 'font-editor',
    name: 'contentFont',
    label: 'sys.content',
    group: StyleGroup.STYLE,
  },
  {
    component: 'boolean-editor',
    name: 'tagStyleOpen',
    label: 'sys.pageDesigner.tagStyle',
    group: StyleGroup.STYLE,
    _config: {
      showType: 'checkbox',
      options: [
        {
          label: 'sys.pageDesigner.configureContentAsLabelStyle',
          value: true,
        },
      ],
    },
    changeCallback: (widget, value) => {
      if (value && !widget.style.tagStyle) {
        widget.style.tagStyle = {
          color: '',
          tagType: TagTypeEnum.RADIUS,
        };
      }
    },
  },
  {
    component: 'tag-editor',
    name: 'tagStyle',
    group: StyleGroup.STYLE,
    hidden: (widget) => {
      return !widget.style.tagStyleOpen;
    },
  },
  // {
  //   component: 'color-editor',
  //   name: 'backgroundColor',
  //   label: 'sys.pageDesigner.backgroundColor',
  //   group: StyleGroup.BACKGROUND,
  // },
  // {
  //   component: 'margin-editor',
  //   group: StyleGroup.MARGIN,
  // },
  // {
  //   component: 'border-radius-editor',
  //   group: StyleGroup.BORDER,
  // },
  // {
  //   component: 'border-editor',
  //   group: StyleGroup.BORDER,
  // },
];
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

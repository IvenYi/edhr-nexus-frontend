import { FormComponents, Platform, StyleGroup, TagTypeEnum, PropGroup } from '/@page-designer/enum';
import { TmplTreeSelect } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum, FIELD_TYPE } from '/@/enums/appEnum';
import { CategoryModuleEnum as DHRCategoryModuleEnum } from '@gct/runtime';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<TmplTreeSelect, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.TmplTreeSelect,
  icon: 'icon-dayinanniu',
  props: {
    multiple: false,
    placeholder: '${sys.chooseText}',
    required: false,
    fieldRequired: false,
    clearable: true,
    ...formItemProps,
    fieldType: undefined,
    isFilterFormType: false,
    formTypeList: [],
    dhrCategoryModule: DHRCategoryModuleEnum.EDHR,
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
  ...commonFieldEditorConfig.explainEditor,
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
  // 限制子表添加行数开关
  {
    component: 'switch-editor',
    name: 'isFilterFormType',
    label: '表单类型过滤',
    group: PropGroup.FIELD_CONFIG,
    changeCallback(widget) {
      if (!widget.props.isFilterFormType) {
        widget.props.formTypeList = [];
      }
    },
  },
  {
    component: 'select-editor',
    name: 'formTypeList',
    label: '表单类型',
    group: PropGroup.FIELD_CONFIG,
    required: true,
    hidden: (widget) => {
      return !widget.props.isFilterFormType;
    },
    _config: {
      multiple: true,
      options: async () => {
        return [
          {
            value: 'BASE',
            label: '基础表单',
          },
          {
            value: 'PROCESS',
            label: '流程表单',
          },
          {
            value: 'VIEW',
            label: '视图表单',
          },
          {
            value: 'TEXT',
            label: '文本表单',
          },
          {
            value: 'FILE',
            label: '文件表单',
          },
        ];
      },
    },
  },
  {
    component: 'select-editor',
    name: 'dhrCategoryModule',
    label: 'DHR模板类型',
    group: PropGroup.FIELD_CONFIG,
    required: false,
    hidden: (widget) => {
      return !widget.props.fieldType || widget.props.fieldType !== FIELD_TYPE.E_DHR_TEMPLATE;
    },
    _config: {
      multiple: false,
      options: () => {
        return [
          {
            value: DHRCategoryModuleEnum.EDHR,
            label: $t('sys.edhr.edhrTmpl'),
          },
          {
            value: DHRCategoryModuleEnum.INSPECTION,
            label: $t('sys.edhr.inspection.template'),
          },
          {
            value: DHRCategoryModuleEnum.RELEASE,
            label: $t('sys.edhr.release.template'),
          },
        ];
      },
    },
  },
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'afterSelect',
    title: 'sys.pageDesigner.afterSelect',
    params: ['value', 'valueData', 'formData'],
    hidden: (widget) => {
      return (
        widget.platform === Platform.MOBILE ||
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
];
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
  StyleGroup,
  TagTypeEnum,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '../../../../schema/common-config/display-editor-config';
import commonFieldEditorConfig from '../../../../schema/common-config/common-field-editor-config';

export interface CusSelectProps extends LowCodeWidget.WidgetProps {
  label: string;
  required: boolean;
  readonly: boolean;
  refForm: string;
  /** 关联表单绑定模型 */
  refFormModel?: string;
  refFieldModel: string;
  /** 初始化加载 */
  initLoad: boolean;
  /** 关联字段 */
  field: string;
  showSearch: boolean;
  frontSearch?: boolean;
  /** 选择方式 */
  selectMode: 'multiple' | undefined;
  /** 暗提示 */
  placeholder: string;
  /** 无数据提示 */
  noDataTip?: string;
  /** 显示标题 */
  displayLabelText: boolean;
  bindModelKey?: string;
  customdataSource: boolean;
  datasourceConfig: any;
}
export interface ICusSelect extends LowCodeWidget.BasicSchema {
  props: CusSelectProps;
}

export default class CusSelect implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./custom-select-designer.vue'));

  kit: string[] = ['eDHR'];

  schema: ICusSelect = {
    id: '',
    platform: Platform.WEB,
    name: '自定义选择框',
    alias: '',
    type: KitType.CUSTOM_SELECT,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiaoxuanzeqi',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      label: '${自定义}',
      required: false,
      readonly: false,
      refForm: '',
      refFormModel: '',
      refFieldModel: '',
      initLoad: true,
      showSearch: true,
      frontSearch: false,
      customdataSource: false,
      datasourceConfig: null,
      field: '',
      selectMode: undefined,
      placeholder: '${sys.appDesigner.pleaseSelect}',
      noDataTip: '${sys.noData}',
      displayLabelText: true,
      bindModelKey: '',
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
    i18n: {},
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'root:name',
      label: 'sys.pageDesigner.widgetName',
      group: PropGroup.BASIC,
      _config: {
        showCount: true,
        maxlength: 32,
      },
    },
    {
      component: 'text-editor',
      name: 'label',
      label: '字段名称',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        i18n: true,
        showCount: true,
      },
    },

    {
      name: 'refForm',
      component: 'ref-form-editor',
      label: '关联表单',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      changeCallback: (widget) => {
        widget.props.refFormModel = widget.props.bindModelKey;
        widget.props.field = undefined;
      },
    },

    // 关联表单下的绑定字段
    {
      component: 'field-editor',
      name: 'field',
      label: '字段选择',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      _config: {
        tips: '绑定当前表单对应模型中的需要绑定的字段',
        modelKey: 'refFormModel',
        changeFunc: (widget, metaData) => {
          const field = widget.props.field;
          if (field) {
            widget.props.refFieldModel = metaData[field]?.bindInfo;
          } else {
            widget.props.refFieldModel = '';
          }
        },
      },
    },

    /** 显示标题 */
    {
      component: 'checkbox-editor',
      name: 'displayLabelText',
      label: '',
      group: PropGroup.FIELD_CONFIG,
      hidden(widget) {
        return ![
          MaterialEnum.MaterialFormField,
          MaterialEnum.cardListFormField,
          MaterialEnum.MaterialSubTableModalField,
          MaterialEnum.DescriptionsFormField,
          // @ts-ignore
        ].includes(widget.materialType);
      },
    },
    /** 选择方式 */
    {
      component: 'radio-editor',
      name: 'selectMode',
      label: '选择方式',
      group: PropGroup.FIELD_CONFIG,
      changeCallback: () => {},
      _config: {
        options: [
          {
            label: '单选',
            value: 'single',
          },
          {
            label: '多选',
            value: 'multiple',
          },
        ],
      },
    },

    // 搜索开关
    {
      component: 'switch-editor',
      name: 'showSearch',
      label: 'sys.pageDesigner.search',
      group: PropGroup.FIELD_CONFIG,
      hidden(widget) {
        return !widget.props.field || widget.props.fieldReadonly;
      },
    },

    {
      component: 'switch-editor',
      name: 'frontSearch',
      label: '前端搜索',
      group: PropGroup.FIELD_CONFIG,
      hidden(widget) {
        return !widget.props.showSearch || widget.props.fieldReadonly;
      },
    },

    {
      component: 'text-editor',
      name: 'noDataTip',
      label: '无数据提示',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        i18n: true,
        showCount: true,
      },
    },

    ...commonFieldEditorConfig.getInputAttrEditor(['readonly', 'required']),
    ...commonFieldEditorConfig.placeholderEditor,
    ...commonFieldEditorConfig.validatorEditor,
    ...commonFieldEditorConfig.explainEditor,

    /** 初始化加载 */
    {
      component: 'switch-editor',
      name: 'initLoad',
      label: 'sys.pageDesigner.initializeLoad',
      group: PropGroup.DATASOURCE,
    },

    {
      component: 'switch-editor',
      name: 'customdataSource',
      label: 'sys.pageDesigner.customDataSource',
      group: PropGroup.DATASOURCE,
      hidden: (widget) => widget.props.bindFieldKey || widget.props.fieldReadonly,
    },
    {
      component: 'data-sourse-editor',
      name: 'datasourceConfig',
      label: '',
      group: PropGroup.DATASOURCE,
      hidden(widget: ICusSelect) {
        return !widget.props.customdataSource;
      },
    },

    ...(displayEditor as any),
  ];

  events?: LowCodeWidget.EventsType[] = [
    {
      name: 'onLoaded',
      title: 'sys.kit.medPro.optionLoaded',
      params: ['options'],
    },
    {
      name: 'onChange',
      title: 'sys.pageDesigner.onChange',
      params: ['value', 'valueData', 'formData'],
    },
    {
      name: 'onEnter',
      title: 'sys.pageDesigner.onEnter',
      params: ['value', 'searchValue', 'formData'],
    },
    {
      name: 'afterSelect',
      title: 'sys.pageDesigner.afterSelect',
      params: ['value', 'valueData', 'formData'],
    },
    {
      name: 'afterClear',
      title: 'sys.pageDesigner.afterClear',
      params: ['value', 'valueData'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
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
  ];
}

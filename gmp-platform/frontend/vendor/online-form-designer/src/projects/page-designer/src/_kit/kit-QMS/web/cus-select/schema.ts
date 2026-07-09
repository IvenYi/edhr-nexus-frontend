import {
  CreateType,
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
import { useDesigner } from '../../../../hooks/useDesigner';

export interface CusSelectProps extends LowCodeWidget.WidgetProps {
  label: string;
  required: boolean;
  readonly: boolean;
  refForm: string;
  /** 关联表单绑定模型 */
  refFormModel?: string;
  /** 初始化加载 */
  initLoad: boolean;
  /** 设备字段 */
  field: string;
  /** 选择方式 */
  selectMode: 'multiple' | undefined;
  /** 暗提示 */
  placeholder: string;
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
  component: Component = defineAsyncComponent(() => import('./cus-select-designer.vue'));

  kit: string[] = ['QMS'];

  schema: ICusSelect = {
    id: '',
    platform: Platform.WEB,
    name: '自定义选择',
    alias: '',
    type: KitType.CUS_SELECT,
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
      initLoad: true,
      customdataSource: false,
      datasourceConfig: null,
      field: '',
      selectMode: 'multiple',
      placeholder: '${sys.appDesigner.pleaseSelect}',
      displayLabelText: true,
      bindModelKey: '',
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
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
      changeCallback: () => { },
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

    ...commonFieldEditorConfig.getInputAttrEditor(['readonly', 'required']),
    ...commonFieldEditorConfig.placeholderEditor,
    ...commonFieldEditorConfig.validatorEditor,
    ...commonFieldEditorConfig.explainEditor,

    {
      component: 'ref-form-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.refForm',
      required: true,
      group: PropGroup.BUSINESS_CONFIG,
      changeCallback: (widget: ICusSelect, value) => {
        widget.props.field = '';
        const bindModelKey = widget.props?.bindModelKey;
        widget.props.refFormModel = bindModelKey;
        console.log(bindModelKey, 'bindModelKey')
      },
      onMounted(widget: ICusSelect) {
        if (!widget.props?.refForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.refForm,
        );
        if (!formWidget) {
          widget.props.refForm = '';
        }
      },
    },
    // 关联表单下的绑定字段
    {
      component: 'field-editor',
      name: 'field',
      label: '字段选择',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        tips: '绑定当前表单对应模型中的需要绑定的字段',
        modelKey: 'refFormModel',
        // filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      },
    },
    /** 初始化加载 */
    {
      component: 'switch-editor',
      name: 'initLoad',
      label: 'sys.pageDesigner.initializeLoad',
      group: PropGroup.SHOW,
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
      params: ['value', 'valueData'],
    },
    {
      name: 'afterSelect',
      title: 'sys.pageDesigner.afterSelect',
      params: ['value', 'valueData'],
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

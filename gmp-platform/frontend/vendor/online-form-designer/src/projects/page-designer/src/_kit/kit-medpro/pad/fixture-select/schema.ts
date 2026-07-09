import {
  CreateType,
  DisplayEnums,
  EntityModelCategoryEnum,
  FIELD_TYPE,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
  StyleGroup,
  TagTypeEnum,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { ESite, KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '../../../../schema/common-config/display-editor-config';
import commonFieldEditorConfig from '../../../../schema/common-config/common-field-editor-config';
import { useDesigner } from '../../../../hooks/useDesigner';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';

export interface FixtureSelectProps extends LowCodeWidget.WidgetProps {
  label: string;
  required: boolean;
  readonly: boolean;
  bizService: string;
  /** 事务类型 */
  txnType: string;
  refForm: string;
  /** 关联表单绑定模型 */
  refFormModel?: string;
  /** 关联批次查询 */
  // refSearch?: string;
  /** 关联批次表单 */
  refContainerForm: string;
  /** 关联批次表单绑定模型 */
  refContainerFormModel?: string;
  /** 查询字段 */
  refSearchField: string[];
  /** 批次字段 */
  refContainerField: string;
  /** 初始化加载 */
  initLoad: boolean;
  /** 数据过滤 */
  datafilter: string;
  /** 治具字段 */
  field: string;
  /** 选择方式 */
  selectMode: 'multiple' | undefined;
  /** 暗提示 */
  placeholder: string;
  /** 显示标题 */
  displayLabelText: boolean;
  /** 开启扫描 */
  scan: boolean;
  /** 扫描位置 */
  scanSite: string;

  bindModelKey?: string;
  /** 数据过滤 */
  filterModeKey?: string;
}
export interface IFixtureSelect extends LowCodeWidget.BasicSchema {
  props: FixtureSelectProps;
}

export default class MedProFixtureSelect implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./fixture-select-designer.vue'));

  schema: IFixtureSelect = {
    id: '',
    platform: Platform.MOBILE,
    name: '治具选择',
    alias: '',
    type: 'medpro' + KitType.FIXTURE_SELECT,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiaoxuanzeqi',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      label: '${治具}',
      required: false,
      readonly: false,
      txnType: '',
      refContainerForm: '',
      refContainerFormModel: '',
      refContainerField: '',
      bizService: '',
      refForm: '',
      refFormModel: '',
      refSearchField: [],
      initLoad: true,
      datafilter: '',
      field: '',
      selectMode: 'multiple',
      placeholder: '${sys.appDesigner.pleaseSelect}',
      displayLabelText: true,
      bindModelKey: '',
      filterModeKey: 'em_fixture',
      scan: true,
      scanSite: ESite.RIGHT,
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
    // 关联表单下的绑定字段
    {
      component: 'field-editor',
      name: 'field',
      label: '字段选择',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      _config: {
        tips: '绑定当前表单对应模型中的治具字段',
        modelKey: 'refFormModel',
        filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
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
    {
      component: 'switch-editor',
      name: 'initLoad',
      label: 'sys.pageDesigner.initializeLoad',
      group: PropGroup.FIELD_CONFIG,
    },
    ...commonFieldEditorConfig.getInputAttrEditor(['readonly', 'required']),
    ...commonFieldEditorConfig.placeholderEditor,
    ...commonFieldEditorConfig.validatorEditor,

    // 事务类型
    {
      component: 'select-editor',
      name: 'txnType',
      label: 'sys.kit.medPro.txnType',
      required: true,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        tips: '选择事务类型作为业务的查询条件',
        showSearch: true,
        multiple: false,
        options: async () => {
          const modelList =
            (await getModelComprehensiveModelSummary({
              type: 'TRANSACTION',
              category: EntityModelCategoryEnum.ENTITY,
            })) ?? [];
          return modelList.map((model) => {
            return {
              label: model.name,
              value: model.key,
            };
          });
        },
      },
    },
    {
      component: 'select-editor',
      name: 'bizService',
      label: '业务服务',
      required: true,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        tips: '选择事务模型下的业务服务',
        showSearch: true,
        multiple: false,
        options: async (widget) => {
          const serviceList =
            (await getBizServiceCrudList({ modelKey: widget.props.txnType })) ?? [];
          return serviceList.map((service) => {
            return {
              label: service.name,
              value: service.key,
            };
          });
        },
      },
      dependentProps: ['txnType'],
    },
    {
      component: 'ref-form-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.refForm',
      required: true,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        tips: '选择存在工步字段的表单',
      },
      changeCallback: (widget: IFixtureSelect) => {
        widget.props.field = '';
        widget.props.refSearchField = [];
        const bindModelKey = widget.props?.bindModelKey;
        widget.props.refFormModel = bindModelKey;
      },
      onMounted(widget: IFixtureSelect) {
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
    {
      component: 'field-editor',
      name: 'refSearchField',
      label: '查询字段',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        multiple: true,
        tips: '选择关联表单对应的工步字段及设备字段，如有其他业务查询字段，可多选',
        modelKey: 'refFormModel',
        filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      },
      hidden: (widget) => !widget.props.refForm,
    },
    {
      component: 'ref-form-editor',
      name: 'refContainerForm',
      label: '关联批次表单',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        tips: '选择含有批次的表单',
      },
      changeCallback: (widget: IFixtureSelect) => {
        widget.props.refContainerField = '';
        const bindModelKey = widget.props?.bindModelKey;
        widget.props.refContainerFormModel = bindModelKey;
      },
      onMounted(widget: IFixtureSelect) {
        if (!widget.props?.refContainerForm) return;
        const { allFormWidget } = useDesigner();
        const searchWidget = allFormWidget.value.find(
          (item) => item.id === widget.props?.refContainerForm,
        );
        if (!searchWidget) {
          widget.props.refContainerForm = '';
        }
      },
    },
    {
      component: 'field-editor',
      name: 'refContainerField',
      label: '批次字段',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        tips: '选择批次表单对应模型的批次字段',
        modelKey: 'refContainerFormModel',
      },
      hidden: (widget) => !widget.props.refContainerForm,
    },
    // 快速扫码
    {
      component: 'switch-editor',
      name: 'scan',
      label: '快速扫码',
      required: false,
      group: PropGroup.BUSINESS_CONFIG,
    },
    // {
    //   component: 'radio-editor',
    //   name: 'scanSite',
    //   label: '',
    //   group: PropGroup.BUSINESS_CONFIG,
    //   changeCallback: () => {},
    //   _config: {
    //     options: [
    //       {
    //         label: '最右侧',
    //         value: ESite.RIGHT,
    //       },
    //       {
    //         label: '最左侧',
    //         value: ESite.LEFT,
    //       },
    //     ],
    //   },
    //   dependentProps: ['scan'],
    // },
    // TODO: 业务服务暂不支持
    // {
    //   component: 'data-filtering-new-editor',
    //   label: '',
    //   name: 'datafilter',
    //   group: PropGroup.LISTDATA,
    //   _config: {
    //     modelKey: 'filterModeKey',
    //   },
    //   dependentProps: [],
    // },

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
      hidden: (widget) => {
        return [FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(widget.props.fieldType);
      },
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
}

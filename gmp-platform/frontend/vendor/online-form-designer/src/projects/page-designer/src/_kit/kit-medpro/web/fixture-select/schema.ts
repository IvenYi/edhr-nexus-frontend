import {
  CreateType,
  DisplayEnums,
  EntityModelCategoryEnum,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
  StyleGroup,
  TagTypeEnum,
  FIELD_TYPE,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
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
  txnType: string;
  refForm: string;
  /** 关联表单绑定模型 */
  refFormModel?: string;
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

  bindModelKey?: string;
  /** 数据过滤 */
  filterModeKey?: string;

  /** 显示字段 */
  displayFields: string[];
  /** 筛选字段 */
  showSearch?: boolean;
  searchField?: string[];
}
export interface IFixtureSelect extends LowCodeWidget.BasicSchema {
  props: FixtureSelectProps;
}

export default class MedProFixtureSelect implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./fixture-select-designer.vue'));

  kit: string[] = ['MEDPRO'];

  schema: IFixtureSelect = {
    id: '',
    platform: Platform.WEB,
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
      refSearchField: [],
      bizService: '',
      refForm: '',
      refFormModel: '',
      initLoad: true,
      datafilter: '',
      field: '',
      selectMode: 'multiple',
      placeholder: '${sys.appDesigner.pleaseSelect}',
      displayLabelText: true,
      bindModelKey: '',
      filterModeKey: 'em_fixture',
      displayFields: [],
      showSearch: false,
      searchField: [],
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
      component: 'ndo-display-fields-editor',
      label: 'sys.model.displayField',
      name: 'displayFields',
      group: PropGroup.FIELD_CONFIG,
      hidden(widget) {
        return (
          !widget.props.bindModelKey || widget.platform === Platform.MOBILE || widget.props.readonly
        );
      },
    },
    // 搜索开关
    {
      component: 'switch-editor',
      name: 'showSearch',
      label: 'sys.pageDesigner.search',
      group: PropGroup.FIELD_CONFIG,
      hidden(widget) {
        return widget.platform === Platform.MOBILE || widget.props.readonly;
      },
      changeCallback: async (widget) => {
        // 处理错误老数据的方式，如果filterModeKey不是em_fixture，则改成em_fixture
        if (widget.props.filterModeKey != 'em_fixture') {
          widget.props.filterModeKey = 'em_fixture';
        }
      },
    },
    // 搜索字段
    {
      component: 'field-editor',
      name: 'searchField',
      label: 'sys.pageDesigner.quickSearchFields',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      hidden(widget) {
        return !widget.props.showSearch || widget.platform === Platform.MOBILE;
      },
      _config: {
        tips: 'sys.pageDesigner.quickSearchTips',
        filterFields: [
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.TEXT,
          FIELD_TYPE.DECIMAL,
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.LONG,
          FIELD_TYPE.INTEGER,
          FIELD_TYPE.SERIAL,
        ],
        filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
        multiple: true,
        modelKey: 'filterModeKey',
      },
    },

    ...commonFieldEditorConfig.getInputAttrEditor(['readonly', 'required']),
    ...commonFieldEditorConfig.placeholderEditor,
    ...commonFieldEditorConfig.validatorEditor,
    ...commonFieldEditorConfig.explainEditor,

    // 事务模型
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
        options: async (widget) => {
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
      changeCallback: (widget: IFixtureSelect, value) => {
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
      changeCallback: (widget: IFixtureSelect, value) => {
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
    /** 初始化加载 */
    {
      component: 'switch-editor',
      name: 'initLoad',
      label: 'sys.pageDesigner.initializeLoad',
      group: PropGroup.SHOW,
    },
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

import {
  CreateType,
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  EntityModelCategoryEnum,
  MaterialEnum,
  TagTypeEnum,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { FIELD_TYPE } from '@/enums/appEnum';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import commonFieldEditorConfig from '/@page-designer/schema/common-config/common-field-editor-config';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';
import { useDesigner } from '/@page-designer/hooks/useDesigner';

export interface WorkflowStepSelectProps extends LowCodeWidget.WidgetProps {
  label: string;
  readonly: boolean;
  required: boolean;
  disabled: boolean;
  bizService: string;
  txnType: string;
  /** 显示标题 */
  displayLabelText: boolean;
  /** 关联批次表单 */
  refSearchForm: string;
  refContainerField: string;
  /** 关联批次表单绑定模型 */
  containerModelKey: string;
  /** 初始化加载 */
  initLoad: boolean;
  /** 数据过滤 */
  datafilter: string;
  /** 工步字段 */
  field: string;
  /** 工步字段 */
  currentField: string;
  /** 暗提示 */
  placeholder: string;
  /** 默认选中 */
  defaultSelected: boolean;
}
export interface IWorkflowStepSelect extends LowCodeWidget.BasicSchema {
  props: WorkflowStepSelectProps;
}

export default class WorkflowStepSelect implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./workflow-step-select-designer.vue'));

  kit: string[] = ['MEDPRO'];
  schema: IWorkflowStepSelect = {
    id: '',
    platform: Platform.MOBILE,
    name: '工步选择',
    alias: '',
    type: 'medpro' + KitType.WORKFLOW_STEP_SELECT,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiaoxuanzeqi',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      label: '${当前工步}',
      required: false,
      readonly: false,
      disabled: false,
      displayLabelText: true,
      containerModelKey: 'em_container',
      txnType: '',
      bizService: '',
      refSearchForm: '',
      refContainerField: '',
      initLoad: true,
      datafilter: '',
      field: '',
      currentField: '',
      placeholder: '${sys.appDesigner.pleaseSelect}',
      defaultSelected: true,
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
      label: '工步字段',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      _config: {
        tips: '绑定当前表单对应模型中的工步字段',
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
    },
    {
      component: 'field-editor',
      name: 'currentField',
      label: '当前工步字段选择',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        tips: '当本组件用作下一站场景时，需要绑定当前表单对应模型中的当前工步字段作为输入条件',
        modelKey: 'refFormModel',
        filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
        clearable: true,
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
      name: 'refSearchForm',
      label: '关联批次表单',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        tips: '选择含有批次的表单',
      },
      changeCallback: (widget) => {
        widget.props.refContainerField = '';
      },
      onMounted(widget) {
        if (!widget.props?.refSearchForm) return;
        const { allFormWidget } = useDesigner();
        const searchWidget = allFormWidget.value.find(
          (item) => item.id === widget.props?.refSearchForm,
        );
        if (!searchWidget) {
          widget.props.refSearchForm = '';
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
        modelKey: 'containerModelKey',
        // filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      },
      dependentProps: ['refSearchForm'],
    },
    {
      component: 'switch-editor',
      name: 'defaultSelected',
      label: '默认选中',
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        tips: '默认选中批次上的对应工艺，若无匹配则默认选中第一个',
        // filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      },
    },
    {
      component: 'data-filtering-new-editor',
      label: '',
      name: 'datafilter',
      group: PropGroup.LISTDATA,
      _config: {
        modelKey: 'filterModeKey',
      },
      dependentProps: [],
    },
    ...(displayEditor as any),
  ];
  events?: LowCodeWidget.EventsType[] = [
    {
      name: 'onChange',
      title: 'sys.pageDesigner.onChange',
      params: ['value', 'valueData'],
    },
    {
      name: 'onMounted',
      title: 'sys.pageDesigner.onMounted',
      params: ['status'],
    },
    {
      name: 'afterClear',
      title: 'sys.pageDesigner.afterClear',
      params: [],
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
      _config: {
        hiddenColor: true, //隐藏颜色
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

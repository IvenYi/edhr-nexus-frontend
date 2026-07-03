import {
  CreateType,
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import commonFieldEditorConfig from '/@page-designer/schema/common-config/common-field-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';
import { findNodeAll } from '/@/utils/helper/treeHelper';

const { t } = useI18n();

export interface WorkflowStepSelectProps extends LowCodeWidget.WidgetProps {
  readonly: boolean;
  usage: string;
  refForm: string;
  refFormField: string;
  refSearch?: string;
  refSearchForm?: string;
  refSearchField: string[];
  field: string;
  required: boolean;
  disabled: boolean;
}
export interface IWorkflowStepSelect extends LowCodeWidget.BasicSchema {
  props: WorkflowStepSelectProps;
}

export class WorkflowStepSelect implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./workflow-step-select-designer.vue'));

  kit: string[] = ['MEDPROOLD'];
  schema: IWorkflowStepSelect = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.workflowStepSelect',
    alias: '',
    displayName: 'sys.kit.workflowStepSelect',
    type: KitType.WORKFLOW_STEP_SELECT,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiaoxuanzeqi',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      readonly: false,
      required: false,
      disabled: false,
      field: '',
      usage: '',
      refForm: '',
      refFormField: 'workflow_step_id_',
      refSearch: '',
      refSearchForm: '',
      refSearchField: ['spec_id_'],
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    ...commonFieldEditorConfig.getInputAttrEditor(['readonly', 'required']),
    {
      component: 'field-editor',
      name: 'field',
      label: 'sys.pageDesigner.field',
      group: PropGroup.FIELD_CONFIG,
      // required: true,
      _config: {
        filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      },
    },
    {
      component: 'select-editor',
      name: 'usage',
      label: '使用场景',
      group: PropGroup.ADVANCED,
      required: true,
      _config: {
        options: () => [
          {
            label: '进站->当前工步',
            value: 'em_txn_move_in&&current',
          },
          {
            label: '出站->当前工步',
            value: 'em_txn_move&&current',
          },
          {
            label: '出站->下一站',
            value: 'em_txn_move&&next',
          },
          {
            label: '报工->当前工步',
            value: 'em_txn_report&&current',
          },
          {
            label: '返工->当前工步',
            value: 'em_txn_rework&&current',
          },
          {
            label: '返工->返工工步',
            value: 'em_txn_rework&&next',
          },
          {
            label: '物料分发->当前工步',
            value: 'em_txn_material_issue&&current',
          },
          {
            label: '物料移除->当前工步',
            value: 'em_txn_material_remove&&current',
          },
          {
            label: '清场->当前工步',
            value: 'em_txn_cleaning&&current',
          },
          {
            label: '设备变更->当前工步',
            value: 'em_txn_device_change&&current',
          },
        ],
      },
    },
    {
      component: 'ref-form-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.refForm',
      required: true,
      group: PropGroup.ADVANCED,
      _config: {
        tips: '会自动绑定表单中的当前工步字段用来查询下一工步',
      },
      onMounted(widget: IWorkflowStepSelect) {
        if (!widget.props?.refForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.refForm,
        );
        if (!formWidget) {
          widget.props.refForm = '';
        }
      },
      hidden: (widget: IWorkflowStepSelect) => {
        return !['em_txn_move&&next', 'em_txn_rework&&next'].includes(widget.props.usage);
      },
    },
    {
      component: 'ref-container-search-editor',
      name: 'refSearch',
      label: 'sys.pageDesigner.refSearch',
      group: PropGroup.ADVANCED,
      required: true,
      _config: {
        tips: '会自动绑定查询出的批次用来查询',
      },
      onMounted(widget: IWorkflowStepSelect) {
        if (!widget.props?.refSearch) return;
        const { pageJson } = useDesigner();
        const allPageSearchWidgets = findNodeAll(pageJson.widgets, (widget) => {
          return widget.type === KitType.CONTAINER_SEARCH;
        });
        const searchWidget = allPageSearchWidgets.find(
          (item) => item.id === widget.props?.refSearch,
        );
        if (!searchWidget) {
          widget.props.refSearch = undefined;
          widget.props.refSearchForm = undefined;
        }
      },
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
  ];
}

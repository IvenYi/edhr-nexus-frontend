import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
  FormComponents,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayProps,
  displayEditor,
} from '/@page-designer/schema/common-config/display-editor-config';
import {
  buttonEditor,
  buttonStyleEditor,
} from '/@page-designer/schema/common-config/button-editor-config';
import { baseBtnProp } from '/@page-designer/schema/common-config/base-button-config';
import { permissionEditor } from '/@page-designer/schema/common-config/permission-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { createFieldWidgetByType } from '/@page-designer/schema/utils';

export interface WorkflowViewProps extends LowCodeWidget.WidgetProps {
  title: string;
  /** 关联批次表单 */
  refContainerForm: string;
  /** 批次字段 */
  refContainerField: string;
  /** 关联批次表单绑定模型 */
  refContainerFormModel?: string;
  bindModelKey?: string;
  workflowWidget?: any;
  hideBtn: boolean;
}
export interface IWorkflowView extends LowCodeWidget.BasicSchema {
  props: WorkflowViewProps;
}

export default class WorkflowView implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./workflow-view-designer.vue'));

  kit: string[] = ['MEDPRO'];
  schema: IWorkflowView = {
    id: '',
    platform: Platform.WEB,
    name: '工作流查看',
    alias: '',
    type: 'medpro' + KitType.WORKFLOW_VIEW,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liuchengbiaodan',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      ...baseBtnProp,
      ...displayProps,
      title: '${_kit.pageDesigner.workflowView}',
      refContainerForm: '',
      refContainerField: '',
      refContainerFormModel: '',
      bindModelKey: '',
      workflowWidget: null,
      hideBtn: false,
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
      name: 'title',
      label: 'sys.pageDesigner.title',
      group: PropGroup.BUTTON,
      _config: {
        i18n: true,
        maxlength: 10,
        showCount: true,
      },
    },
    {
      component: 'switch-editor',
      name: 'hideBtn',
      label: '隐藏按钮',
      group: PropGroup.BUTTON,
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
      changeCallback: (widget: IWorkflowView, value) => {
        widget.props.refContainerField = '';
        const bindModelKey = widget.props?.bindModelKey;
        widget.props.refContainerFormModel = bindModelKey;
      },
      onMounted(widget: IWorkflowView) {
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
      changeCallback: async (widget) => {
        const workflowNode = createFieldWidgetByType(FormComponents.WorkflowNodes);
        widget.props.workflowWidget = workflowNode;
      },
    },
    ...buttonEditor,
    ...displayEditor,
    ...permissionEditor,
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];
}

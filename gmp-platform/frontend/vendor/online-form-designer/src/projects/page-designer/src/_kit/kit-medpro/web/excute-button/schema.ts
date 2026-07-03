import {
  DisplayEnums,
  EntityModelCategoryEnum,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
} from '@gct/runtime';
import { BaseButton, ButtonProps } from '/@page-designer/types/web';
import { baseBtnProp } from '/@page-designer/schema/common-config/base-button-config';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import {
  buttonEditor,
  buttonStyleEditor,
} from '/@page-designer/schema/common-config/button-editor-config';
import { permissionEditor } from '/@page-designer/schema/common-config/permission-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums/kit-type/kit-type';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';

export interface IExecuteButtonProps extends ButtonProps {
  /** 标题 */
  title: string;
  /** 事务 */
  txnType: string;
  /** 关联表单 */
  refForm: any;
  /** 执行后重置表单 */
  resetForm: boolean;
  /** 关联事务主体表单 */
  refTxnForm: string;
  /** 关联批次查询 */
  refSearch: string;
  /** 关联事务主体字段 */
  refTxnField: string;
  /** 执行后重置事务主体表单 */
  resetTxnForm: boolean;
  /** 批次字段关联模型  */
  refTxnFormModel: string;
  /** 是否批量执行 */
  isBatch: boolean;
  /** 关联批量事务主体（批次）信息 */
  refBatchTxnTable: string;
}

export interface IExecuteButton extends LowCodeWidget.BasicSchema {
  props: IExecuteButtonProps;
}

export default class ExcutePluginConfig implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./excute-button-designer.vue'));

  schema: IExecuteButton = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.excute',
    alias: '',
    type: 'medpro' + KitType.EXCUTE_BUTTON,
    display: DisplayEnums.INLINE_BLOCK,
    displayName: 'sys.kit.excuteButton',
    icon: 'icon-tijiao',
    props: {
      refTxnFormModel: '',
      refForm: undefined,
      txnType: undefined,
      isBatch: false,
      ...baseBtnProp,
      title: '${sys.pageDesigner.excuteText}',
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'switch-editor',
      name: 'isBatch',
      label: '_kit.pageDesigner.executeButton.isBatch',
      required: false,
      group: PropGroup.BUTTON,
      changeCallback: (widget: IExecuteButton) => {
        const { isBatch } = widget.props;
        if (isBatch) {
          widget.props.refTxnForm = '';
        } else {
          widget.props.refBatchTxnTable = '';
        }
      },
    },
    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      required: true,
      group: PropGroup.BUTTON,
      _config: {
        i18n: true,
        maxlength: 10,
        showCount: true,
      },
    },
    {
      component: 'select-editor',
      name: 'txnType',
      label: 'sys.kit.txnType',
      required: true,
      group: PropGroup.BUTTON,
      _config: {
        tips: '选择事务类型作为业务的执行条件',
        showSearch: true,
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
      component: 'ref-form-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.refForm',
      group: PropGroup.BUTTON,
      required: true,
      onMounted(widget: BaseButton) {
        if (!widget.props.refForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props.refForm,
        );
        if (!formWidget) {
          widget.props.refForm = undefined;
        }
      },
    },
    {
      component: 'switch-editor',
      name: 'resetForm',
      label: '执行后重置表单',
      required: false,
      group: PropGroup.BUTTON,
    },
    // 批量主体表格
    {
      component: 'select-editor',
      name: 'refBatchTxnTable',
      label: '_kit.pageDesigner.executeButton.refBatchTxnTable',
      required: true,
      group: PropGroup.BUTTON,
      _config: {
        options: async () => {
          const { allTableWidget } = useDesigner();
          return allTableWidget.value.map((item) => {
            return {
              label: `${item.alias} ${item.id}`,
              value: item.id,
            };
          });
        },
      },
      hidden: (widget) => !widget.props.isBatch,
    },
    {
      component: 'ref-form-editor',
      name: 'refTxnForm',
      label: '关联事务主体表单',
      group: PropGroup.BUTTON,
      required: true,
      _config: {
        tips: '选择含有事务主体的表单',
      },
      onMounted(widget) {
        if (!widget.props?.refTxnForm) return;
        const { allFormWidget, getWidgetByScope } = useDesigner();
        const containerSearchWidget = getWidgetByScope('medpro' + KitType.CONTAINER_SEARCH);
        const refSearchWidget = containerSearchWidget.find(
          (item) => item.children?.[1]?.id === widget.props?.refTxnForm,
        );
        const txnFormWidget = allFormWidget.value.find(
          (item) => item.id === widget.props?.refTxnForm,
        );
        if (refSearchWidget) {
          widget.props.refSearch = refSearchWidget.id;
        }
        if (!txnFormWidget) {
          widget.props.refTxnForm = '';
          widget.props.refSearch = '';
        }
      },
      changeCallback: (widget: IExecuteButton) => {
        widget.props.refTxnField = '';
        widget.props.refSearch = '';
        if (!widget.props?.refTxnForm) return;
        const { allFormWidget, getWidgetByScope } = useDesigner();
        const containerSearchWidget = getWidgetByScope('medpro' + KitType.CONTAINER_SEARCH);
        const txnFormWidget = allFormWidget.value.find(
          (item) => item.id === widget.props?.refTxnForm,
        );
        const refSearchWidget = containerSearchWidget.find(
          (item) => item.children?.[1]?.id === widget.props?.refTxnForm,
        );
        if (txnFormWidget) {
          widget.props.refTxnFormModel = txnFormWidget.props.model;
        }
        if (refSearchWidget) {
          widget.props.refSearch = refSearchWidget.id;
        }
      },
      hidden: (widget) => widget.props.isBatch,
    },
    {
      component: 'field-editor',
      name: 'refTxnField',
      label: '关联事务主体字段',
      group: PropGroup.BUTTON,
      required: true,
      _config: {
        tips: '选择事务主体表单中的事务主体字段',
        modelKey: 'refTxnFormModel',
      },
      hidden: (widget) => !widget.props.refTxnForm,
    },
    {
      component: 'switch-editor',
      name: 'resetTxnForm',
      label: '执行后重置事务主体表单',
      required: false,
      group: PropGroup.BUTTON,
      hidden: (widget) => !widget.props.refTxnForm,
    },
    ...(displayEditor as any),
    ...(buttonEditor as any),
    ...(permissionEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'beforeExecute',
      title: 'sys.pageDesigner.beforeExecute',
      params: ['formData'],
    },
    {
      name: 'afterExecute',
      title: 'sys.pageDesigner.afterExecute',
      params: ['data'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];
}

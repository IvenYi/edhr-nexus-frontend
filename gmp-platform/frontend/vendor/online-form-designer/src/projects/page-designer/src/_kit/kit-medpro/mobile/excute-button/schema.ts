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
import { KitType } from '../../../enums';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';

export interface IExcuteButtonProps extends ButtonProps {
  txnType: string;
  title: string;
  refForm: any;
  refSearch: any;
  refresh?: boolean; // 提交后刷新
}

export interface IExcuteButton extends LowCodeWidget.BasicSchema {
  props: IExcuteButtonProps;
}

export default class MedProExcutePluginConfig implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./excute-button-designer.vue'));

  schema: IExcuteButton = {
    id: '',
    platform: Platform.MOBILE,
    name: 'sys.kit.excuteButton',
    alias: '',
    type: 'medpro' + KitType.EXCUTE_BUTTON,
    display: DisplayEnums.INLINE_BLOCK,
    displayName: 'sys.kit.excuteButton',
    icon: 'icon-a-yinyongshuju2',
    props: {
      refForm: '',
      refSearch: undefined,
      txnType: undefined,
      ...baseBtnProp,
      refresh: true,
      title: '${sys.pageDesigner.excuteText}',
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
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
      component: 'ref-form-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.refForm',
      group: PropGroup.BUTTON,
      required: false,
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
      component: 'ref-container-search-editor',
      name: 'refSearch',
      label: 'sys.pageDesigner.refSearch',
      group: PropGroup.BUTTON,
      required: false,
    },
    {
      component: 'select-editor',
      name: 'txnType',
      label: 'sys.kit.txnType',
      required: true,
      group: PropGroup.BUTTON,
      _config: {
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
      component: 'switch-editor',
      name: 'refresh',
      label: 'sys.kit.refreshExcuted',
      required: false,
      group: PropGroup.BUTTON,
    },
    ...(displayEditor as any),
    ...(buttonEditor as any),
    ...(permissionEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'beforeExecute',
      title: 'sys.pageDesigner.beforeExecute',
      params: ['formdata'],
    },
    {
      name: 'afterExecute',
      title: 'sys.pageDesigner.afterExecute',
      params: ['id'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];
}

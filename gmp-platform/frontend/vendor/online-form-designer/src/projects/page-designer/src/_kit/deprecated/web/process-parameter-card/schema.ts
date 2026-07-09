import {
  DisplayEnums,
  EntityModelCategoryEnum,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { findNodeAll } from '/@/utils/helper/treeHelper';

export interface ProcessParameterCardProps extends LowCodeWidget.WidgetProps {
  txnType?: string;
  noNeedAutoQuery: boolean;
  refSearch?: string;
  refForm?: string;
  refSearchForm?: string;
  refFormField: string[];
  refSearchField: string[];
}
interface IProcessParameterCard extends LowCodeWidget.BasicSchema {
  props: ProcessParameterCardProps;
}

export class ProcessParameterCard implements IDesignerProvider {
  kit: string[] = ['MEDPROOLD'];
  component: Component = defineAsyncComponent(
    () => import('./process-parameter-card-designer.vue'),
  );

  schema: IProcessParameterCard = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.processParamCard',
    alias: '',
    type: KitType.PROCESS_PARAMETER_CARD,
    display: DisplayEnums.BLOCK,
    icon: 'icon-a-Datatable',
    props: {
      txnType: undefined,
      noNeedAutoQuery: false,
      refForm: undefined,
      refSearch: undefined,
      refSearchForm: undefined,
      refFormField: ['device_ids_'],
      refSearchField: ['product_id_', 'spec_id_'],
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'switch-editor',
      name: 'noNeedAutoQuery',
      label: '无需自动关联查询',
      group: PropGroup.ADVANCED,
    },
    {
      component: 'select-editor',
      name: 'txnType',
      label: '事务类型',
      group: PropGroup.ADVANCED,
      required: true,
      _config: {
        showSearch: true,
        options: async () => {
          const modelList =
            (await getModelComprehensiveModelSummary({
              type: 'TRANSACTION',
              category: `${EntityModelCategoryEnum.ENTITY}`,
            })) ?? [];
          return modelList.map((model) => {
            return {
              label: model.name,
              value: model.key,
            };
          });
        },
      },
      hidden: (widget: IProcessParameterCard) => {
        return widget.props.noNeedAutoQuery;
      },
    },
    {
      component: 'ref-form-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.refForm',
      group: PropGroup.ADVANCED,
      required: false,
      _config: {
        tips: '会自动绑定关联表单中的设备字段',
      },
      onMounted(widget: IProcessParameterCard) {
        if (!widget.props?.refForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.refForm,
        );
        if (!formWidget) {
          widget.props.refForm = '';
        }
      },
      hidden: (widget: IProcessParameterCard) => {
        return widget.props.noNeedAutoQuery;
      },
    },
    {
      component: 'ref-container-search-editor',
      name: 'refSearch',
      label: 'sys.pageDesigner.refSearch',
      group: PropGroup.ADVANCED,
      required: true,
      onMounted(widget: IProcessParameterCard) {
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
      hidden: (widget: IProcessParameterCard) => {
        return widget.props.noNeedAutoQuery;
      },
    },
    ...(displayEditor as any),
  ];
}

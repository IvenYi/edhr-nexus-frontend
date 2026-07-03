import {
  DisplayEnums,
  EntityModelCategoryEnum,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  sortTypeEnum,
  StyleGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { resultFieldType } from '/@page-designer/schema/web/other/select-search';
import { cloneDeep } from 'lodash-es';

export interface ProcessParameterCardProps extends LowCodeWidget.WidgetProps {
  model: string;
  txnType?: string;
  deviceGroupForm?: string;
  deviceGroupFields?: string;
  deviceGroupFormModelKey?: string;
  batchRefForm?: string;
  batchFields?: string;
  batchFormModelKey?: string;
  refFormField: string[];
  refSearchField: string[];
  defaultExpand: boolean;
  maxLength: number;
  collation: { collationField: string; collationSort: sortTypeEnum }[];
}
interface IProcessParameterCard extends LowCodeWidget.BasicSchema {
  props: ProcessParameterCardProps;
}

export default class MedProProcessParameterCard implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];
  component: Component = defineAsyncComponent(
    () => import('./process-parameter-card-designer.vue'),
  );

  schema: IProcessParameterCard = {
    id: '',
    platform: Platform.MOBILE,
    name: 'sys.kit.processParamCard',
    alias: '',
    type: 'medpro' + KitType.PROCESS_PARAMETER_CARD,
    display: DisplayEnums.BLOCK,
    icon: 'icon-a-Datatable',
    props: {
      model: 'em_process_parameter_card',
      txnType: undefined,
      deviceGroupForm: undefined,
      deviceGroupFields: undefined,
      deviceGroupFormModelKey: undefined,
      batchRefForm: undefined,
      batchFields: undefined,
      batchFormModelKey: undefined,
      refFormField: [],
      refSearchField: [],
      collation: [
        {
          collationField: 'create_time_',
          collationSort: sortTypeEnum.DESC,
        },
      ],
      defaultExpand: true,
      maxLength: 3,
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'select-editor',
      name: 'txnType',
      label: '事务类型',
      group: PropGroup.ADVANCED,
      required: true,
      _config: {
        tips: '选择事务类型作为业务的查询条件',
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
    },
    {
      component: 'ref-form-editor',
      name: 'deviceGroupForm',
      label: '_kit.pageDesigner.iProcessParameterCard.deviceGroupRefForm',
      group: PropGroup.ADVANCED,
      required: false,
      _config: {
        tips: '选择含有设备组字段的表单',
        bindModelKey: 'deviceGroupFormModelKey',
      },
      changeCallback: async (widget) => {
        widget.props.deviceGroupFields = undefined;
      },
      onMounted(widget: IProcessParameterCard) {
        if (!widget.props?.deviceGroupForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.deviceGroupForm,
        );
        if (!formWidget) {
          widget.props.deviceGroupForm = undefined;
        }
      },
    },

    {
      component: 'select-editor',
      name: 'deviceGroupFields',
      label: '_kit.pageDesigner.iProcessParameterCard.deviceGroupFields',
      required: true,
      group: PropGroup.ADVANCED,
      changeCallback: async (widget) => {
        widget.props.refFormField = [widget.props.deviceGroupFields];
      },
      _config: {
        tips: '选择设备组表单对应模型的设备组字段',
        showSearch: true,
        options: async (widget) => {
          const data =
            (await getFieldMetaList({ modelKey: widget.props.deviceGroupFormModelKey })) || [];
          return data
            ?.filter((e) => resultFieldType.some((f) => f === e.type))
            .map((e) => {
              return {
                ...e,
                label: e.name,
                value: e.key,
              };
            });
        },
      },
      hidden: (widget: IProcessParameterCard) => {
        return !widget.props.deviceGroupFormModelKey;
      },
    },
    {
      component: 'ref-form-editor',
      name: 'batchRefForm',
      label: '_kit.pageDesigner.txnDataCollection.batchRefForm',
      group: PropGroup.ADVANCED,
      required: true,
      _config: {
        tips: '选择批次表单，批次表单中会有工艺、产品字段',
        bindModelKey: 'batchFormModelKey',
      },
      changeCallback: async (widget) => {
        widget.props.batchFields = undefined;
        widget.props.refSearchField = [];
      },
      onMounted(widget: IProcessParameterCard) {
        if (!widget.props?.batchRefForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.batchRefForm,
        );
        if (!formWidget) {
          widget.props.batchRefForm = undefined;
        }
      },
    },

    {
      component: 'select-editor',
      name: 'batchFields',
      label: 'sys.pageDesigner.associatedFields',
      required: true,
      group: PropGroup.ADVANCED,
      changeCallback: async (widget) => {
        widget.props.refSearchField = cloneDeep(widget.props.batchFields);
      },
      _config: {
        tips: '选择批次表单对应模型的工艺、产品字段',
        multiple: true,
        showSearch: true,
        options: async (widget) => {
          const data = (await getFieldMetaList({ modelKey: widget.props.batchFormModelKey })) || [];
          return data
            ?.filter((e) => resultFieldType.some((f) => f === e.type))
            .map((e) => {
              return {
                ...e,
                label: e.name,
                value: e.key,
              };
            });
        },
      },
      hidden: (widget: IProcessParameterCard) => {
        return !widget.props.batchFormModelKey;
      },
    },
    {
      component: 'sorts-editor',
      label: '',
      name: 'collation',
      group: PropGroup.LISTDATA,
      _config: {
        label: '工艺参数卡排序字段',
        getModelKey: (widget: IProcessParameterCard) => {
          return widget.props.model;
        },
      },
      hidden(widget: IProcessParameterCard) {
        return !widget.props.model;
      },
    },
    // 最多显示个数
    {
      component: 'number-editor',
      name: 'maxLength',
      label: '项最多显示个数',
      group: PropGroup.SHOW,
      formItemClass: 'in-row-editor',
      _config: {
        min: 1,
        max: 20,
      },
    },
    {
      component: 'switch-editor',
      name: 'defaultExpand',
      label: '卡片整体默认展开',
      group: PropGroup.SHOW,
    },
    ...(displayEditor as any),
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'color-editor',
      name: 'backgroundColor',
      label: 'sys.pageDesigner.backgroundColor',
      group: StyleGroup.BACKGROUND,
    },
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
  ];

  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}

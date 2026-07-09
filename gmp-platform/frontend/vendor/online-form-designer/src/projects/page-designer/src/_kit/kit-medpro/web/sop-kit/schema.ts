import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
  EntityModelCategoryEnum,
  sortTypeEnum,
} from '@gct/runtime';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { resultFieldType } from '/@page-designer/schema/web/other/select-search';
import { cloneDeep } from 'lodash-es';

export interface SopKitProps extends LowCodeWidget.WidgetProps {
  /**
   * 关联表单
   */
  model: string;
  modelKey: string;
  deviceRefForm?: string;
  deviceFields?: string;
  deviceFormModelKey?: string;
  batchRefForm?: string;
  batchFields?: string;
  batchFormModelKey?: string;
  refFormField: string[];
  refSearchField: string[];
  noNeedAutoQuery: boolean;
  openNew: boolean;
  collation: { collationField: string; collationSort: sortTypeEnum }[];
}

export interface ISopKit extends LowCodeWidget.BasicSchema {
  props: SopKitProps;
}

export default class MedProSopKitPluginConfig implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./sop-kit-designer.vue'));

  schema: ISopKit = {
    id: '',
    platform: Platform.WEB,
    name: 'sop',
    alias: '',
    type: 'medpro' + KitType.SOP_KIT,
    display: DisplayEnums.BLOCK,
    displayName: 'SOP',
    icon: 'icon-fuzhibanben',
    props: {
      model: 'em_sop_usage_rule',
      deviceRefForm: undefined,
      deviceFields: undefined,
      deviceFormModelKey: undefined,
      batchRefForm: undefined,
      batchFields: undefined,
      batchFormModelKey: undefined,
      refFormField: [],
      refSearchField: [],
      modelKey: 'em_sop_usage_rule',
      noNeedAutoQuery: false,
      openNew: false,
      collation: [
        {
          collationField: 'create_time_',
          collationSort: sortTypeEnum.DESC,
        },
      ],
      ...displayProps,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'select-editor',
      name: 'txnType',
      label: '事务类型',
      group: PropGroup.BUSINESS_CONFIG,
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
      name: 'deviceRefForm',
      label: '_kit.pageDesigner.txnDataCollection.deviceRefForm',
      group: PropGroup.BUSINESS_CONFIG,
      required: false,
      _config: {
        tips: '选择含有设备字段的表单',
        bindModelKey: 'deviceFormModelKey',
      },
      changeCallback: async (widget) => {
        widget.props.deviceFields = undefined;
      },
      onMounted(widget: ISopKit) {
        if (!widget.props?.deviceRefForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.deviceRefForm,
        );
        if (!formWidget) {
          widget.props.deviceRefForm = undefined;
        }
      },
    },

    {
      component: 'select-editor',
      name: 'deviceFields',
      label: '_kit.pageDesigner.txnDataCollection.deviceFields',
      required: true,
      group: PropGroup.BUSINESS_CONFIG,
      changeCallback: async (widget) => {
        widget.props.refFormField = [widget.props.deviceFields];
      },
      _config: {
        showSearch: true,
        tips: '选择设备表单对应模型的设备字段',
        options: async (widget) => {
          const data =
            (await getFieldMetaList({ modelKey: widget.props.deviceFormModelKey })) || [];
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
      hidden: (widget: ISopKit) => {
        return !widget.props.deviceFormModelKey;
      },
    },
    {
      component: 'ref-form-editor',
      name: 'batchRefForm',
      label: '_kit.pageDesigner.txnDataCollection.batchRefForm',
      group: PropGroup.BUSINESS_CONFIG,
      required: true,
      _config: {
        tips: '选择批次表单，批次表单中会有工艺、产品字段',
        bindModelKey: 'batchFormModelKey',
      },
      changeCallback: async (widget) => {
        widget.props.batchFields = undefined;
        widget.props.refSearchField = [];
      },
      onMounted(widget: ISopKit) {
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
      group: PropGroup.BUSINESS_CONFIG,
      changeCallback: async (widget) => {
        widget.props.refSearchField = cloneDeep(widget.props.batchFields);
      },
      _config: {
        multiple: true,
        showSearch: true,
        tips: '选择批次表单对应模型的工艺、产品字段',
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
      hidden: (widget: ISopKit) => {
        return !widget.props.batchFormModelKey;
      },
    },
    {
      component: 'switch-editor',
      name: 'openNew',
      label: 'sys.kit.openNew',
      required: false,
      group: PropGroup.BUSINESS_CONFIG,
    },
    {
      component: 'sorts-editor',
      label: '',
      name: 'collation',
      group: PropGroup.LISTDATA,
      _config: {
        label: '排序字段',
        getModelKey: (widget: ISopKit) => {
          return widget.props.model;
        },
      },
      hidden(widget: ISopKit) {
        return !widget.props.model;
      },
    },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'number-editor',
      label: 'sys.pageDesigner.maximumHeight',
      group: StyleGroup.LAYOUT,
      name: 'maxHeight',
      _config: {
        min: 200,
      },
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

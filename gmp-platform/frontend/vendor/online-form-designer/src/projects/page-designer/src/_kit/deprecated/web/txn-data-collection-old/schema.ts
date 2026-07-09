import {
  DisplayEnums,
  EntityModelCategoryEnum,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  sortTypeEnum,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import commonFieldEditorConfig from '/@page-designer/schema/common-config/common-field-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { resultFieldType } from '/@page-designer/schema/web/other/select-search';
import { cloneDeep } from 'lodash-es';

export interface TxnDataCollectionProps extends LowCodeWidget.WidgetProps {
  displayLabelText?: boolean;
  label?: string;
  model: string;
  readonly: boolean;
  txnType?: string;
  noNeedAutoQuery?: boolean;
  deviceRefForm?: string;
  deviceFields?: string;
  deviceFormModelKey?: string;
  batchRefForm?: string;
  batchFields?: string;
  batchFormModelKey?: string;
  refFormField: string[];
  refSearchField: string[];
  collation: { collationField: string; collationSort: sortTypeEnum }[];
}
interface ITxnDataCollection extends LowCodeWidget.BasicSchema {
  props: TxnDataCollectionProps;
}

export default class MedProTxnDataCollection implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./txn-data-collection-designer.vue'));
  kit: string[] = ['MEDPRO'];
  schema: ITxnDataCollection = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.txnDataCollect',
    alias: '',
    type: 'medpro' + KitType.TXN_DATA_COLLECTION,
    display: DisplayEnums.BLOCK,
    icon: 'icon-a-Datatable',
    props: {
      model: 'em_data_collection',
      readonly: false,
      txnType: undefined,
      noNeedAutoQuery: false,
      deviceRefForm: undefined,
      deviceFields: undefined,
      deviceFormModelKey: undefined,
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
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    ...commonFieldEditorConfig.getInputAttrEditor(['readonly']),
    /** 显示标题 */
    {
      component: 'checkbox-editor',
      name: 'displayLabelText',
      label: '',
      group: PropGroup.FIELD_CONFIG,
    },
    {
      component: 'text-editor',
      name: 'label',
      label: '标题名称',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        i18n: true,
        showCount: true,
      },
      hidden: (widget: ITxnDataCollection) => {
        return !widget.props.displayLabelText;
      },
    },
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
      hidden: (widget: ITxnDataCollection) => {
        return widget.props.noNeedAutoQuery;
      },
    },
    {
      component: 'ref-form-editor',
      name: 'deviceRefForm',
      label: '_kit.pageDesigner.txnDataCollection.deviceRefForm',
      group: PropGroup.ADVANCED,
      required: false,
      _config: {
        tips: '选择含有设备字段的表单',
        bindModelKey: 'deviceFormModelKey',
      },
      onMounted(widget: ITxnDataCollection) {
        if (!widget.props?.deviceRefForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.deviceRefForm,
        );
        if (!formWidget) {
          widget.props.deviceRefForm = undefined;
        }
      },
      hidden: (widget: ITxnDataCollection) => {
        return widget.props.noNeedAutoQuery;
      },
    },

    {
      component: 'select-editor',
      name: 'deviceFields',
      label: '_kit.pageDesigner.txnDataCollection.deviceFields',
      required: false,
      group: PropGroup.ADVANCED,
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
      hidden: (widget: ITxnDataCollection) => {
        return !widget.props.deviceFormModelKey;
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
      onMounted(widget: ITxnDataCollection) {
        if (!widget.props?.batchRefForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.batchRefForm,
        );
        if (!formWidget) {
          widget.props.batchRefForm = undefined;
        }
      },
      hidden: (widget: ITxnDataCollection) => {
        return widget.props.noNeedAutoQuery;
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
      hidden: (widget: ITxnDataCollection) => {
        return !widget.props.batchFormModelKey;
      },
    },
    {
      component: 'sorts-editor',
      label: '',
      name: 'collation',
      group: PropGroup.LISTDATA,
      _config: {
        label: '数据采集排序字段',
        getModelKey: (widget: ITxnDataCollection) => {
          return widget.props.model;
        },
      },
      hidden(widget: ITxnDataCollection) {
        return !widget.props.model;
      },
    },
    {
      component: 'switch-editor',
      name: 'noNeedAutoQuery',
      label: '无需自动关联查询',
      group: PropGroup.ADVANCED,
    },
    ...(displayEditor as any),
  ];

  events?: LowCodeWidget.EventsType[] = [
    {
      name: 'onLoaded',
      title: '_kit.pageDesigner.txnDataCollection.onLoaded',
      params: ['data', 'status',],
    },
  ];
}

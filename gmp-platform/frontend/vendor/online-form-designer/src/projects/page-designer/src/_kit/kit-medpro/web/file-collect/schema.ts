import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
  EntityModelCategoryEnum,
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

export interface FileCollectProps extends LowCodeWidget.WidgetProps {
  /**
   * 关联表单
   */
  modelKey: string;
  deviceRefForm?: string;
  deviceFields?: string;
  deviceFormModelKey?: string;
  batchRefForm?: string;
  batchFields?: string;
  batchFormModelKey?: string;
  refFormField: string[];
  refSearchField: string[];
  openNew: boolean;
  noNeedAutoQuery?: boolean;
}

export interface IFileCollect extends LowCodeWidget.BasicSchema {
  props: FileCollectProps;
}

export default class MedProFileCollectPluginConfig implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(() => import('./file-collect-designer.vue'));

  schema: IFileCollect = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.fileCollect',
    alias: '',
    type: 'medpro' + KitType.FILE_COLLECT,
    display: DisplayEnums.BLOCK,
    displayName: 'sys.kit.fileCollect',
    icon: 'icon-fuzhibanben',
    props: {
      deviceRefForm: undefined,
      deviceFields: undefined,
      deviceFormModelKey: undefined,
      batchRefForm: undefined,
      batchFields: undefined,
      batchFormModelKey: undefined,
      noNeedAutoQuery: false,
      refFormField: [],
      refSearchField: [],
      modeldata: {
        /**模型大类 */
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      modelKey: 'em_document_set',
      openNew: false,
      ...displayProps,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'switch-editor',
      name: 'noNeedAutoQuery',
      label: '无需自动关联查询',
      group: PropGroup.FILECOLLECT,
    },
    {
      component: 'ref-form-editor',
      name: 'deviceRefForm',
      label: '_kit.pageDesigner.txnDataCollection.deviceRefForm',
      group: PropGroup.FILECOLLECT,
      required: false,
      _config: {
        tips: '选择含有设备字段的表单',
        bindModelKey: 'deviceFormModelKey',
      },
      changeCallback: async (widget) => {
        widget.props.deviceFields = undefined;
      },
      onMounted(widget: IFileCollect) {
        if (!widget.props?.deviceRefForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.deviceRefForm,
        );
        if (!formWidget) {
          widget.props.deviceRefForm = undefined;
        }
      },
      hidden: (widget: IFileCollect) => {
        return widget.props.noNeedAutoQuery;
      },
    },

    {
      component: 'select-editor',
      name: 'deviceFields',
      label: '_kit.pageDesigner.txnDataCollection.deviceFields',
      required: true,
      group: PropGroup.FILECOLLECT,
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
      hidden: (widget: IFileCollect) => {
        return widget.props.noNeedAutoQuery || !widget.props.deviceFormModelKey;
      },
    },
    {
      component: 'ref-form-editor',
      name: 'batchRefForm',
      label: '_kit.pageDesigner.txnDataCollection.batchRefForm',
      group: PropGroup.FILECOLLECT,
      required: true,
      _config: {
        tips: '选择批次表单，批次表单中会有工艺、产品字段',
        bindModelKey: 'batchFormModelKey',
      },
      changeCallback: async (widget) => {
        widget.props.batchFields = undefined;
        widget.props.refSearchField = [];
      },
      onMounted(widget: IFileCollect) {
        if (!widget.props?.batchRefForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.batchRefForm,
        );
        if (!formWidget) {
          widget.props.batchRefForm = undefined;
        }
      },
      hidden: (widget: IFileCollect) => {
        return widget.props.noNeedAutoQuery;
      },
    },

    {
      component: 'select-editor',
      name: 'batchFields',
      label: 'sys.pageDesigner.associatedFields',
      required: true,
      group: PropGroup.FILECOLLECT,
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
      hidden: (widget: IFileCollect) => {
        return widget.props.noNeedAutoQuery || !widget.props.batchFormModelKey;
      },
    },
    {
      component: 'switch-editor',
      name: 'openNew',
      label: 'sys.kit.openNew',
      required: false,
      group: PropGroup.FILECOLLECT,
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
}

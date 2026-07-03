import { Component, defineAsyncComponent } from 'vue';
import {
  CreateType,
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
  sortTypeEnum,
} from '@gct/runtime';
import { styleEditorList } from '/@page-designer/schema/web/other/select-search';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '../../../../schema/common-config/display-editor-config';
import { useDesigner } from '../../../../hooks/useDesigner';
import { beginDrag } from '../../../../schema/utils';
import { ColumnTable } from '../../../../types/web/widget-types';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

export interface ContainerAssociateProps extends LowCodeWidget.WidgetProps {
  model: string;
  txnType: string;
  refSearchForm: string;
  refContainerField: string;
  refSearchFormModel: string;
  defaultModelKey?: string;
  showPagination: boolean;
  serialNumber: boolean;
  dataFilter: string;
  /**排序 */
  collation: { collationField: string; collationSort: sortTypeEnum }[];
  collationSort?: string;
  collationField?: string;
  pageSize: number;
}
export interface IContainerAssociate extends LowCodeWidget.BasicSchema {
  props: ContainerAssociateProps;
}

export default class MedProContainerAssociate implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./container-assocaite-designer.vue'));

  kit: string[] = ['MEDPRO'];
  schema: IContainerAssociate = {
    id: '',
    platform: Platform.WEB,
    name: '批次关联',
    alias: '',
    type: 'medpro' + KitType.CONTAINER_ASSOCIATE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-moxingguanlian',
    children: [[], []] as any as [ColumnTable[], ColumnTable[]],
    props: {
      model: 'em_container',
      refSearchForm: '',
      txnType: '',
      refContainerField: '',
      refSearchFormModel: 'em_container',
      defaultModelKey: 'em_container',
      showPagination: true,
      serialNumber: false,
      dataFilter: '',
      /**排序 */
      collation: [
        {
          collationField: 'create_time_',
          collationSort: sortTypeEnum.DESC,
        },
      ],
      pageSize: 10,
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
      label: '批次事务类型',
      group: PropGroup.TABLESELECT_CONFIG,
      required: true,
      _config: {
        tips: '选择事务类型作为业务的查询条件',
        options: () => [
          {
            label: '批次关联',
            value: 'em_txn_container_association',
          },
          {
            label: '解除批次关联',
            value: 'em_txn_container_disassociation',
          },
        ],
      },
    },
    {
      component: 'ref-form-editor',
      name: 'refSearchForm',
      label: '关联批次表单',
      group: PropGroup.TABLESELECT_CONFIG,
      required: true,
      _config: {
        tips: '选择含有批次的表单',
        filterFn: (item) => {
          return item.props.model === 'em_container';
        },
      },
      changeCallback: (widget: IContainerAssociate, value) => {
        widget.props.refContainerField = '';
      },
      onMounted(widget: IContainerAssociate) {
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
      group: PropGroup.TABLESELECT_CONFIG,
      required: true,
      _config: {
        tips: '选择批次表单对应模型的批次字段',
        modelKey: 'refSearchFormModel',
        // filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      },
      dependentProps: ['refSearchForm'],
    },
    // 选择模型字段
    {
      component: 'table-field-list-editor',
      name: 'root:children.0',
      label: '',
      group: PropGroup.FIELD,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        selectFiledBtnTitle: '选择左侧表格模型字段',
        modelByKey: 'defaultModelKey',
        showcheckbox: false,
        createField: (item, widget: IContainerAssociate) => {
          console.log(item, 'beginDrag');
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          });
          return fieldWidget;
        },
      },
    },
    {
      component: 'table-field-list-editor',
      name: 'root:children.1',
      label: '',
      group: PropGroup.FIELD,
      formItemStyle: { marginBottom: '12px' },
      _config: {
        selectFiledBtnTitle: '选择右侧表格模型字段',
        modelByKey: 'defaultModelKey',
        showcheckbox: false,
        createField: (item, widget: IContainerAssociate) => {
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          });
          return fieldWidget;
        },
      },
    },
    {
      component: 'switch-editor',
      name: 'showPagination',
      label: 'sys.pageDesigner.pagination',
      dependentProps: ['model'],
      group: PropGroup.SHOW,
    },
    {
      component: 'page-editor',
      name: 'pageSize',
      label: '',
      group: PropGroup.SHOW,
      dependentProps: ['model'],
      hidden(widget) {
        return !widget.props.model || !widget.props.showPagination;
      },
    },
    {
      component: 'switch-editor',
      name: 'serialNumber',
      label: 'sys.pageDesigner.showIndex',
      group: PropGroup.SHOW,
      hidden(widget: IContainerAssociate) {
        return !widget.props.model;
      },
    },
    // {
    //   component: 'data-filtering-new-editor',
    //   label: '',
    //   name: 'dataFilter',
    //   group: PropGroup.LISTDATA,
    //   _config: {
    //     label: '左侧表格数据筛选',
    //     tips: '限制模型关联的数据范围',
    //     modelKey: 'defaultModelKey',
    //   },
    //   dependentProps: ['model'],
    // },
    // {
    //   component: 'sorts-editor',
    //   label: '',
    //   name: 'collation',
    //   group: PropGroup.LISTDATA,
    //   _config: {
    //     label: '左侧表格排序字段',
    //     getModelKey: (widget: IContainerAssociate) => {
    //       return widget.props.model;
    //     },
    //   },
    //   hidden(widget: IContainerAssociate) {
    //     return !widget.props.model;
    //   },
    // },

    ...(displayEditor as any),
  ];

  events?: LowCodeWidget.EventsType[] = [
    {
      name: 'onChange',
      title: 'sys.pageDesigner.onChange',
      params: ['selectedData'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [...styleEditorList];

  beforeCreate?: LowCodeWidget.beforeCreate = async (widget) => {
    const data = (await getFieldMetaList({ modelKey: widget.props.defaultModelKey })) || [];
    const defaultFields = ['name_', 'container_modality_id_', 'product_id_', 'qty_'];
    const widgetList = defaultFields.map((key) => {
      const field = data.find((field) => field.key === key);
      return {
        key,
        // @ts-ignore
        ...beginDrag(field, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: widget.id,
        }),
      };
    });

    const leftCols = widgetList.map((item) => {
      return {
        ...item,
        props: {
          ...item.props,
          _preset: item.key === 'name_',
        },
      };
    });
    const rightCols = leftCols.filter((item) => ['name_', 'qty_'].includes(item.key));
    widget.children = [leftCols, rightCols];
  };
}

import { Component, defineAsyncComponent } from 'vue';
import {
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

export enum ECombineType {
  BASE = 'base',
  NEW = 'new',
}
export interface ContainerCombineProps extends LowCodeWidget.WidgetProps {
  model: string;
  combineType: string;
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
export interface IContainerCombine extends LowCodeWidget.BasicSchema {
  props: ContainerCombineProps;
}

export default class MedProContainerCombine implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./container-combine-designer.vue'));

  kit: string[] = ['MEDPRO'];
  schema: IContainerCombine = {
    id: '',
    platform: Platform.WEB,
    name: '批次合并',
    alias: '',
    type: 'medpro' + KitType.CONTAINER_COMBINE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-faqiweituo',
    children: [[], []] as any as [ColumnTable[], ColumnTable[]],
    props: {
      model: 'em_container',
      refSearchForm: '',
      combineType: '',
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
      name: 'combineType',
      label: '批次合并方式',
      group: PropGroup.TABLESELECT_CONFIG,
      required: true,
      _config: {
        options: () => [
          {
            label: '基于批次合并',
            value: ECombineType.BASE,
          },
          {
            label: '合并为新批次',
            value: ECombineType.NEW,
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
      },
      changeCallback: (widget: IContainerCombine, value) => {
        widget.props.refContainerField = '';
      },
      onMounted(widget: IContainerCombine) {
        if (!widget.props?.refSearchForm) return;
        const { allFormWidget } = useDesigner();
        const searchWidget = allFormWidget.value.find(
          (item) => item.id === widget.props?.refSearchForm,
        );
        if (!searchWidget) {
          widget.props.refSearchForm = '';
        }
      },
      hidden: (widget) => {
        return widget.props.combineType === ECombineType.NEW;
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
      },
      dependentProps: ['refSearchForm'],
      hidden: (widget) => {
        return widget.props.combineType === ECombineType.NEW;
      },
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
        createField: (item, widget: IContainerCombine) => {
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
        createField: (item, widget: IContainerCombine) => {
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
      hidden(widget: IContainerCombine) {
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
    //     getModelKey: (widget: IContainerCombine) => {
    //       return widget.props.model;
    //     },
    //   },
    //   hidden(widget: IContainerCombine) {
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
    const defaultFields = ['name_', 'qty_'];
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

    const rightCols = widgetList.map((item) => {
      return {
        ...item,
        props: {
          ...item.props,
          _preset: item.key === 'name_',
        },
      };
    });
    /** 右侧列表字段： [name_, qty_, combine_qty_(待合并数量-批次合并明细表), close_when_empty_(数量为0时关闭-批次合并明细表)]*/
    const leftCols = rightCols.filter((item) => ['name_'].includes(item.key));
    widget.children = [leftCols, rightCols];
  };
}

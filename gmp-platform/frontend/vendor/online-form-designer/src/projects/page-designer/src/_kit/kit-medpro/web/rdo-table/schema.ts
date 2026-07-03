import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  FormComponents,
  EntityModelTypeEnum,
  MaterialEnum,
  FIELD_TYPE,
  CreateType,
  sortTypeEnum,
  ButtonType,
  StyleGroup,
  operateSysEnums,
} from '@gct/runtime';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { beginDrag, createWidgetByType } from '/@page-designer/schema/utils';
import { DataTable } from '/@page-designer/types/web';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
import { deepMerge } from '/@/utils';

export interface ITxnDataCollection extends LowCodeWidget.BasicSchema {
  children: [any, any, any, any, any];
  props: {
    model: string;
    /**rdo 下面的父标识key 之前默认是name_ */
    rdoUniqueFieldKey?: string;
    /**关联查询 */
    refSearch?: string;
    /**分页 */
    pageSize: number;
    /**排序 */
    collation: { collationField: string; collationSort: sortTypeEnum }[];
    /**过滤表达式 */
    datafilter: { key: string; value: string }[] | { dataRule: string; dataRuleConfig: string };
    /**初始化加载 */
    initLoad: boolean;
    /**刷新当前 */
    currentReload: boolean;
    /**自定义搜索条件 */
    customHeader: boolean;
    /**全屏 */
    fullScreen: boolean;
    /**表格序号 */
    serialNumber: boolean;
    exp: string;
    /**表头排序 */
    headerSort: boolean;
    /**默认展开 */
    defaultExpand: boolean;
  } & LowCodeWidget.DisplayProps;
}

const calcPosTag = (data: IData) => {
  const { pos, versionMode } = data;
  if (pos === 0) {
    return versionMode === 0 ? 'row.0' : 'row.1';
  }
  return pos === 1 ? 'header' : 'batch';
};

export default class MedProRdoTableConfig implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./rdo-table-designer.vue'));
  kit: string[] = ['MEDPRO', 'TRAINING', 'eDHR'];
  schema: ITxnDataCollection = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.rdotable',
    alias: '',
    type: 'medpro' + KitType.RDO_TABLE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-a-yinyongshuju2',
    children: [{}, {}, {}, {}, {}],
    props: {
      model: '',
      rdoUniqueFieldKey: '',
      currentReload: false,
      customHeader: false,
      fullScreen: false,
      serialNumber: false,
      headerSort: true,
      defaultExpand: false, // 默认展开
      initLoad: true,
      autoResize: false,
      refSearch: '',
      pageSize: 10,
      collation: [
        {
          collationField: 'create_time_',
          collationSort: sortTypeEnum.DESC,
        },
      ],
      datafilter: {
        dataRule: '',
        dataRuleConfig: '',
      },
      exp: '',
      levelHeaderGrouping: [],
      multiLevelHeader: false,
      ...displayProps,
    },
    style: {
      tableheight: 300,
      tableheightConfigure: undefined,
    },
    events: {},
    formItem: false,
  };
  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'model-editor',
      name: 'model',
      label: 'sys.pageDesigner.model',
      group: PropGroup.Table,
      required: true,
      async changeCallback(widget: ITxnDataCollection, value) {
        const fieldList =
          (await getFieldMetaList({
            modelKey: value,
          })) || [];
        const res = fieldList.find((i) => i.rdoUniqueFieldKey) || {};
        const rdo_name = res.name || $t('sys.kit.name_');
        const rdo_key = res.key || 'table_name_';
        const fieldWidget = beginDrag(
          {
            type: FIELD_TYPE.TEXT,
            key: rdo_key,
            name: rdo_name,
            modelType: EntityModelTypeEnum.RDO,
            createType: CreateType.BUILTIN,
            rdoUniqueFieldKey: true,
          },
          {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          },
        );
        fieldWidget.props.label = fieldWidget.alias;
        fieldWidget.props._preset = true;
        fieldWidget.props.fieldReadonly = true;
        fieldWidget.isField = false;
        widget.children![1].children = [fieldWidget];
        widget.children![0].children = initBaseButton(widget);
        widget.props.refSearch = '';
        widget.props.rdoUniqueFieldKey = res.key;
      },
      _config: {
        type: `${EntityModelTypeEnum.RDO},${EntityModelTypeEnum.WORKFLOW}`,
        category: 'entity',
      },
    },
    {
      component: 'select-editor',
      name: 'refSearch',
      label: 'sys.pageDesigner.refSearch',
      group: PropGroup.Table,
      dependentProps: ['model'],
      _config: {
        options: (widget) => {
          const { getWidgetByScope } = useDesigner();
          return (
            getWidgetByScope(FormComponents.Search)
              // .filter((v) => v.props.model == widget.props.model)
              .map((i) => {
                return { label: `${$t(i.name)} ${i.id}`, value: i.id };
              })
          );
        },
      },
    },
    {
      component: 'page-editor',
      name: 'pageSize',
      label: '',
      group: PropGroup.SHOW,
      dependentProps: ['model'],
      hidden(widget) {
        return !widget.props.model;
      },
    },
    {
      component: 'switch-editor',
      name: 'initLoad',
      label: 'sys.pageDesigner.initializeLoad',
      dependentProps: ['model'],
      group: PropGroup.SHOW,
    },
    {
      component: 'switch-editor',
      name: 'serialNumber',
      label: 'sys.pageDesigner.displayTableNumber',
      dependentProps: ['model'],
      group: PropGroup.SHOW,
    },
    {
      component: 'switch-editor',
      name: 'fullScreen',
      label: 'sys.pageDesigner.fullScreen',
      group: PropGroup.SHOW,
      hidden(widget) {
        return !widget.props.model;
      },
    },

    {
      component: 'switch-editor',
      name: 'autoResize',
      label: '自适应',
      group: PropGroup.SHOW,
      kit: ['eDHR'],
      hidden(widget) {
        return !widget.props.model;
      },
    },
    {
      component: 'switch-editor',
      name: 'currentReload',
      label: 'sys.pageDesigner.currentReload',
      group: PropGroup.SHOW,
      hidden(widget) {
        return !widget.props.model;
      },
    },
    {
      component: 'switch-editor',
      name: 'customHeader',
      label: 'sys.pageDesigner.customHeader',
      group: PropGroup.SHOW,
      hidden(widget) {
        return !widget.props.model;
      },
    },
    {
      component: 'switch-editor',
      name: 'headerSort',
      label: 'sys.pageDesigner.headerSort',
      group: PropGroup.SHOW,
      onMounted(widget) {
        if (widget.props.headerSort == null) {
          widget.props.headerSort = true;
        }
      },
      hidden(widget) {
        return !widget.props.model;
      },
    },
    {
      component: 'switch-editor',
      name: 'defaultExpand',
      label: 'sys.pageDesigner.defaultExpand',
      group: PropGroup.SHOW,
      hidden(widget) {
        return !widget.props.model;
      },
    },

    {
      component: 'data-filtering-new-editor',
      label: '',
      name: 'datafilter',
      group: PropGroup.LISTDATA,
      dependentProps: ['model'],
      _config: {
        modelKey: 'model',
        cascadeField: true,
      },
    },
    {
      component: 'switch-editor',
      name: 'multiLevelHeader',
      label: 'sys.pageDesigner.multiLevelHeader',
      group: PropGroup.FIELD,
      dependentProps: ['model'],
    },
    {
      component: 'field-level-editor',
      name: 'levelHeaderGrouping',
      label: '',
      group: PropGroup.FIELD,
      saveHook: (widget) => {
        if (!widget.props.multiLevelHeader) {
          widget.props.levelHeaderGrouping = [];
        }
      },
      hidden: (widget) => !widget.props.multiLevelHeader,
    },
    {
      component: 'table-field-list-editor',
      name: 'root:children.1.children',
      label: '',
      group: PropGroup.FIELD,
      hidden(widget) {
        return !widget.props.model;
      },
      formItemStyle: { marginBottom: '12px' },
      _config: {
        showcheckbox: false,
        createField: (item, widget: DataTable) => {
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          });
          fieldWidget.props.fieldReadonly = true;
          return fieldWidget;
        },
        excludeFieldKey: (widget) => {
          return [widget.props.rdoUniqueFieldKey || 'name_'];
        },
      },
    },
    {
      component: 'gct-table-button-group-editor',
      label: '',
      dependentProps: ['model'],
      name: {
        headerRight: {
          value: 'root:children.2.children',
          visibleButtons: 'root:children.2.props.visibleButtons',
        },
        columnsRdo: {
          parent: {
            value: 'root:children.0.children.0.children',
            visibleButtons: 'root:children.0.children.0.props.visibleButtons',
          },
          child: {
            value: 'root:children.0.children.1.children',
            visibleButtons: 'root:children.0.children.1.props.visibleButtons',
          },
        },
      },
      group: PropGroup.LISTBUTTON,
      _config: {
        /**添加按钮的回调 */
        eventCallback(widget: any) {
          widget.parentComponent = FormComponents.MedProRdoTable;
        },
        modelKey: 'model',
        headerRightButton: (widget) => {
          return [
            FormComponents.CustomButton,
            FormComponents.ImportButton,
            FormComponents.ExportButton,
          ];
        },
        columnsRdoButton: [
          [
            FormComponents.CustomButton,
            FormComponents.SubTableDeleteBtn,
            FormComponents.SubTableCopyBtn,
            FormComponents.CreateVersionButton,
          ],
          (widget) => {
            const { supportProcess } = widget.props.modeldata || {};
            if (supportProcess) {
              return [
                FormComponents.CustomButton,
                FormComponents.SubTableEditBtn,
                FormComponents.SubTableDeleteBtn,
                FormComponents.CopyVersionButton,
                FormComponents.TableInfoButton,
                FormComponents.TableApproveButton,
                FormComponents.TableLinkButton,
                FormComponents.UseinfoButton,
                FormComponents.ModelingButton,
              ];
            }
            return [
              FormComponents.CustomButton,
              FormComponents.SubTableEditBtn,
              FormComponents.SubTableDeleteBtn,
              FormComponents.CopyVersionButton,
              FormComponents.TableInfoButton,
              FormComponents.TableLinkButton,
              FormComponents.UseinfoButton,
              FormComponents.ModelingButton,
            ];
          },
        ],
      },
    },
    // {
    //   component: 'gct-table-add-button-editor',
    //   label: '',
    //   name: {
    //     list: {
    //       row: ['root:children.0.children.0', 'root:children.0.children.1'],
    //       header: 'root:children.2',
    //       batch: 'root:children.3',
    //     },
    //     cmpId: 'root:id',
    //     model: 'model',
    //   },
    //   group: PropGroup.LISTBUTTON,
    //   dependentProps: ['model'],
    //   _config: {
    //     calcPosTag,
    //     options,
    //     module: PageTypeEnum.WEB,
    //     createField: () => {
    //       const widget = createWidgetByType(FormComponents.CustomButton as any);
    //       widget.props.title = '按钮';
    //       return widget;
    //     },
    //     defaultButtonType: {
    //       hasIcon: false,
    //       hasText: true,
    //       type: ButtonType.LINK,
    //       versionMode: 0,
    //     },
    //   },
    // },
    // {
    //   component: 'gct-table-button-config-editor',
    //   label: '',
    //   name: {
    //     list: {
    //       header: 'root:children.2',
    //       row: ['root:children.0.children.0', 'root:children.0.children.1'],
    //     },
    //     cmpId: 'root:id',
    //     model: 'model',
    //   },
    //   group: PropGroup.LISTBUTTON,
    //   dependentProps: ['model'],
    //   _config: {
    //     btnConfig: {
    //       row: {
    //         title: 'sys.pageDesigner.singleLineButton',
    //         children: [
    //           {
    //             title: 'sys.pageDesigner.singleLineButton',
    //             subTitle: 'sys.pageDesigner.parentVersion',
    //             defaultMaxCount: 3,
    //             max: 5,
    //             desc: true,
    //             options,
    //             calcPosTag,
    //           },
    //           {
    //             title: 'sys.pageDesigner.singleLineButton',
    //             subTitle: 'sys.pageDesigner.childVersion',
    //             defaultMaxCount: 3,
    //             max: 5,
    //             desc: true,
    //             options,
    //             calcPosTag,
    //           },
    //         ],
    //       },
    //       header: {
    //         title: 'sys.pageDesigner.headerButton',
    //         defaultMaxCount: 3,
    //         max: 5,
    //         desc: true,
    //         options,
    //         calcPosTag,
    //       },
    //     },
    //     calcPosTag,
    //   },
    // },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'cellClickEvent',
      title: 'sys.pageDesigner.cellClickEvent',
      params: ['value'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'table-height-editor',
      name: { number: 'tableheight', type: 'tableheightConfigure' },
      label: '',
      group: StyleGroup.SHOW_PROP,
    },
    // {
    //   component: 'number-editor',
    //   label: 'sys.pageDesigner.maximumHeight',
    //   group: StyleGroup.LAYOUT,
    //   name: 'maxHeight',
    //   _config: {
    //     min: 200,
    //   },
    // },
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
  ];

  beforeCreate: LowCodeWidget.beforeCreate = (widget: ITxnDataCollection) => {
    const ope = createWidgetByType(FormComponents.DataTableOpe);
    ope.preLocation = widget.id;
    ope.style.columnwidth = 220;
    ope.children = initBaseButton(widget);
    /**新版按钮组标识 */
    ope.renewal = true;
    widget.children = [
      ope,
      {
        alias: '字段组',
        preLocation: widget.id,
        children: [],
      },
      {
        alias: '头部按钮',
        preLocation: widget.id,
        props: {
          visibleButtons: 5,
        },
        children: [],
      },
    ];
  };
  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}
function initBaseButton(widget) {
  return [
    {
      alias: '父按钮组',
      preLocation: widget.id,
      props: {
        visibleButtons: 3,
      },
      children: parentButtons.map((item) => initButton(item, widget)),
    },
    {
      alias: '子按钮组',
      preLocation: widget.id,
      props: {
        visibleButtons: 3,
      },
      children: childButtons.map((item) => initButton(item, widget)),
    },
  ];
}
const initButton = (type: FormComponents, tablewidget: ITxnDataCollection) => {
  const widget = createWidgetByType(type);
  widget.props.type = 'link';
  widget.preLocation = tablewidget?.id;
  widget.props.pos = 0;
  widget.props.model = tablewidget.props.model;
  widget.props.modeldata = tablewidget.props.modeldata;
  widget.parentComponent = FormComponents.MedProRdoTable;
  return widget;
};

// const options = () => {
//   return [
//     operateSysEnums.COLUMNDELETE,
//     operateSysEnums.DETAILS,
//     operateSysEnums.COLUMNLINK,
//     operateSysEnums.VERSION_COPY,
//     operateSysEnums.VERSION_CREATE,
//     operateSysEnums.COPY,
//     operateSysEnums.EDIT,
//     operateSysEnums.USAGEINFORMATION,
//     operateSysEnums.MODELINGTRACEABILITY,
//     operateSysEnums.IMPORT,
//     operateSysEnums.EXPORT,
//   ];
// };

const parentButtons: FormComponents[] = [
  FormComponents.SubTableCopyBtn,
  FormComponents.SubTableDeleteBtn,
  FormComponents.CreateVersionButton,
];
const childButtons: FormComponents[] = [
  FormComponents.SubTableEditBtn,
  FormComponents.SubTableDeleteBtn,
  FormComponents.CopyVersionButton,
  FormComponents.TableInfoButton,
];

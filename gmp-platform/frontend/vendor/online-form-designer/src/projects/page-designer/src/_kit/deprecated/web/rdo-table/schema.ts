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
import { KitType } from '../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { beginDrag, createWidgetByType } from '/@page-designer/schema/utils';
import { DataTable } from '/@page-designer/types/web';
import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
import { deepMerge } from '/@/utils';

export interface ITxnDataCollection extends LowCodeWidget.BasicSchema {
  children: [any, any, any, any, any];
  props: {
    model: string;
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
  } & LowCodeWidget.DisplayProps;
}

const calcPosTag = (data: IData) => {
  const { pos, versionMode } = data;
  if (pos === 0) {
    return versionMode === 0 ? 'row.0' : 'row.1';
  }
  return pos === 1 ? 'header' : 'batch';
};

export class RdoTableConfig implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./rdo-table-designer.vue'));
  kit: string[] = ['MEDPROOLD'];
  schema: ITxnDataCollection = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.rdotable',
    alias: '',
    type: KitType.RDO_TABLE,
    display: DisplayEnums.BLOCK,
    icon: 'icon-a-yinyongshuju2',
    children: [{}, {}, {}, {}, {}],
    props: {
      model: '',
      currentReload: false,
      customHeader: false,
      fullScreen: false,
      autoResize: false,
      serialNumber: false,
      headerSort: true,
      initLoad: true,
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
      changeCallback(widget: ITxnDataCollection) {
        const fieldWidget = beginDrag(
          {
            type: FIELD_TYPE.TEXT,
            key: 'table_name_',
            name: $t('sys.kit.name_'),
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
        widget.children![1].children = [fieldWidget];
        // widget.children![0].children = initBaseButton(widget);
        widget.props.refSearch = '';
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
      component: 'data-filtering-new-editor',
      label: '',
      name: 'datafilter',
      group: PropGroup.LISTDATA,
      dependentProps: ['model'],
      _config: {
        modelKey: 'model',
      },
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
        excludeFieldKey: ['name_'],
      },
    },
    {
      component: 'gct-table-add-button-editor',
      label: '',
      name: {
        list: {
          row: ['root:children.0.children.0', 'root:children.0.children.1'],
          header: 'root:children.2',
          batch: 'root:children.3',
        },
        cmpId: 'root:id',
        model: 'model',
      },
      group: PropGroup.LISTBUTTON,
      dependentProps: ['model'],
      _config: {
        calcPosTag,
        options,
        module: PageTypeEnum.WEB,
        createField: () => {
          const widget = createWidgetByType(FormComponents.CustomButton as any);
          widget.props.title = '按钮';
          return widget;
        },
        defaultButtonType: {
          hasIcon: false,
          hasText: true,
          type: ButtonType.LINK,
          versionMode: 0,
        },
      },
    },
    {
      component: 'gct-table-button-config-editor',
      label: '',
      name: {
        list: {
          header: 'root:children.2',
          row: ['root:children.0.children.0', 'root:children.0.children.1'],
        },
        cmpId: 'root:id',
        model: 'model',
      },
      group: PropGroup.LISTBUTTON,
      dependentProps: ['model'],
      _config: {
        btnConfig: {
          row: {
            title: 'sys.pageDesigner.singleLineButton',
            children: [
              {
                title: 'sys.pageDesigner.singleLineButton',
                subTitle: 'sys.pageDesigner.parentVersion',
                defaultMaxCount: 3,
                max: 5,
                desc: true,
                options,
                calcPosTag,
              },
              {
                title: 'sys.pageDesigner.singleLineButton',
                subTitle: 'sys.pageDesigner.childVersion',
                defaultMaxCount: 3,
                max: 5,
                desc: true,
                options,
                calcPosTag,
              },
            ],
          },
          header: {
            title: 'sys.pageDesigner.headerButton',
            defaultMaxCount: 3,
            max: 5,
            desc: true,
            options,
            calcPosTag,
          },
        },
        calcPosTag,
      },
    },
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
      children: parentButtons.map((item) => initButton(item, 0)),
    },
    {
      alias: '子按钮组',
      preLocation: widget.id,
      props: {
        visibleButtons: 3,
      },
      children: childButtons.map((item) => initButton(item, 1)),
    },
  ];
}
const initButton = (obj: IData, versionMode: 0 | 1) => {
  let data = createWidgetByType(FormComponents.BaseButton as any);
  data = deepMerge(data, obj);
  data = deepMerge(data, {
    props: {
      hasIcon: false,
      hasText: true,
      type: ButtonType.LINK,
      versionMode,
      innerEvent: true,
    },
  });
  return data;
};

const options = () => {
  return [
    operateSysEnums.COLUMNDELETE,
    operateSysEnums.DETAILS,
    operateSysEnums.COLUMNLINK,
    operateSysEnums.VERSION_COPY,
    operateSysEnums.VERSION_CREATE,
    operateSysEnums.COPY,
    operateSysEnums.EDIT,
    operateSysEnums.USAGEINFORMATION,
    operateSysEnums.MODELINGTRACEABILITY,
    operateSysEnums.IMPORT,
    operateSysEnums.EXPORT,
  ];
};

const parentButtons: IData[] = [
  { alias: '复制', props: { title: '复制', sysMethedType: operateSysEnums.COPY, pos: 0 } },
  {
    alias: '删除',
    props: {
      title: '删除',
      sysMethedType: operateSysEnums.COLUMNDELETE,
      fontColor: '#ff4d4f',
      enableCustomColor: true,
      pos: 0,
    },
  },
  {
    alias: '版本创建',
    props: { title: '版本创建', sysMethedType: operateSysEnums.VERSION_CREATE, pos: 0 },
  },
];
const childButtons: IData[] = [
  { alias: '编辑', props: { title: '编辑', sysMethedType: operateSysEnums.EDIT, pos: 0 } },
  {
    alias: '删除',
    props: {
      title: '删除',
      sysMethedType: operateSysEnums.COLUMNDELETE,
      fontColor: '#ff4d4f',
      enableCustomColor: true,
      pos: 0,
    },
  },
  {
    alias: '版本复制',
    props: { title: '版本复制', sysMethedType: operateSysEnums.VERSION_COPY, pos: 0 },
  },
  { alias: '详情', props: { title: '详情', sysMethedType: operateSysEnums.DETAILS, pos: 0 } },
];

import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
  FormComponents,
  FIELD_TYPE,
  CreateType,
  searchListByFieldType,
  TableSearchTypeEnum,
  EntityModelCategoryEnum,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import { displayProps } from '/@page-designer/schema/common-config/display-editor-config';
import { createdSearchField, createWidgetByType } from '/@page-designer/schema/utils';
import { SearchWidgets, Search, DataTable, ButtonContainer } from '/@page-designer/types/web';
import { IQueryTab, QueryTabType } from '/@/components/QueryTab';
import { useMitt } from '/@page-designer/hooks/useMitt';
import { getDataTableWidget, getSearchWidget } from './logic';
import { IBusinessTable } from '../business-table/schema';
import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';

// import {
//   getBizServiceCrudList,
//   getBizServiceCrudViewModelList,
//   getBizServiceCrudDataModelList,
// } from '/@/apis/gct-apaas/BizServiceController';

export interface SearchTabProps extends LowCodeWidget.WidgetProps {
  model: string;
  countModel?: string;
  countModelCategory?: EntityModelCategoryEnum;
  countBizService?: string;
  /** 是否显示按钮组 */
  showButtonContainer: boolean;
  // 是否生成唯一配置id
  isGetUniqueConfigId?: boolean;
  /** 绑定生成唯一的配置id */
  uniqueConfigId?: string;
  /** 自定义标签页的筛选项集合 */
  tabSearchWidgets: SearchWidgets[];
  /** 内置分页配置数据 */
  builtinTabs: IQueryTab[];
}
export interface ISearchTab extends LowCodeWidget.BasicSchema {
  props: SearchTabProps;
  children: [Search, IBusinessTable, ButtonContainer];
}

export default class OrderManage implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./search-tab-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: ISearchTab = {
    id: '',
    platform: Platform.WEB,
    name: '查询标签',
    alias: '',
    type: KitType.SEARCH_TAB,
    display: DisplayEnums.BLOCK,
    icon: 'icon-jichengzhongxin1',
    props: {
      model: '',
      countModel: '',
      countBizService: '',
      showButtonContainer: false,
      isGetUniqueConfigId: false,
      uniqueConfigId: '',
      tabSearchWidgets: [],
      builtinTabs: [
        {
          id: 'task_all',
          name: '全部',
          icon: 'icon-park:notes',
          color: 'var(--ant-primary-color)',
          queryFields: {},
          type: QueryTabType.BUILTIN,
        },
        {
          id: 'task_finished',
          name: '已完成',
          icon: 'icon-park:file-success',
          color: 'var(--ant-success-color)',
          queryFields: {},
          type: QueryTabType.BUILTIN,
        },
        {
          id: 'task_running',
          name: '进行中',
          icon: 'icon-park:file-date',
          color: 'var(--ant-info-color)',
          queryFields: {},
          type: QueryTabType.BUILTIN,
        },
        {
          id: 'task_waiting',
          name: '未开始',
          icon: 'icon-park:file-tips',
          color: 'var(--van-tab-text-color)',
          queryFields: {},
          type: QueryTabType.BUILTIN,
        },
      ],
      ...displayProps,
    },
    children: [] as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    // 关联模型
    {
      component: 'model-editor',
      name: 'model',
      label: 'sys.pageDesigner.model',
      group: PropGroup.QUERY,
      required: true,
      changeCallback(widget: ISearchTab) {
        [getSearchWidget(widget), getDataTableWidget(widget)].forEach((child) => {
          Object.assign(child.props, {
            model: widget.props.model,
            modeldata: { ...widget.props.modeldata },
          });
        });
        console.log('changeCallback', widget);
      },
      _config: {
        type: 'NDO,BASE,TREE,RDO,WORKFLOW,CHECK_LIST,TXN_EXT', // 新版edhr需要
        category: 'entity,data,view',
      },
    },
    // !: 临时开启给SN管理挂载请求数据总数api
    // {
    //   component: 'select-editor',
    //   name: 'countBizService',
    //   label: '业务服务',
    //   required: false,
    //   group: PropGroup.QUERY,
    //   _config: {
    //     tips: '选择模型下的业务服务',
    //     showSearch: true,
    //     multiple: false,
    //     options: async (widget) => {
    //       const modelCategory = widget.props?.modeldata?.modelCategory;
    //       const getActionApi =
    //         modelCategory === 'view'
    //           ? getBizServiceCrudViewModelList
    //           : modelCategory === 'data'
    //             ? getBizServiceCrudDataModelList
    //             : getBizServiceCrudList;
    //       const serviceList = (await getActionApi({ modelKey: widget.props.model })) ?? [];
    //       return serviceList.map((service) => {
    //         return {
    //           label: service.name,
    //           value: service.key,
    //         };
    //       });
    //     },
    //   },
    //   changeCallback(widget) {
    //     widget.props.countModel = 'em_sn';
    //     widget.props.countModelCategory = EntityModelCategoryEnum.ENTITY;
    //     widget.props.countBizService = 'biz_manage_search';
    //   },
    //   dependentProps: ['model'],
    // },
    // 是否显示按钮组
    {
      component: 'switch-editor',
      name: 'showButtonContainer',
      label: '是否显示按钮组',
      group: PropGroup.QUERY,
    },
    // 是否生成唯一配置ID
    {
      component: 'switch-editor',
      name: 'isGetUniqueConfigId',
      label: '是否生成唯一配置ID',
      group: PropGroup.QUERY,
      changeCallback(widget: ISearchTab) {
        if (widget.props.isGetUniqueConfigId) {
          widget.props.uniqueConfigId = Date.now() + '';
        } else {
          widget.props.uniqueConfigId = '';
        }
        console.log('isGetUniqueConfigId', widget.props);
      },
    },
    // tab页配置查询字段
    {
      component: 'field-list-editor',
      name: 'tabSearchWidgets',
      label: '分页配置查询字段',
      group: PropGroup.QUERY,
      _config: {
        createField: (item, widget) => {
          const {
            key: field,
            id: fieldId,
            type,
            name: fieldName,
            bindInfo: bindModelKey,
            modelKey,
            mappingType,
            refModelType,
          } = item;
          const fieldType = [FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(type)
            ? mappingType
            : type;
          const label = fieldName;
          const fieldCodeChain = JSON.stringify({ modelKey: item.modelKey });
          const result = createdSearchField({
            field,
            fieldId,
            fieldType,
            label,
            fieldName,
            fieldCodeChain,
            bindModelKey,
            modelKey,
            refModelType,
            type,
            preLocation: widget.id,
          });
          console.log('配置的字段的结果', result);
          return result;
        },
        filterFn: (item) => {
          return (
            [CreateType.USER_DEFINED, CreateType.BUILTIN, CreateType.SYSTEM].includes(
              item.createType,
            ) && searchListByFieldType.includes(item.type)
          );
        },
        eventCallback: (w) => {
          const { setSelectedWidget } = useSelectedWidget();
          w && setSelectedWidget(w);
        },
      },
      dependentProps: ['model'],
    },
    // 内置分页配置数据
    {
      component: 'search-tab-editor',
      name: 'root:props',
      label: '内置分页配置数据',
      group: PropGroup.QUERY,
      dependentProps: ['model'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'number-editor',
      name: 'width',
      label: 'sys.width',
      group: StyleGroup.LAYOUT,
    },
    {
      component: 'number-editor',
      name: 'height',
      label: 'sys.height',
      group: StyleGroup.LAYOUT,
    },
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

  beforeCreate?: LowCodeWidget.beforeCreate = async (widget) => {
    const search = createWidgetByType(FormComponents.Search);
    const businessTable = createWidgetByType(KitType.BUSINESS_TABLE as any);
    const buttonContainer = createWidgetByType(FormComponents.ButtonContainer);
    const table = businessTable.children[0];

    const { mitt } = useMitt();
    const methodName = search.id + 'BeforeSearch';

    // 写入内置的查询前事件
    const methodContent = [
      `  const searchTab = CTX.$ref('${widget.id}');`,
      `  searchTab.handleSearchQuery(queryData);`,
    ].join('\n');
    mitt.emit('new-event', {
      methodName: methodName,
      params: 'queryData, extParams',
      content: methodContent,
    });
    search.events = { beforeSearch: { name: methodName, extraParams: {} } };

    // 样式调整
    // widget.style
    Object.assign(search.style, {
      marginTop: '16',
      marginBottom: '0',
      marginLeft: '16',
      marginRight: '16',
      paddingTop: '8',
      paddingBottom: '8',
      paddingLeft: '16',
      paddingRight: '16',
      borderAllRadius: '4',
      borderTopLeftRadius: '4',
      borderTopRightRadius: '4',
      borderBottomLeftRadius: '4',
      borderBottomRightRadius: '4',
      backgroundColor: '#F7F8FA',
    });

    Object.assign(table.style, {
      paddingTop: '16',
      paddingBottom: '16',
      paddingLeft: '16',
      paddingRight: '16',
    });

    // 修改表格的默认加载和查询关联
    table.props.initializeLoad = false;
    table.props.searchType = TableSearchTypeEnum.EXTERNAL;
    table.props.refSearch = search.id;
    table.props.serialNumber = false;

    widget.children[0] = search;
    widget.children[1] = businessTable;
    widget.children[2] = buttonContainer;
  };

  // 页面设计器配置
  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}

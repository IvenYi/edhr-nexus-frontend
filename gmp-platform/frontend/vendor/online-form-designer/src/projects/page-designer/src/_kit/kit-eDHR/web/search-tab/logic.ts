import { ISearchTab } from './schema';
import { useUserStore } from '/@/store/modules/user';
import { Search, DataTable } from '/@page-designer/types/web';
import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import { EntityModelCategoryEnum, FormComponents } from '@gct/runtime';
import { SERVICE_INVOKER } from '/@/utils/service';
import { CountRequestFn, QueryTabController } from '/@/components/QueryTab';
import { computed, nextTick, ref, watch } from 'vue';
import { isNil } from 'lodash-es';
import { useQueryfilter } from '/@page-designer/components/widgets/hooks/listhook';
import { KitType } from '../../../enums/kit-type/kit-type';

export function getSearchWidget(widget: ISearchTab) {
  return widget.children?.[0] as Search;
}

export function getDataTableWidget(widget: ISearchTab) {
  const tableWidget = widget.children?.[1]?.children?.[0] as DataTable;
  return tableWidget.type === FormComponents.DataTable ? tableWidget : null;
}

export function getUniqueConfigId(widget: ISearchTab) {
  const userInfoStore = useUserStore();
  const { isGetUniqueConfigId, uniqueConfigId } = widget.props;
  if (isGetUniqueConfigId && uniqueConfigId) {
    return `${userInfoStore.getUserInfo.userId}_${widget.id}_${uniqueConfigId}`;
  }
  return `${userInfoStore.getUserInfo.userId}_${widget.id}`;
}

export function useSearchTab(widget: ISearchTab) {
  const Event = getPageEvent();
  const configId = getUniqueConfigId(widget);
  const searchWidget = getSearchWidget(widget);
  const tableWidget = getDataTableWidget(widget);
  const modelKey = widget.props.model;
  const modelCategory = widget.props.modeldata?.modelCategory || EntityModelCategoryEnum.ENTITY;

  // 处理表格的数据筛选配置的默认查询条件
  const defaultQuery = {};
  if (tableWidget?.props?.datafilter) {
    const queryfilter = useQueryfilter(tableWidget.props.datafilter);
    Object.assign(defaultQuery, queryfilter.query);
  }

  const getSearchVm = async () => {
    return Event.getSyncComponent(searchWidget.id) as any;
  };

  const getTableVm = async () => {
    if (tableWidget) {
      return Event.getSyncComponent(tableWidget.id) as any;
    }
    //!从当前页面的所有widget里面查找，避免页面层级结构不一致导致的问题
    const allWidgets = Event?.context?.gctWidgets;
    const businessTable = Object.values(allWidgets).filter(
      (it) => it.type === KitType.BUSINESS_TABLE,
    );
    const dataTables = businessTable.map((w) => w?.children?.[0]);

    let _tableWidget: any = null;
    dataTables.forEach((w) => {
      if (document.getElementById(w.id)) {
        _tableWidget = w;
      }
    });
    if (!_tableWidget) return;
    return Event.getSyncComponent(_tableWidget.id) as any;
  };

  /** 根据配置生成的计算计数的请求方法 */
  let countRequest: CountRequestFn | undefined = undefined;
  /** 实体模型内置有count接口 */
  if (modelCategory === EntityModelCategoryEnum.ENTITY) {
    countRequest = async (query: IParams) => {
      const res = await SERVICE_INVOKER.post(
        {
          bsKey: 'count',
          modelCategory: modelCategory,
          modelKey: modelKey,
        },
        { query: { ...query, ...defaultQuery, ...extraQuery.value } },
      );
      return res as number;
    };
  } else if (modelCategory === EntityModelCategoryEnum.VIEW) {
    const { countBizService, countModel: countModelKey, countModelCategory } = widget.props;
    // 视图没有count接口，暂时使用listByPage接口
    countRequest = async (query: IParams) => {
      const res = await SERVICE_INVOKER.list(
        {
          bsKey: countBizService || 'listByPage',
          modelCategory: countModelCategory || modelCategory,
          modelKey: countModelKey || modelKey,
        },
        {
          query: { ...query, ...defaultQuery, ...extraQuery.value },
          pageNo: 1,
          pageSize: 9999,
        },
      );
      return res.totalCount;
    };
  }

  const queryTabC = new QueryTabController({
    configId,
    searchWidgets: widget.props.tabSearchWidgets,
    modelCategory: widget.props.modeldata!.modelCategory!,
    countRequest: countRequest,
    builtinTabs: widget.props.builtinTabs,
  });

  /** 当前激活的分页key */
  const activeKey = ref<string>();
  const showTabs = computed(() => queryTabC.state.tabs);
  const activeTab = computed(() => showTabs.value.find((i) => i.id === activeKey.value));
  const extraQuery = ref({});

  const init = async () => {
    await queryTabC.init();
    activeKey.value = showTabs.value[0].id;
  };

  const resetSearchWidget = async () => {
    const search = await getSearchVm();
    await nextTick();
    // 等待表格的实例完成
    await getTableVm();
    console.log('resetSearchWidget');
    search.setValueBySearch({});
    search.search();
  };

  watch(
    activeKey,
    (key) => {
      console.log('key', key);
      resetSearchWidget();
    },
    { immediate: true },
  );

  /**
   * 计算最终的查询数据
   * @param searchQuery 搜索表单的查询条件
   */
  const calcFinalQuery = (searchQuery) => {
    if (!activeTab.value) {
      console.error('没有选中分页');
      return;
    }
    const tabQuery = queryTabC.parseTabQuery(activeTab.value);
    for (const key in tabQuery) {
      if (isNil(searchQuery[key]) || searchQuery[key] === '') {
        searchQuery[key] = tabQuery[key];
      }
    }
  };

  async function handleTabsEdit() {
    await queryTabC.editConfig();
    resetSearchWidget();
  }

  /** 刷新当前页和标签页的计数 */
  const refreshCurrentAndCount = (isReset = true) => {
    if (isReset) resetSearchWidget();
    queryTabC.refreshTabsCount();
  };

  return {
    activeKey,
    showTabs,
    extraQuery,
    init,
    calcFinalQuery,
    handleTabsEdit,
    refreshCurrentAndCount,
  };
}

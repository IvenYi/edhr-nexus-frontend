import { ref, computed, reactive, nextTick, onBeforeMount } from 'vue';
import type { TablePaginationConfig } from 'ant-design-vue';

export type FetcherResult = {
  /** 展示的数据 table 或 tree  */
  data: any[];
  /** 总数 */
  totalCount: number;
  /** 高亮索引 */
  highlightIdx?: any | null;
};

export type FetcherFn = (opts: {
  keyword?: string;
  pageNo: number;
  pageSize: number;
}) => Promise<FetcherResult>;

interface IInitialParams {
  data: any;
  highlightIdx: any;
  total: number;
}

export function useSelectTable(fetcher: FetcherFn, initialParams: IInitialParams) {
  const xTable = ref<any>(null);
  const loading = ref(false);
  const tableData = ref<any[]>([]);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const xTableRef = computed(() => xTable.value?.getRef());

  const fetchTableData = async (keyword?: string) => {
    loading.value = true;
    try {
      const res = await fetcher({
        keyword,
        pageNo: pagination.current || 1,
        pageSize: pagination.pageSize || 20,
      });

      tableData.value = res.data ?? [];
      pagination.total = Number(res.totalCount ?? 0);
      await nextTick();
      // 尝试展开树（如果有该方法）
      xTableRef.value?.setAllTreeExpand?.(true);
      setCurrentRowHighlight(res.highlightIdx);
      return res;
    } catch (err) {
      tableData.value = [];
      pagination.total = 0;
      return { data: [], totalCount: 0, highlightIdx: null };
    } finally {
      loading.value = false;
    }
  };

  const search = async (keyword?: string) => {
    pagination.current = 1;
    return fetchTableData(keyword);
  };

  const onSizeChange = async (current: number, pageSize: number) => {
    pagination.current = current;
    pagination.pageSize = pageSize;
    await fetchTableData();
  };

  const setCurrentRowHighlight = (highlightIdx: any | null) => {
    if (!highlightIdx) return;
    const data = xTableRef.value?.data ?? tableData.value;

    if (Array.isArray(highlightIdx.index)) {
      const idxs = highlightIdx.index;
      if (!idxs.length) return;

      const targets = idxs.map((idx) => data?.[idx]).filter(Boolean);
      if (!targets.length) return;

      xTableRef.value?.setRadioRow(targets?.[0]);
      xTableRef.value?.setCheckboxRow(targets, true);
    } else if (typeof highlightIdx.parent === 'number') {
      const p = highlightIdx.parent;
      const c = highlightIdx.child;
      if (p === -1) return;
      const target = data?.[p]?.children?.[c] ?? data?.[p];

      if (target) {
        xTableRef.value?.setRadioRow(target);
      }
    }
  };

  onBeforeMount(async () => {
    if (initialParams.data.length) {
      tableData.value = initialParams.data;
      pagination.total = initialParams.total;
      await nextTick();
      setCurrentRowHighlight(initialParams.highlightIdx);
    } else {
      // 否则触发一次加载
      await fetchTableData();
    }
  });

  return {
    xTable,
    loading,
    tableData,
    pagination,
    search,
    onSizeChange,
    fetchTableData,
    setCurrentRowHighlight,
  };
}

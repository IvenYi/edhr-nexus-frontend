import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

export function useTableReload({ tableRef, modelKey, queryParams }) {
  const searchValue = ref('');
  /**
   * 表格数据
   */
  const tableData = ref<any[]>([]);
  const dictData = ref({});
  /**
   * 选中的值
   */
  const selectedVal = ref<any>();
  const pageNo = ref(1);
  const reload = ref(true);
  const pagerData = reactive({
    maxheight: 0,
    lastScrollLeft: 0,
  });

  /**
   * 分页
   * @param param
   */
  function scrollTable({ scrollHeight, scrollTop, bodyHeight, scrollLeft }) {
    if (scrollLeft !== pagerData.lastScrollLeft) {
      pagerData.lastScrollLeft = scrollLeft;
      return;
    }
    const total = scrollTop + bodyHeight;
    if (total >= scrollHeight && pagerData.maxheight < total) {
      pagerData.maxheight = total;
      pageNo.value += 1;
      getSourceData();
    }
  }
  const radioChangeEvent = (params) => {
    selectedVal.value = { ...params.row };
  };
  onMounted(async () => {
    await getSourceData();
    reload.value = false;
  });

  /**
   * 获取表格数据
   */
  async function getSourceData() {
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: modelKey,
        bsKey: 'rdoListByPage',
      },
      {
        exp: 'OR(name_.like,code_.like)',
        pageSize: 10,
        pageNo: pageNo.value,
        query: {
          'name_.like': searchValue.value,
          'code_.like': searchValue.value,
          ...(queryParams ?? {}),
        },
      },
    );
    tableData.value = res.data.map((i) => {
      const __CHILDREN__ =
        i.__CHILDREN__?.map((node) => {
          const { id_, base_id_ } = node;
          return {
            ...node,
            __VALUE__: `${base_id_}:${id_}`,
            __SELECTED_LABEL__: `${i.__LABEL__}:${node.__LABEL__}`,
          };
        }) || [];
      return { ...i, __CHILDREN__, __SELECTED_LABEL__: i.__LABEL__, __VALUE__: i.id_ };
    });
    dictData.value = res.dict;
    await nextTick();
    console.log('tableRef', tableData.value);
    tableRef.value?.setAllTreeExpand(true);
  }
  function formatter({ cellValue, column }) {
    const field = column.field;
    return dictData.value[field]?.[cellValue] || cellValue;
  }
  return {
    formatter,
    tableData,
    radioChangeEvent,
    selectedVal,
    searchValue,
    getSourceData,
    scrollTable,
    pageNo,
    reload,
  };
}

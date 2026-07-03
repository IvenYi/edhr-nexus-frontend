import { getInterfaceApi } from '@gct/runtime';
import { ControlStatusEnum } from '@gct/nocode-base';

export function useTableReload({ tableRef, moduleType, isControlled }) {
  const searchValue = ref('');
  /**
   * 表格数据
   */
  const tableData = ref<RowVO[]>([]);
  /**
   * 分类列表
   */
  const categoryList = ref([]);
  /**
   * 选中的值
   */
  const selectedVal = ref<RowVO>();
  const reload = ref(true);
  /**
   * 选中的分类
   */
  const selectCategory = ref({});
  const pageNo = ref(1);
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
    console.log('radioChangeEvent', params);
    const dataValue = { ...params.row };
    selectedVal.value = dataValue;
    checkedRow(selectedVal.value);
  };
  function checkedRow(record) {
    const rdoTable = tableRef.value;
    if (rdoTable) {
      rdoTable.setRadioRow(record);
    }
  }
  onMounted(async () => {
    const res = await getInterfaceApi.getCategoryList({ moduleType });
    console.log('getCategoryList', res);
    categoryList.value = res;
    selectCategory.value = res[0] || {};
    await getSourceData();
    reload.value = false;
  });

  /**
   * 获取表格数据
   */
  async function getSourceData() {
    const params: any = {
      categoryId: selectCategory.value.id,
      name: searchValue.value,
    };
    const data = await getInterfaceApi.getTmplsList({
      moduleType,
      ...params,
      pageNo: pageNo.value,
      pageSize: 10,
      controlStatus: isControlled ? ControlStatusEnum.CONTROLLED : undefined,
      configured: false,
    });
    tableData.value.push(...data.data);
    await nextTick();
    tableRef.value?.setAllTreeExpand(true);
  }
  return {
    tableData,
    radioChangeEvent,
    selectedVal,
    categoryList,
    selectCategory,
    searchValue,
    getSourceData,
    pageNo,
    scrollTable,
    reload,
  };
}

interface RowVO {
  id: string;
  baseId: string;
  refId: string;
  name: string;
  desc: string;
  modifier: string;
  modifyTime: string;
  default?: number;
  categoryId?: string;
  children?: RowVO[];
}

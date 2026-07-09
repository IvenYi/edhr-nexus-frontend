import { Ref, computed, ref } from 'vue';
import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';
import type { optionType } from '/@page-designer/components/widgets/mobile/__components__/listPopup/src/typing';

export type FetchApi = (params: { keyword?: string; pageNo: number; pageSize: number }) => Promise<{
  data: any[];
  finished: boolean;
}>;

export function useSelect(opts: {
  selectedIds: Ref<string[] | string>;
  fetchApi: FetchApi;
  multiple: Ref<boolean>;
  initialOptions: optionType[];
  onSelectChange?: (options: any) => void;
}) {
  const { selectedIds, fetchApi, multiple, initialOptions } = opts;

  const popupSelectOpts = ref<any[]>([]);
  const checkedOpts = ref<any[]>(initialOptions ?? []);

  /**下拉框异步请求统一入口 */
  const searchVal = ref<string>();

  /**
   * 弹窗查询回调
   * @param [params={}]
   * @return {*}
   */
  async function getOptionsByQuery(
    params: {
      keyword?: string;
      pageNo?: number;
    } = {},
  ) {
    console.log('getOptionsByQuery', params);
    const { keyword, pageNo } = params;
    if (searchVal.value !== keyword) {
      popupSelectOpts.value = [];
    }
    searchVal.value = keyword;
    const res = await fetchApi({
      keyword,
      pageNo,
      pageSize: 30,
    });
    if (!res) {
      return;
    }
    const valueList = res.data!;
    const finished = res.finished;
    valueList.forEach((i: any) => {
      if (!popupSelectOpts.value.find((j) => j.value === i.value)) {
        popupSelectOpts.value.push(i);
      }
    });
    return finished;
  }

  const { openListPopup } = createListPopup({
    api: getOptionsByQuery,
    options: popupSelectOpts,
    title: '选择',
    remote: true,
    lazy: true,
    showSearch: true,
    multiple: multiple.value,
    selectedOptions: checkedOpts,
  })!;

  /**
   * 打开选择弹窗
   */
  const openPopup = () => {
    openListPopup({
      ids: multiple.value ? selectedIds.value : selectedIds.value[0],
      callback({ a, checkOptions }) {
        console.log('popup close', a, checkOptions);
        selectedIds.value = a;
        checkedOpts.value = [...checkOptions];
        opts.onSelectChange?.(checkedOpts.value);
      },
    });
  };

  const labelValue = computed(() => {
    return checkedOpts.value
      .filter((i) => selectedIds.value.includes(i.value))
      .map((i) => i.label)
      .join(',');
  });

  return {
    openPopup,
    labelValue,
    checkedOpts,
  };
}
